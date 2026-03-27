"use server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, getUserCredits } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";

/**
 * Server Action to trigger AI study material generation via Inngest.
 */
export async function generateContent(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const topic = formData.get("topic") as string;
  const type = formData.get("type") as "notes" | "quiz" | "flashcards" | "qna";
  const level = formData.get("level") as string;

  if (!topic || !type) throw new Error("Missing required fields");

  // 1. Get User from DB
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // 2. Check Credits
  const currentCredits = await getUserCredits(user.id);
  if (currentCredits < 1) {
    throw new Error("Insufficient credits. Please upgrade for more.");
  }

  // 3. Trigger Background Generation (Inngest)
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

  console.log(`[Action] Triggering Inngest with Event: exam/generate.content`);
  console.log(`[Action] Event Key Present: ${!!process.env.INNGEST_EVENT_KEY}`);
  
  try {
    const result = await inngest.send({
      name: "exam/generate.content",
      data: {
        userId: user.id,
        topic,
        type,
        prompt,
      },
    });
    console.log(`[Action] Inngest send result:`, JSON.stringify(result));
  } catch (err) {
    console.error(`[Action] Inngest send FAILED:`, err);
    throw err;
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Generation started! Check your dashboard in a few seconds." };
}
