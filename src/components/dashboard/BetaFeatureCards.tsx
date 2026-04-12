"use client";

import { useState } from "react";

// ============================================
// Beta Feature Cards — "Coming Soon" with Modal
// ============================================

const BETA_FEATURES = [
  {
    icon: "📰",
    title: "The Hindu Current Affairs Engine",
    description:
      "Daily AI-summarized insights from The Hindu, specifically mapped to UPSC & State PSC syllabi.",
  },
  {
    icon: "📜",
    title: "PYQ Clone Engine",
    description:
      "Generate infinite variations of Previous Year Questions to master exam patterns.",
  },
  {
    icon: "📈",
    title: "Historical Cut-Off Predictor",
    description:
      "AI analysis of past 10 years of cut-offs to predict safe target scores for your specific category.",
  },
] as const;

export default function BetaFeatureCards() {
  const [modalFeature, setModalFeature] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BETA_FEATURES.map((feature) => (
          <button
            key={feature.title}
            onClick={() => setModalFeature(feature.title)}
            className="glass-card p-5 relative overflow-hidden group border-dashed border-gray-700 text-left cursor-pointer transition-all hover:border-purple-500/30 sm:last:col-span-2 lg:last:col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0" />
            <div className="relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
              <h3 className="font-bold text-gray-300 mb-1">
                {feature.icon} {feature.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Beta Modal */}
      {modalFeature && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalFeature(null)}
        >
          <div
            className="glass-card w-full max-w-md p-8 text-center border-purple-500/20 shadow-2xl shadow-purple-500/10 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-3xl">
              🚀
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {modalFeature}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Our engineers are currently fine-tuning the AI pipelines for this
              feature. Scheduled for <strong className="text-purple-400">v2.0 deployment</strong>.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              In Active Development
            </div>
            <button
              onClick={() => setModalFeature(null)}
              className="rounded-xl bg-gray-800 border border-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
