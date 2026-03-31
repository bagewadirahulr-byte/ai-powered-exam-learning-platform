import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Missing GEMINI_API_KEY environment variable. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Standard text generation using Gemini's free model.
 */
export async function generateContentText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Ensures Gemini returns structural JSON.
 * Provide a prompt that specifically asks for a JSON response with a desired format.
 */
export async function generateContentJSON(prompt: string): Promise<unknown> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", text, error);
    throw new Error("AI returned invalid JSON structure.");
  }
}
