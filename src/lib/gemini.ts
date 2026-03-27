// ============================================
// Gemini AI Client (Phase 4)
// Connects to Google Gemini API
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  // We won't throw an error immediately on import because the app needs to build
  console.warn("⚠️ Missing GEMINI_API_KEY environment variable. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIza_placeholder");

/**
 * Standard text generation using the fast and cost-effective flash model.
 */
export async function generateContentText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

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
