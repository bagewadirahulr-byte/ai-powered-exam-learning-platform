"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// ============================================
// Burnout Tracker — Mental Health Guardrail
// Automatically redirects users to the Break Room 
// after 2 hours of continuous study sessions.
// ============================================

export default function BurnoutDetector() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Pause tracking if they are already in the break room
    if (pathname === "/dashboard/wellness") return;

    // 2 hours in milliseconds (120 minutes)
    const BURNOUT_THRESHOLD_MS = 2 * 60 * 60 * 1000;
    
    // Track session start time securely in browser session storage
    // This survives page reloads but resets if they close the tab
    if (!sessionStorage.getItem("examai_session_start")) {
      sessionStorage.setItem("examai_session_start", Date.now().toString());
    }

    const sessionStart = parseInt(
      sessionStorage.getItem("examai_session_start") || Date.now().toString(),
      10
    );

    // Run a lightweight background check every 60 seconds
    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStart;
      
      if (elapsed >= BURNOUT_THRESHOLD_MS) {
        // Reset the tracker so they get another 2 hours after their break
        sessionStorage.setItem("examai_session_start", Date.now().toString());
        router.push("/dashboard/wellness");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [pathname, router]);

  return null; // Invisible logic wrapper
}
