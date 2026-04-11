// ============================================
// Analytics Provider — Page View Tracker
// Client component that tracks route changes
// ============================================

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

/**
 * Invisible client component that tracks page views
 * whenever the route changes. Renders nothing — just runs side effects.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
