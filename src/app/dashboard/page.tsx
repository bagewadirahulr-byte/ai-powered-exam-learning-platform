// ============================================
// Dashboard Page — Shows User Session Info
// Protected route (requires authentication)
// ============================================

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { CONTENT_TYPES, FREE_CREDITS } from "@/config/constants";
import { getUserByClerkId, getUserCredits, getUserContent, createUser } from "@/lib/db/queries";

export default async function DashboardPage() {
  // --- Get the current user from Clerk (server-side) ---
  const clerkUser = await currentUser();

  let dbUser = null;
  let credits = FREE_CREDITS;
  let contentHistory: Awaited<ReturnType<typeof getUserContent>> = [];

  if (clerkUser) {
    dbUser = await getUserByClerkId(clerkUser.id);
    
    // --- Just-In-Time (JIT) User Creation ---
    // If the user exists in Clerk but not in our Postgres, create them now.
    if (!dbUser) {
      console.log(`Syncing new user ${clerkUser.id} to Postgres...`);
      dbUser = await createUser({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.fullName || clerkUser.username || "Student",
        imageUrl: clerkUser.imageUrl,
      });
    }

    if (dbUser) {
      credits = await getUserCredits(dbUser.id);
      contentHistory = await getUserContent(dbUser.id);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* ===== Welcome Section ===== */}
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Welcome back,{" "}
              <span className="gradient-text">
                {clerkUser?.firstName || "Student"}
              </span>{" "}
              👋
            </h1>
            <p className="text-gray-400">
              Ready to study? Generate AI-powered content to ace your exams.
            </p>
          </div>

          {/* ===== User Info Card ===== */}
          <div className="glass-card mb-10 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Your Profile
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Name */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Name
                </p>
                <p className="mt-1 font-medium text-white">
                  {clerkUser?.fullName || "N/A"}
                </p>
              </div>
              {/* Email */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Email
                </p>
                <p className="mt-1 font-medium text-white">
                  {clerkUser?.emailAddresses[0]?.emailAddress || "N/A"}
                </p>
              </div>
              {/* Credits */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Credits Remaining
                </p>
                <p className="mt-1 text-2xl font-bold text-green-400">
                  {dbUser?.subscriptionStatus === 'annual' ? 'Unlimited ∞' : credits}
                </p>
              </div>
              {/* Plan */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Plan
                </p>
                <p className="mt-1 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
                  {dbUser?.subscriptionStatus === 'monthly' ? '📦 Monthly' :
                   dbUser?.subscriptionStatus === 'half_yearly' ? '⭐ Half-Yearly' :
                   dbUser?.subscriptionStatus === 'annual' ? '💎 Annual' : '🆓 Free'}
                </p>
              </div>
            </div>
          </div>

          {/* ===== Quick Actions — Generate Content ===== */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Generate Content
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                <Link key={key} href={`/generate?type=${key}`}>
                  <div className="glass-card group flex flex-col items-center p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:border-white/20">
                    <div
                      className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-2xl shadow-lg`}
                    >
                      {config.icon}
                    </div>
                    <h3 className="mb-1 font-semibold text-white">
                      {config.label}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ===== Recent Content ===== */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Recent Content
            </h2>
            
            {contentHistory.length === 0 ? (
              <div className="glass-card flex flex-col items-center p-12 text-center">
                <div className="mb-4 text-4xl">📚</div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  No content yet
                </h3>
                <p className="mb-6 text-sm text-gray-400">
                  Start by generating notes, quizzes, or flashcards above.
                </p>
                <Link href="/generate">
                  <Button variant="primary" size="sm">
                    Generate Your First Content
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {contentHistory.map((item) => {
                  const config = CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES];
                  
                  return (
                    <Link key={item.id} href={`/dashboard/content/${item.id}`}>
                      <div className="glass-card group flex flex-col p-5 hover:scale-[1.02] hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-600 to-gray-800'} text-xl shadow-md`}>
                            {config?.icon || '📄'}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-white line-clamp-2 mb-2 min-h-[40px]">
                          {item.topic}
                        </h3>
                        <p className="text-sm font-medium text-gray-400 capitalize">
                          {item.type}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
