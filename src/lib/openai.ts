import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ Missing OPENAI_API_KEY environment variable. AI features will fail.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

/**
 * Standard text generation using OpenAI's fast and cost-effective model.
 */
export async function generateContentText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Ensures OpenAI returns structural JSON.
 * Provide a prompt that specifically asks for a JSON response with a desired format.
 */
export async function generateContentJSON(prompt: string): Promise<unknown> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse OpenAI response as JSON:", text, error);
    throw new Error("AI returned invalid JSON structure.");
  }
}
