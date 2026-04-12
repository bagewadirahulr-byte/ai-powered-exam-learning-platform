"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, toggleBookmark, reportContentError } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

// ============================================
// Content Actions — Bookmark & Report Error
// ============================================

/**
 * Toggle bookmark (Mistake Vault) on a content item.
 */
export async function toggleContentBookmark(contentId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  try {
    const isNowBookmarked = await toggleBookmark(contentId);
    revalidatePath(`/dashboard/content/${contentId}`);
    revalidatePath("/dashboard");
    return {
      success: true,
      bookmarked: isNowBookmarked,
      message: isNowBookmarked ? "Added to Mistake Vault ⭐" : "Removed from Mistake Vault",
    };
  } catch (error) {
    return {
      success: false,
      bookmarked: false,
      message: error instanceof Error ? error.message : "Failed to update bookmark.",
    };
  }
}

/**
 * Report an error on a content item (Community QA Pipeline).
 * Auto-hides content globally if it receives ≥3 reports.
 */
export async function reportError(contentId: string, reason?: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  try {
    const totalReports = await reportContentError(contentId, user.id, reason);
    const autoHidden = totalReports >= 3;

    revalidatePath(`/dashboard/content/${contentId}`);
    return {
      success: true,
      totalReports,
      message: autoHidden
        ? "Thank you. This content has been flagged by multiple users and will be regenerated."
        : `Error reported. (${totalReports}/3 reports needed for auto-review)`,
    };
  } catch (error) {
    return {
      success: false,
      totalReports: 0,
      message: error instanceof Error ? error.message : "Failed to report error.",
    };
  }
}
