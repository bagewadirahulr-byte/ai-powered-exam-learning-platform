"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getAllUsersAdmin,
  getPlatformStats,
  getVerificationAuditLogs,
  getPendingEwsReviews,
  getContentStatsByType,
  setEwsStatusFull,
  logVerificationAudit,
  getEwsCertificate,
  deleteEwsCertificate,
  setUserDailyCredits,
  adminResetUserCredits,
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

// ============================================
// Admin Panel Server Actions
// Platform analytics + EWS manual review
// ============================================

/** Admin email whitelist — only these emails can access the admin panel */
const ADMIN_EMAILS = [
  "bagewadirahulr@gmail.com",
];

/**
 * Verify the current user is an admin. Throws if not.
 */
async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  // We check against Clerk's user data
  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.emailAddresses[0]?.emailAddress;
  console.log("Logged-in email:", email);
  
  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { clerkId, email };
}

/**
 * Get all admin dashboard data in one call.
 */
export async function getAdminDashboardData() {
  await requireAdmin();

  const [stats, allUsers, pendingReviews, auditLogs, contentStats] =
    await Promise.all([
      getPlatformStats(),
      getAllUsersAdmin(),
      getPendingEwsReviews(),
      getVerificationAuditLogs(),
      getContentStatsByType(),
    ]);

  return { stats, allUsers, pendingReviews, auditLogs, contentStats };
}

/**
 * Manually approve an EWS verification (admin action).
 * Sets is_verified_ews = true, credits = 50, status = approved.
 */
export async function adminApproveEws(userId: string) {
  const admin = await requireAdmin();

  await setEwsStatusFull(userId, {
    ewsStatus: "approved",
    ewsRejectionReason: null,
  });

  // Set credits to 50 for EWS approved user
  await setUserDailyCredits(userId, 50);

  await logVerificationAudit({
    userId,
    adminEmail: admin.email,
    action: "manual_approved",
    decisionReason: `Manually approved by admin: ${admin.email}. Credits set to 50/day.`,
  });
  
  // Cleanup image physically from DB
  await deleteEwsCertificate(userId);

  revalidatePath("/admin");
  revalidatePath("/dashboard/settings");
  return { success: true, message: "EWS approved. Credits set to 50/day." };
}

/**
 * Manually reject an EWS verification (admin action).
 * Sets is_verified_ews = false, credits = 8, status = rejected.
 */
export async function adminRejectEws(userId: string, reason: string) {
  const admin = await requireAdmin();

  await setEwsStatusFull(userId, {
    ewsStatus: "rejected",
    ewsRejectionReason: reason || "Rejected by admin after manual review.",
  });

  // Reset credits to general tier (8/day)
  await setUserDailyCredits(userId, 8);

  await logVerificationAudit({
    userId,
    adminEmail: admin.email,
    action: "manual_rejected",
    decisionReason: `Manually rejected by admin: ${admin.email}. Reason: ${reason}. Credits reset to 8/day.`,
  });

  // Cleanup image physically from DB
  await deleteEwsCertificate(userId);

  revalidatePath("/admin");
  revalidatePath("/dashboard/settings");
  return { success: true, message: "EWS rejected. Credits reset to 8/day." };
}

/**
 * Reset a user's daily credits based on their EWS status.
 * EWS approved → 50, General → 8.
 */
export async function adminResetCredits(userId: string) {
  await requireAdmin();
  const newCredits = await adminResetUserCredits(userId);

  revalidatePath("/admin");
  return { success: true, message: `Credits reset to ${newCredits}/day.` };
}

/**
 * Fetch a user's uploaded EWS certificate (for Admin Panel viewing explicitly).
 */
export async function getEwsCertificateAsAdmin(userId: string) {
  await requireAdmin();
  const cert = await getEwsCertificate(userId);
  if (!cert) return null;
  return {
    base64Data: cert.base64Data,
    mimeType: cert.mimeType
  };
}
