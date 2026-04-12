// ============================================
// Gemini AI Client — Content Generation Engine
// Retry logic with exponential backoff + model fallback chain
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Missing GEMINI_API_KEY environment variable. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- Model fallback chain (if primary is overloaded, try the next) ---
const MODEL_CHAIN = ["gemini-flash-lite-latest", "gemini-flash-latest"];
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1500;

/**
 * Helper: delays execution (exponential backoff).
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: checks if an error is a retryable API error (503/429).
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("service unavailable") ||
      msg.includes("resource exhausted") ||
      msg.includes("high demand") ||
      msg.includes("overloaded")
    );
  }
  return false;
}

/**
 * Helper: checks if a model might not exist yet (404 error).
 */
function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("404 Not Found") || error.message.includes("is not found for API version");
  }
  return false;
}

/**
 * Standard text generation with retry + model fallback.
 */
export async function generateContentText(prompt: string): Promise<string> {
  let lastError: unknown = null;
  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Trying ${modelName} (attempt ${attempt + 1})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[Gemini] ${modelName} returned retryable error. Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        if (isRetryableError(error) || isNotFoundError(error)) {
          console.warn(`[Gemini] ${modelName} exhausted retries or not found. Trying next model...`);
          break; // Try next model in chain
        }
        throw error; // Non-retryable error — throw immediately
      }
    }
  }
  const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`AI service is temporarily unavailable. All models failed. Last API Error: ${errorMsg}`);
}

/**
 * Ensures Gemini returns structural JSON — with retry + model fallback.
 */
export async function generateContentJSON(prompt: string): Promise<unknown> {
  let lastError: unknown = null;
  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] JSON mode — Trying ${modelName} (attempt ${attempt + 1})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        // Sometimes Gemini wraps JSON output in markdown blocks even with responseMimeType set
        text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

        try {
          return JSON.parse(text);
        } catch {
          console.error(`[Gemini] ${modelName} returned invalid JSON:`, text.slice(0, 200));
          throw new Error("AI returned invalid JSON structure.");
        }
      } catch (error) {
        lastError = error;
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[Gemini] ${modelName} returned retryable error. Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        if (isRetryableError(error) || isNotFoundError(error)) {
          console.warn(`[Gemini] ${modelName} exhausted retries or not found. Trying next model...`);
          break; // Try next model in chain
        }
        throw error; // Non-retryable error — throw immediately
      }
    }
  }
  const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`AI service is temporarily unavailable. All models failed. Last API Error: ${errorMsg}`);
}

