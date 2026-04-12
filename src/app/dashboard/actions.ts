"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, logMood } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

// ============================================
// Dashboard Server Actions
// ============================================

/**
 * Log the user's daily mood score.
 */
export async function logUserMood(score: number) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  if (score < 1 || score > 5) throw new Error("Invalid mood score.");

  await logMood(user.id, score);
  revalidatePath("/dashboard");
}
