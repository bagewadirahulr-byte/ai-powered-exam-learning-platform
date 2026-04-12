"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOOD_EMOJIS } from "@/config/constants";

// ============================================
// Mood Check-In — Wellness Tracker Component
// Placed on the Dashboard for daily mental state logging.
// ============================================

export default function MoodCheckIn({
  onSubmit,
}: {
  onSubmit: (score: number) => Promise<void>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || loading) return;
    setLoading(true);
    try {
      await onSubmit(selected);
      
      // Strict burnout detection: Redirect poor moods to Break Room
      if (selected <= 2) {
        router.push("/dashboard/wellness");
        return;
      }
      
      setSubmitted(true);
    } catch {
      // silently handle error
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="glass-card p-6 text-center border-t-4 border-t-pink-500">
        <p className="text-lg font-semibold text-white mb-1">Thank you! 💚</p>
        <p className="text-sm text-gray-400">
          Your mood has been logged. Remember to take breaks!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-t-4 border-t-pink-500">
      <h3 className="font-bold text-white mb-1 text-lg">How are you feeling?</h3>
      <p className="text-xs text-gray-400 mb-5">
        Daily wellness check — helps us monitor study burnout patterns.
      </p>

      <div className="flex justify-between gap-2 mb-5">
        {MOOD_EMOJIS.map((mood) => (
          <button
            key={mood.score}
            type="button"
            onClick={() => setSelected(mood.score)}
            className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
              selected === mood.score
                ? "border-pink-500/50 bg-pink-500/10 scale-105 shadow-lg shadow-pink-500/10"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800"
            }`}
            aria-label={mood.label}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
              {mood.label}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected === null || loading}
        className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] hover:shadow-pink-500/40 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Logging..." : "Log Mood"}
      </button>
    </div>
  );
}
