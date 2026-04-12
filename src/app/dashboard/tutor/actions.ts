"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getUserByClerkId,
  checkAndResetDailyCredits,
  deductDailyCredit,
} from "@/lib/db/queries";
import { generateContentText } from "@/lib/gemini";
import { SUPPORTED_LANGUAGES, SUPPORTED_EXAMS } from "@/config/constants";

// ============================================
// Tutor Chatbot Server Action
// Context-Locked Doubt Clearance Engine
// ============================================

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Server action for the context-locked tutor chatbot.
 * Each message deducts 1 daily credit.
 * The system prompt is injected with user's exam/language + hidden context.
 */
export async function sendTutorMessage(
  userMessage: string,
  history: ChatMessage[],
  hiddenContext?: string
): Promise<{ success: boolean; reply?: string; message?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // --- Credit Check ---
  if (user.subscriptionStatus !== "annual") {
    const remaining = await checkAndResetDailyCredits(user.id);
    if (remaining <= 0) {
      return {
        success: false,
        message:
          "Your daily AI credits are exhausted. Please return tomorrow for more study assistance.",
      };
    }
  }

  // --- Build Contextualized System Prompt ---
  const languageLabel =
    SUPPORTED_LANGUAGES[
      user.preferredLanguage as keyof typeof SUPPORTED_LANGUAGES
    ]?.label || "English";
  const examLabel = user.targetExam
    ? SUPPORTED_EXAMS[user.targetExam as keyof typeof SUPPORTED_EXAMS]?.label
    : null;

  const languageInstruction =
    user.preferredLanguage !== "english"
      ? `Respond in ${languageLabel} language using ${languageLabel} script. Use English only for technical terms.`
      : "Respond in clear, simple English.";

  const examInstruction = examLabel
    ? `The student is preparing for the ${examLabel} exam. Tailor explanations to match ${examLabel} syllabus, question patterns, and difficulty level.`
    : "";

  const contextInstruction = hiddenContext
    ? `\n\nIMPORTANT CONTEXT: The student is currently studying the following content and needs help understanding it:\n"""${hiddenContext}"""\nUse this context to provide accurate, targeted explanations.`
    : "";

  const systemPrompt = `You are ExamAI Tutor — a strict, focused academic tutor specialized in Indian government exam preparation.

Rules:
1. ${languageInstruction}
2. ${examInstruction}
3. Answer ONLY academic/study-related questions. If asked about non-academic topics, politely redirect: "I'm your exam preparation tutor. Let's stay focused on your studies!"
4. Keep answers concise but thorough. Use examples where helpful.
5. If explaining a concept, break it into numbered points for clarity.
6. If the student asks about a specific question they got wrong, explain WHY the correct answer is right and WHY their answer was wrong.${contextInstruction}`;

  // --- Build conversation for Gemini ---
  const conversationParts: string[] = [
    `System: ${systemPrompt}`,
  ];

  // Include last 10 messages of history (to stay within token limits)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    conversationParts.push(
      `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`
    );
  }
  conversationParts.push(`Student: ${userMessage}`);
  conversationParts.push("Tutor:");

  const fullPrompt = conversationParts.join("\n\n");

  try {
    const response = await generateContentText(fullPrompt);

    // Deduct 1 daily credit for the tutor message
    if (user.subscriptionStatus !== "annual") {
      await deductDailyCredit(user.id);
    }

    return {
      success: true,
      reply: response.trim(),
    };
  } catch (error) {
    console.error("[Tutor] Gemini error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "AI tutor is temporarily unavailable. Please try again.",
    };
  }
}
