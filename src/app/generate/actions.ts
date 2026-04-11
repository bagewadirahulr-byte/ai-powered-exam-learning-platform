"use server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, getUserCredits, saveGeneratedContent, deductCredits } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { generateContentJSON } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Server Action to trigger AI study material generation synchronously.
 */
export async function generateContent(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const topic = formData.get("topic") as string;
  const type = formData.get("type") as "notes" | "quiz" | "flashcards" | "qna";
  const level = formData.get("level") as string;

  if (!topic || !type) throw new Error("Missing required fields");

  // 1a. Rate Limiting — max 10 generations per minute per user
  const { success: withinLimit } = rateLimit(`generate:${clerkId}`, 10, 60000);
  if (!withinLimit) {
    return {
      success: false,
      message: "You're generating content too quickly. Please wait a minute and try again.",
    };
  }

  // 1. Get User from DB
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // 2. Check Credits (Bypass if Annual Plan)
  if (user.subscriptionStatus !== 'annual') {
    const currentCredits = await getUserCredits(user.id);
    if (currentCredits < 1) {
      throw new Error("Insufficient credits. Please upgrade for more.");
    }
  }

  // 3. Generate Content Synchronously (Gemini)
  const prompts = {
    notes: `Generate comprehensive study notes for the topic: "${topic}" at level: "${level}". 
      Respond with a JSON object containing a "sections" array. Each section should have a "heading" and "content" (string).`,
    quiz: `Generate a multiple-choice quiz for the topic: "${topic}" at level: "${level}". 
      Respond with a JSON object containing a "questions" array. Each question should have "question", "options" (array of 4 strings), "correctAnswer" (string, must match one of the options), and "explanation".`,
    flashcards: `Generate study flashcards for the topic: "${topic}" at level: "${level}". 
      Respond with a JSON object containing a "cards" array. Each card should have a "front" (question/term) and "back" (answer/definition).`,
    qna: `Generate detailed Questions and Answers for the topic: "${topic}" at level: "${level}". 
      Respond with a JSON object containing a "pairs" array. Each pair should have a "question" and "answer".`,
  };

  const prompt = prompts[type as keyof typeof prompts];

  try {
    console.log(`[Action] Generating ${type} for ${topic}...`);
    // Generate JSON from Gemini
    const content = await generateContentJSON(prompt);

    // Save to Database
    const newContent = await saveGeneratedContent({
      userId: user.id,
      topic,
      type,
      content,
    });

    // Deduct Credit (Skip if Annual Plan)
    if (user.subscriptionStatus !== 'annual') {
      await deductCredits(user.id, 1, `Generated ${type}: ${topic}`);
    }

    console.log(`[Action] Generation successful: ID ${newContent.id}`);

    revalidatePath("/dashboard");
    // Return the new content ID so the frontend can redirect straight to it!
    return { success: true, contentId: newContent.id };
  } catch (err) {
    console.error(`[Action] Generation FAILED:`, err);
    // Return the exact error message so the user can see if it's an API quota/key issue
    return { 
      success: false, 
      message: err instanceof Error ? err.message : "Failed to generate content." 
    };
  }
}
