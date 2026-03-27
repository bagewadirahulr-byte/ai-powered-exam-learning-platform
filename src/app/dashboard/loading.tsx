import React from "react";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Loading state for the main dashboard.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Welcome Section Skeleton */}
        <div className="mb-10">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="glass-card mb-10 p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card flex flex-col items-center p-6 text-center">
                <Skeleton className="mb-3 h-14 w-14 rounded-xl" />
                <Skeleton className="mb-1 h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Content Skeleton */}
        <div>
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card flex flex-col p-5">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
