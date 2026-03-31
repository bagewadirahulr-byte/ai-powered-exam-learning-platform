import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserByClerkId } from "@/lib/db/queries";

/**
 * Validates if the currently logged-in user has an active, valid subscription.
 * Handles checking expiry dates dynamically against the database.
 */
export async function checkSubscriptionAccess(): Promise<{
  isSubscribed: boolean;
  plan: string;
  isExpired: boolean;
}> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { isSubscribed: false, plan: "free", isExpired: true };
  }

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) {
    return { isSubscribed: false, plan: "free", isExpired: true };
  }

  const userSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, dbUser.id),
  });

  if (!userSub || userSub.plan === "free" || !userSub.currentPeriodEnd) {
    return { isSubscribed: false, plan: "free", isExpired: true };
  }

  // Check if current date has surpassed the expiry date
  const isExpired = new Date() > new Date(userSub.currentPeriodEnd);

  return {
    isSubscribed: !isExpired,
    plan: userSub.plan,
    isExpired,
  };
}
