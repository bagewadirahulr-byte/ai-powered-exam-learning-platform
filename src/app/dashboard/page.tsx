// ============================================
// Dashboard Page — Shows User Session Info
// Protected route (requires authentication)
// ============================================

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { CONTENT_TYPES, FREE_CREDITS } from "@/config/constants";
import { getUserByClerkId, getUserCredits, getUserContent, createUser } from "@/lib/db/queries";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardMoodWidget from "./DashboardMoodWidget";
import BetaFeatureCards from "@/components/dashboard/BetaFeatureCards";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import { updateProfile } from "./settings/actions";

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

  // Pre-compute time threshold for heatmap (uses new Date() which is stable in server components)
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

  // --- First-Time User Detection: Show Onboarding Wizard ---
  if (dbUser && !dbUser.firstName) {
    return <OnboardingWizard saveProfile={updateProfile} />;
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {/* Name */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Name
                </p>
                <p className="mt-1 font-medium text-white">
                  {clerkUser?.fullName || "N/A"}
                </p>
              </div>
              {/* Student Type */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Student Type
                </p>
                <p className="mt-1 font-medium">
                  {dbUser?.ewsVerified ? (
                    <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 border border-green-500/20">🛡️ EWS Verified</span>
                  ) : dbUser?.ewsPending ? (
                    <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400 border border-yellow-500/20">⏳ EWS Pending</span>
                  ) : (
                    <span className="inline-block rounded-full bg-gray-500/10 px-3 py-1 text-sm font-medium text-gray-400 border border-gray-500/20">📚 General</span>
                  )}
                </p>
              </div>
              {/* Daily Credits */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Daily Credits
                </p>
                <p className="mt-1 text-2xl font-bold text-green-400">
                  {dbUser?.subscriptionStatus === 'annual' ? '∞ Unlimited' : `${dbUser?.dailyCredits ?? 8} / ${dbUser?.ewsVerified ? 50 : 8}`}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Resets daily at midnight</p>
              </div>
              {/* Target Exam */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Target Exam
                </p>
                <p className="mt-1 inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 border border-indigo-500/20">
                  {dbUser?.targetExam ? dbUser.targetExam.replace('_', ' ') : '⚙️ Set in Settings'}
                </p>
              </div>
              {/* Plan & Links */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Plan
                </p>
                <p className="mt-1 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
                  {dbUser?.subscriptionStatus === 'monthly' ? '📦 Monthly' :
                   dbUser?.subscriptionStatus === 'half_yearly' ? '⭐ Half-Yearly' :
                   dbUser?.subscriptionStatus === 'annual' ? '💎 Annual' : '🆓 Free'}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/subscription"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
                  >
                    Manage Subscription →
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="text-xs text-gray-400 hover:text-white hover:underline transition-colors font-medium"
                  >
                    ⚙️ Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Quick Actions — Generate Content ===== */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-white flex justify-between items-end">
              <div>Generate Content</div>
              <Link href="/dashboard/history" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                View Full History →
              </Link>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                <Link key={key} href={`/generate?type=${key}`}>
                  <div className="glass-card group flex flex-col items-center p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:border-white/20 h-full">
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

          {/* ===== Progress, Consistency & Wellness (Phase 4/6) ===== */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-10">
            {/* Syllabus Tracker */}
            <div className="glass-card p-6 md:col-span-1 border-t-4 border-t-indigo-500 flex flex-col">
              <h3 className="font-bold text-white mb-2 text-lg">Syllabus Tracker</h3>
              <p className="text-xs text-gray-400 mb-6">Track your {dbUser?.targetExam || "Exam"} preparation progress based on generated topics.</p>
              
              <div className="mt-auto space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Core Concepts</span>
                    <span className="text-indigo-400 font-bold">{Math.min(100, contentHistory.length * 5)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, contentHistory.length * 5)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Mock Tests</span>
                    <span className="text-blue-400 font-bold">{Math.min(100, contentHistory.filter(i => i.type==='quiz').length * 10)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, contentHistory.filter(i => i.type==='quiz').length * 10)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Heatmap */}
            <div className="glass-card p-6 md:col-span-2 border-t-4 border-t-emerald-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white mb-1 text-lg">Study Consistency</h3>
                  <p className="text-xs text-gray-400">Your activity over the last 30 days</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {new Set(contentHistory.filter(i => new Date(i.createdAt).getTime() > thirtyDaysAgo.getTime()).map(i => new Date(i.createdAt).toISOString().split('T')[0])).size}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Active Days</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-6">
                {/* Generate 30 days of blocks */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (29 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  // Count items on this day
                  const count = contentHistory.filter(item => new Date(item.createdAt).toISOString().split('T')[0] === dateStr).length;
                  
                  let bgClass = "bg-gray-800";
                  if (count === 1) bgClass = "bg-emerald-900/60";
                  if (count === 2) bgClass = "bg-emerald-700";
                  if (count >= 3) bgClass = "bg-emerald-500";
                  if (count >= 5) bgClass = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";

                  return (
                    <div 
                      key={i} 
                      className={`w-4 h-4 sm:w-6 sm:h-6 rounded-sm ${bgClass} transition-colors border border-gray-900`}
                      title={`${dateStr}: ${count} items studied`}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-gray-500">
                <span>Less</span>
                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-emerald-900/60 rounded-sm"></div>
                <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                <span>More</span>
              </div>
            </div>

            {/* Mood Check-In (Wellness) */}
            <DashboardMoodWidget />
          </div>

          {/* Ask Tutor Quick Access */}
          <div className="mb-10">
            <Link href="/dashboard/tutor">
              <div className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl shadow-lg">
                    🧑‍🏫
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Ask AI Tutor</h3>
                    <p className="text-xs text-gray-400">Context-locked doubt clearance chatbot · 1 credit per message</p>
                  </div>
                </div>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-sm font-medium">
                  Open Chat →
                </span>
              </div>
            </Link>
          </div>
          {/* ===== Beta Features row ===== */}
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Upcoming Features <span className="ml-2 font-mono text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 uppercase">Beta / Coming Soon</span></h2>
            <BetaFeatureCards />
          </div>

          {/* ===== Content History (Searchable & Filterable) ===== */}
          <DashboardContent initialHistory={contentHistory.map(item => ({
            ...item,
            content: item.content as Record<string, unknown>,
          }))} />
        </div>
      </main>
    </>
  );
}

