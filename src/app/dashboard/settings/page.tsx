// ============================================
// Settings Page — User Profile & EWS Verification
// Protected route (requires authentication)
// ============================================

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getUserByClerkId, createUser } from "@/lib/db/queries";
import SettingsForm from "./SettingsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen px-6 pt-24 pb-12">
          <p className="text-center text-gray-400">Please sign in to access settings.</p>
        </main>
      </>
    );
  }

  // JIT user sync
  let dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) {
    dbUser = await createUser({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: clerkUser.fullName || clerkUser.username || "Student",
      imageUrl: clerkUser.imageUrl,
    });
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-block text-sm text-gray-500 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-gray-400">
              Manage your profile, language preferences, and EWS verification.
            </p>
          </div>

          {/* Settings Form */}
          <SettingsForm
            user={{
              firstName: dbUser.firstName,
              middleName: dbUser.middleName,
              lastName: dbUser.lastName,
              preferredLanguage: dbUser.preferredLanguage,
              targetExam: dbUser.targetExam,
              ewsVerified: dbUser.ewsVerified,
              ewsPending: dbUser.ewsPending,
              ewsTempPassExpiry: dbUser.ewsTempPassExpiry,
              ewsStatus: dbUser.ewsStatus,
              ewsRejectionReason: dbUser.ewsRejectionReason,
              dailyCredits: dbUser.dailyCredits,
            }}
          />
        </div>
      </main>
    </>
  );
}
