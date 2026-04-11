// ============================================
// Subscription Management — Server Actions
// Cancel subscription functionality
// ============================================

"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserByClerkId } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

/**
 * Cancel the current user's subscription.
 * Sets subscriptionStatus to "free" and records cancellation timestamp.
 * The user keeps any remaining credits they've already purchased.
 */
export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { success: false, message: "Unauthorized" };
  }

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) {
    return { success: false, message: "User not found" };
  }

  if (dbUser.subscriptionStatus === "free") {
    return { success: false, message: "You are already on the free plan." };
  }

  const now = new Date();

  try {
    // 1. Mark subscription as cancelled
    await db
      .update(subscriptions)
      .set({
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, dbUser.id));

    // 2. Revert user to free plan
    await db
      .update(users)
      .set({
        subscriptionStatus: "free",
        updatedAt: now,
      })
      .where(eq(users.id, dbUser.id));

    console.log(`✅ Subscription cancelled for user ${dbUser.id}`);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/subscription");

    return { success: true, message: "Subscription cancelled successfully." };
  } catch (error) {
    console.error("[CANCEL_SUBSCRIPTION]", error);
    return { success: false, message: "Failed to cancel subscription. Please try again." };
  }
}
