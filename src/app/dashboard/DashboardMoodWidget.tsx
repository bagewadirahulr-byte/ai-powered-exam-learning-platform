"use client";

import MoodCheckIn from "@/components/ui/MoodCheckIn";
import { logUserMood } from "./actions";

// ============================================
// Dashboard Mood Widget — Client Wrapper
// Connects the MoodCheckIn UI to the server action
// ============================================

export default function DashboardMoodWidget() {
  return (
    <MoodCheckIn
      onSubmit={async (score: number) => {
        await logUserMood(score);
      }}
    />
  );
}
