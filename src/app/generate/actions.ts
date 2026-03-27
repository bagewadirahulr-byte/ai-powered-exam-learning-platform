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
  const prompt = `Generate comprehensive ${type} for the topic: "${topic}" at level: "${level}". 
    Format the response as JSON.`;

  await inngest.send({
    name: "exam/generate.content",
    data: {
      userId: user.id,
      topic,
      type,
      prompt,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Generation started! Check your dashboard in a few seconds." };
}
