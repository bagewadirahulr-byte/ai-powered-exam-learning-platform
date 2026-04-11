// ============================================
// Subscription Management Page
// /dashboard/subscription — View and manage plan
// ============================================

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Crown, CreditCard, Calendar, Zap } from "lucide-react";
import { getUserByClerkId, getUserCredits } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Navbar from "@/components/layout/Navbar";
import { PLANS } from "@/config/constants";
import CancelButton from "./CancelButton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Subscription",
};

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect("/dashboard");

  const credits = await getUserCredits(dbUser.id);

  const userSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, dbUser.id),
  });

  const currentPlan = dbUser.subscriptionStatus;
  const isFree = currentPlan === "free";
  const planConfig = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;

  const periodEnd = userSub?.currentPeriodEnd
    ? new Date(userSub.currentPeriodEnd)
    : null;
  const isExpired = periodEnd ? new Date() > periodEnd : true;
  const isCancelled = !!userSub?.cancelledAt;

  // Plan badge styling
  const planBadgeStyles: Record<string, string> = {
    free: "from-gray-500 to-gray-600",
    monthly: "from-blue-500 to-indigo-600",
    half_yearly: "from-indigo-500 to-purple-600",
    annual: "from-purple-500 to-pink-600",
  };

  const planEmoji: Record<string, string> = {
    free: "🆓",
    monthly: "📦",
    half_yearly: "⭐",
    annual: "💎",
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Manage <span className="gradient-text">Subscription</span>
            </h1>
            <p className="text-gray-400">
              View your current plan, credits, and subscription details.
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                    planBadgeStyles[currentPlan] || planBadgeStyles.free
                  } text-3xl shadow-lg`}
                >
                  {planEmoji[currentPlan] || "🆓"}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Current Plan
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {planConfig.name}
                  </h2>
                  {isCancelled && (
                    <span className="text-xs text-red-400 font-medium">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {!isFree && !isCancelled && !isExpired && <CancelButton />}
                <Link
                  href="/pricing"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
                >
                  {isFree ? "Upgrade Plan" : "Change Plan"}
                </Link>
              </div>
            </div>

            {/* Plan Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Credits */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Credits
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {currentPlan === "annual" ? "Unlimited ∞" : credits}
                </p>
              </div>

              {/* Plan Price */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-green-400" />
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Price
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {planConfig.price === 0
                    ? "Free"
                    : `₹${planConfig.price}`}
                </p>
              </div>

              {/* Duration */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Duration
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {planConfig.duration}
                </p>
              </div>

              {/* Expiry */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                    {isFree ? "Status" : "Expires"}
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  {isFree
                    ? "Active"
                    : periodEnd
                    ? isExpired
                      ? "Expired"
                      : periodEnd.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="glass-card p-8 mb-8">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Plan Features
            </h3>
            <ul className="space-y-3">
              {planConfig.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="mt-0.5 text-green-400 shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade Prompt for Free Users */}
          {isFree && (
            <div className="glass-card border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to unlock more? 🚀
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Upgrade to a paid plan for more credits, PDF exports, and
                priority support.
              </p>
              <Link
                href="/pricing"
                className="inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                View Plans
              </Link>
            </div>
          )}

          {/* Cancelled State Info */}
          {isCancelled && (
            <div className="glass-card border-yellow-500/30 bg-yellow-500/5 p-6">
              <p className="text-sm text-yellow-300 font-medium mb-1">
                ⚠️ Subscription Cancelled
              </p>
              <p className="text-sm text-gray-400">
                Your subscription has been cancelled. Your remaining purchased credits
                are still available. You can re-subscribe anytime from the{" "}
                <Link href="/pricing" className="text-blue-400 hover:underline">
                  Pricing page
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
