"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getUserByClerkId,
  getUserCredits,
  saveGeneratedContent,
  deductCredits,
  checkAndResetDailyCredits,
  deductDailyCredit,
  getCachedContent,
  setCachedContent,
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { generateContentJSON } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { SUPPORTED_LANGUAGES, SUPPORTED_EXAMS } from "@/config/constants";
import crypto from "crypto";

// ============================================
// Content Generation Server Action
// With: Daily Quotas, Device Cookie Lock,
//       Content Caching, Vernacular Prompts
// ============================================

/** 24-hour cookie max-age in seconds */
const DEVICE_COOKIE_MAX_AGE = 86400;

/** Maximum daily generations per device (anti-Sybil) */
const DEVICE_DAILY_LIMIT = 8;

/**
 * Reads the device-level tracking cookie.
 * Returns { deviceId, date, used } or null.
 */
async function getDeviceCookie(): Promise<{
  deviceId: string;
  date: string;
  used: number;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("examai_device")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sets the device-level tracking cookie.
 */
async function setDeviceCookie(data: {
  deviceId: string;
  date: string;
  used: number;
}) {
  const cookieStore = await cookies();
  cookieStore.set("examai_device", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: DEVICE_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Builds a cache key from exam type, topic, content type, and language.
 */
function buildCacheKey(
  examType: string | null,
  topic: string,
  type: string,
  language: string,
  level: string
): string {
  const normalizedTopic = topic
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
  return `${examType || "GENERAL"}_${normalizedTopic}_${type}_${language}_${level.toLowerCase()}`;
}

/**
 * Server Action to trigger AI study material generation.
 * Enforces: rate limiting, daily quotas, device cookie lock, and content caching.
 */
export async function generateContent(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const topic = formData.get("topic") as string;
  const type = formData.get("type") as "notes" | "quiz" | "flashcards" | "qna";
  const level = formData.get("level") as string;
  const topicMode = (formData.get("topicMode") as string) || "exam";

  // Tiered credit cost: exam topics = 1, general topics = 2
  const creditCost = topicMode === "general" ? 2 : 1;

  if (!topic || !type) throw new Error("Missing required fields");

  // --- 1. Rate Limiting (per-minute burst protection) ---
  const { success: withinLimit } = rateLimit(`generate:${clerkId}`, 10, 60000);
  if (!withinLimit) {
    return {
      success: false,
      message:
        "You're generating content too quickly. Please wait a minute and try again.",
    };
  }

  // --- 2. Get User from DB ---
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // --- 3. Device Cookie Lock (Anti-Sybil) ---
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  let deviceData = await getDeviceCookie();

  if (!deviceData || deviceData.date !== today) {
    // New day or first visit: reset device tracking
    deviceData = {
      deviceId: crypto.randomUUID(),
      date: today,
      used: 0,
    };
  }

  // Only enforce device limit on free-tier (non-subscribed, non-EWS) users
  const isSubscribed = user.subscriptionStatus !== "free";
  const isEwsActive =
    user.ewsVerified ||
    (user.ewsPending &&
      user.ewsTempPassExpiry &&
      new Date(user.ewsTempPassExpiry) > new Date());

  if (!isSubscribed && !isEwsActive && (deviceData.used + creditCost) > DEVICE_DAILY_LIMIT) {
    return {
      success: false,
      message:
        "Daily device limit reached. This device has used all 8 free credits today. Please upgrade or verify your EWS status for more credits.",
    };
  }

  // --- 4. Credit Checks Based on Plan ---
  if (user.subscriptionStatus === "free") {
    // Free / EWS Users: Use Daily Credits
    const dailyCreditsRemaining = await checkAndResetDailyCredits(user.id);
    if (dailyCreditsRemaining < creditCost) {
      const ewsMessage = isEwsActive
        ? "You have given your absolute best today! While we are dedicated to your academic success, we also prioritize your mental well-being. To ensure cognitive recovery, your 50 free AI credits are complete for today. We are honored to support your journey—please rest your mind, step away from the screen, and return tomorrow with fresh focus and strong mental health to learn more."
        : "You've used all 8 free credits for today. Upgrade your plan or verify your EWS status for more daily credits.";
      return { success: false, message: ewsMessage };
    }
  } else if (user.subscriptionStatus !== "annual") {
    // Monthly / Half-Yearly Users: Use Monthly Credits
    const currentCredits = await getUserCredits(user.id);
    if (currentCredits < creditCost) {
      return {
        success: false,
        message: "Insufficient premium credits. Please renew your subscription.",
      };
    }
  }

  // --- 6. Content Caching Check ---
  const userLanguage = user.preferredLanguage || "english";
  const userExam = user.targetExam || null;
  const cacheKey = buildCacheKey(userExam, topic, type, userLanguage, level);

  const cachedContent = await getCachedContent(cacheKey);
  if (cachedContent) {
    // Cache HIT: save to user's history, deduct credits, skip Gemini call
    const newContent = await saveGeneratedContent({
      userId: user.id,
      topic,
      type,
      content: cachedContent,
      examType: userExam,
    });

    if (user.subscriptionStatus === "free") {
      await deductDailyCredit(user.id);
      if (creditCost === 2) await deductDailyCredit(user.id); // Deduct 2nd credit
    } else if (user.subscriptionStatus !== "annual") {
      await deductCredits(user.id, creditCost, `Generated ${type}: ${topic} (cached, ${topicMode})`);
    }

    // Update device cookie
    deviceData.used += creditCost;
    await setDeviceCookie(deviceData);

    revalidatePath("/dashboard");
    return { success: true, contentId: newContent.id, cached: true };
  }

  // --- 7. Build Vernacular Prompt ---
  const languageLabel =
    SUPPORTED_LANGUAGES[userLanguage as keyof typeof SUPPORTED_LANGUAGES]?.label || "English";
  const examLabel = userExam
    ? SUPPORTED_EXAMS[userExam as keyof typeof SUPPORTED_EXAMS]?.label
    : null;

  const languageInstruction =
    userLanguage !== "english"
      ? `\n\nIMPORTANT: Generate ALL content in ${languageLabel} language. Use ${languageLabel} script for all text. Only use English for technical terms that have no direct translation.`
      : "";

  const examInstruction = examLabel
    ? `\n\nContext: This content is for a student preparing for the ${examLabel} exam. Tailor the difficulty, terminology, and focus areas to match ${examLabel} exam patterns and syllabus.`
    : "";

  const levelInstruction = level === "Beginner" 
    ? "\n\nDifficulty: Beginner. Use simple language, analogies, and explain foundational concepts clearly. Avoid overly complex jargon."
    : level === "Advanced"
    ? "\n\nDifficulty: Advanced. Use highly technical language, explore deep edge-cases, and assume the reader has a strong foundational understanding. Do not waste time on basics."
    : "\n\nDifficulty: Intermediate. Balance foundational knowledge with technical depth.";

  const prompts = {
    notes: `Generate comprehensive study notes for the topic: "${topic}". 
      Respond with a JSON object containing a "sections" array. Each section should have a "heading" and "content" (string).${levelInstruction}${examInstruction}${languageInstruction}`,
    quiz: `Generate a multiple-choice quiz for the topic: "${topic}". 
      Respond with a JSON object containing a "questions" array. Each question should have "question", "options" (array of 4 strings), "correctAnswer" (string, must match one of the options), and "explanation".${levelInstruction}${examInstruction}${languageInstruction}`,
    flashcards: `Generate study flashcards for the topic: "${topic}". 
      Respond with a JSON object containing a "cards" array. Each card should have a "front" (question/term) and "back" (answer/definition).${levelInstruction}${examInstruction}${languageInstruction}`,
    qna: `Generate detailed Questions and Answers for the topic: "${topic}". 
      Respond with a JSON object containing a "pairs" array. Each pair should have a "question" and "answer".${levelInstruction}${examInstruction}${languageInstruction}`,
  };

  const prompt = prompts[type as keyof typeof prompts];

  try {
    console.log(
      `[Action] Generating ${type} for "${topic}" (${languageLabel}${examLabel ? `, ${examLabel}` : ""})...`
    );

    // --- 8. Generate JSON from Gemini ---
    const content = await generateContentJSON(prompt);

    // --- 9. Save to Database ---
    const newContent = await saveGeneratedContent({
      userId: user.id,
      topic,
      type,
      content,
      examType: userExam,
    });

    // --- 10. Cache the result for future users ---
    await setCachedContent(cacheKey, type, content);

    // --- 11. Deduct Credits ---
    if (user.subscriptionStatus === "free") {
      await deductDailyCredit(user.id);
      if (creditCost === 2) await deductDailyCredit(user.id); // Deduct 2nd credit
    } else if (user.subscriptionStatus !== "annual") {
      await deductCredits(user.id, creditCost, `Generated ${type}: ${topic} (${topicMode})`);
    }

    // --- 12. Update Device Cookie ---
    deviceData.used += creditCost;
    await setDeviceCookie(deviceData);

    console.log(`[Action] Generation successful: ID ${newContent.id}`);

    revalidatePath("/dashboard");
    return { success: true, contentId: newContent.id };
  } catch (err) {
    console.error(`[Action] Generation FAILED:`, err);
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to generate content. Please try again.",
    };
  }
}
