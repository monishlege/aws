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
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt =
    "Transform the following messy lecture notes into a structured interactive coding lab. " +
    'Return only valid JSON with shape { "steps": [{ "title": string, "description": string, "code"?: string }] }. ' +
    "Use concise, actionable steps. Include code snippets when helpful. Notes:\n" +
    notes;

  const result = await model.generateContent(prompt);
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
    throw new Error("Model output is not valid JSON");
  }
}
