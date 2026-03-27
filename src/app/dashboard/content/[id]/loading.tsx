import React from "react";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Loading state for the content viewer.
 */
export default function ContentLoading() {
  return (
    <main className="min-h-screen px-6 pt-24 pb-12">
      <div className="mx-auto max-w-4xl opacity-50 pointer-events-none">
        {/* Back Link */}
        <div className="mb-6">
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Content Card */}
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
            <div>
              <Skeleton className="mb-2 h-10 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Skeleton Body */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-4 h-6 w-48" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
