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
  const preferred = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let model = genAI.getGenerativeModel({ model: preferred });

  const prompt =
    "Transform the following messy lecture notes into a structured interactive coding lab. " +
    'Return only valid JSON with shape { "steps": [{ "title": string, "description": string, "code"?: string }] }. ' +
    "Use concise, actionable steps. Include code snippets when helpful. Notes:\n" +
    notes;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("404 Not Found")) {
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await model.generateContent(prompt);
    } else {
      throw e;
    }
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
    throw new Error("Model output is not valid JSON");
  }
}
