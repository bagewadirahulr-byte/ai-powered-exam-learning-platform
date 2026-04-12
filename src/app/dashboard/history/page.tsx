// ============================================
// Study History & Mistake Vault Page
// ============================================

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getUserByClerkId, getUserContent } from "@/lib/db/queries";
import { CONTENT_TYPES } from "@/config/constants";
import { ChevronRight, Bookmark, Clock, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study History | ExamAI",
  robots: { index: false, follow: false },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ vault?: string }>;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect("/dashboard");

  const params = await searchParams;
  const isVaultFilter = params.vault === "true";

  // Fetch all content, then filter in memory (or could be pushed to DAL query)
  let content = await getUserContent(dbUser.id);

  if (isVaultFilter) {
    content = content.filter((item) => item.isBookmarked);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 sm:px-6 pt-24 pb-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-2"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {isVaultFilter ? (
                  <>
                    <Bookmark className="w-8 h-8 text-yellow-400" />
                    Mistake Vault
                  </>
                ) : (
                  <>
                    <Clock className="w-8 h-8 text-blue-400" />
                    Study History
                  </>
                )}
              </h1>
              <p className="mt-2 text-gray-400 max-w-lg">
                {isVaultFilter
                  ? "Your saved questions, tough topics, and errors to review before the exam."
                  : "Every quiz, note, and flashcard you have generated."}
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
              <Link
                href="/dashboard/history"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isVaultFilter
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All History
              </Link>
              <Link
                href="/dashboard/history?vault=true"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isVaultFilter
                    ? "bg-yellow-500/20 text-yellow-400 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                ⭐ Vault
              </Link>
            </div>
          </div>

          {/* Empty State */}
          {content.length === 0 && (
            <div className="glass-card p-12 text-center border-dashed border-gray-700 border-2">
              <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
              <p className="text-gray-400 mb-6">
                {isVaultFilter
                  ? "You haven't added any items to your Mistake Vault yet. Click the 'Vault' button on any generated content to save it here."
                  : "You haven't generated any study material yet. Head to the dashboard to start."}
              </p>
              <Link
                href={isVaultFilter ? "/dashboard/history" : "/generate"}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
              >
                {isVaultFilter ? "View All History" : "Generate Content"}
              </Link>
            </div>
          )}

          {/* History Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {content.map((item) => {
              const config = CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES];
              
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/content/${item.id}`}
                  className="group relative block rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:scale-[1.02] hover:border-gray-700 hover:bg-gray-800/80 hover:shadow-lg"
                >
                  {/* Vault Badge */}
                  {item.isBookmarked && (
                    <div className="absolute top-4 right-4 text-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Bookmark className="w-5 h-5 fill-yellow-400" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                        config?.color || "from-gray-700 to-gray-900"
                      } text-2xl shadow-sm`}
                    >
                      {config?.icon || "📄"}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        {item.type}
                      </p>
                      <h3 className="truncate font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                        {item.topic}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-gray-800 pt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-blue-400 transition-colors">
                      Review <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
