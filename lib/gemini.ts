import { GoogleGenerativeAI } from "@google/generative-ai";

export type LabStep = {
  title: string;
  description: string;
  code?: string;
};

export type LabResponse = {
  steps: LabStep[];
};

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateLabFromNotes(notes: string): Promise<LabResponse> {
  const candidates = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
  ];
  let lastError: unknown;
  let model;
  let result;
  for (const m of candidates) {
    try {
      model = genAI.getGenerativeModel({ model: m });
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Transform the following messy lecture notes into a structured interactive coding lab. " +
                  'Return only valid JSON with shape { "steps": [{ "title": string, "description": string, "code"?: string }] }. ' +
                  "Use concise, actionable steps. Include code snippets when helpful. Notes:\n" +
                  notes,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      break;
    } catch (e) {
      lastError = e;
    }
  }
  if (!result) {
    throw lastError instanceof Error ? lastError : new Error("Generation failed");
  }

  const text = result.response.text().trim();

  try {
    const parsed = JSON.parse(text);
    return parsed as LabResponse;
  } catch {
    const fence = /```json([\\s\\S]*?)```/i.exec(text);
    if (fence && fence[1]) {
      const parsed = JSON.parse(fence[1]);
      return parsed as LabResponse;
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = text.slice(start, end + 1);
      const parsed = JSON.parse(sliced);
      return parsed as LabResponse;
    }
    throw new Error("Model output is not valid JSON");
  }
}
