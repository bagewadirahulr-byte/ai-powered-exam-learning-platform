// ============================================
// Break Room — Wellness Lockout & Recovery
// Mandatory mental health recovery page
// ============================================

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Metadata } from "next";
import BreathingExercise from "./BreathingExercise";

export const metadata: Metadata = {
  title: "Break Room | ExamAI",
  robots: { index: false, follow: false },
};

export default function WellnessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-4xl shadow-2xl shadow-pink-500/30">
              🧘
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Time for a Break
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-lg mx-auto">
              You&apos;ve been intensely studying. When cognitive fatigue sets in, your brain
              physically stops absorbing new information. To maintain your high performance,
              please take this mandatory break. <strong className="text-white">Your progress is completely saved.</strong>
            </p>
          </div>

          {/* Recovery Activities */}
          <div className="grid gap-6 sm:grid-cols-2 mb-10">
            {/* Guided Breathing */}
            <div className="glass-card p-6 border-t-4 border-t-cyan-500 text-left">
              <h3 className="font-bold text-white mb-2 text-lg">🧘 Guided Breathing</h3>
              <p className="text-xs text-gray-400 mb-4">
                Follow the visual circle to lower your heart rate. Inhale as it expands, exhale as it contracts.
              </p>
              <BreathingExercise />
            </div>

            {/* Desk Stretches */}
            <div className="glass-card p-6 border-t-4 border-t-emerald-500 text-left">
              <h3 className="font-bold text-white mb-2 text-lg">🤸 Quick Desk Stretches</h3>
              <p className="text-xs text-gray-400 mb-4">
                3 quick exercises to relieve neck and eye strain:
              </p>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">1</span>
                  <span><strong>Neck Rolls:</strong> Slowly roll your head in a full circle, 5 times each direction.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">2</span>
                  <span><strong>Eye 20-20-20:</strong> Look at something 20 feet away for 20 seconds, then blink 20 times.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">3</span>
                  <span><strong>Shoulder Squeeze:</strong> Pull shoulders back, squeeze shoulder blades together, hold 10 seconds × 3.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Calming Audio */}
          <div className="glass-card p-6 mb-8 border-t-4 border-t-indigo-500">
            <h3 className="font-bold text-white mb-2 text-lg">🎧 Calming Audio</h3>
            <p className="text-xs text-gray-400 mb-4">
              Close your eyes and listen to ambient sounds for a few minutes.
            </p>
            <iframe
              className="w-full rounded-xl opacity-90"
              height="80"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?si=auto&start=0"
              title="Lofi Girl - beats to relax/study to"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Return Button */}
          <Link href="/dashboard">
            <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50">
              I&apos;m Refreshed — Return to Dashboard
            </button>
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Taking regular breaks improves retention by up to 30%.
          </p>
        </div>
      </main>
    </>
  );
}
