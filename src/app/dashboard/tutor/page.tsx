// ============================================
// Tutor Chatbot Page — Suspense Boundary
// Required for useSearchParams in App Router
// ============================================

import { Suspense } from "react";
import TutorChat from "./TutorChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor | ExamAI",
  robots: { index: false, follow: false },
};

function TutorLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading AI Tutor...</p>
      </div>
    </main>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<TutorLoading />}>
      <TutorChat />
    </Suspense>
  );
}
