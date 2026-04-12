"use client";

import { useState, useEffect } from "react";

// ============================================
// Guided Breathing Exercise — Pure CSS Animation
// Inhale (expand) → Hold → Exhale (contract) cycle
// ============================================

const PHASES = [
  { label: "Inhale", duration: 4000, scale: 1.5 },
  { label: "Hold", duration: 4000, scale: 1.5 },
  { label: "Exhale", duration: 6000, scale: 1.0 },
] as const;

export default function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const phase = PHASES[phaseIndex];
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, phase.duration);

    return () => clearTimeout(timer);
  }, [active, phaseIndex]);

  const currentPhase = PHASES[phaseIndex];

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full rounded-xl bg-cyan-500/10 border border-cyan-500/30 py-3 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20"
      >
        Start Breathing Exercise
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center">
        <div
          className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-transform ease-in-out"
          style={{
            transform: `scale(${currentPhase.scale})`,
            transitionDuration: `${currentPhase.duration}ms`,
          }}
        />
      </div>

      {/* Phase Label */}
      <p className="text-lg font-bold text-white animate-pulse">{currentPhase.label}</p>
      <p className="text-xs text-gray-500">
        {currentPhase.label === "Inhale"
          ? "Breathe in through your nose..."
          : currentPhase.label === "Hold"
          ? "Hold gently..."
          : "Slowly breathe out through your mouth..."}
      </p>

      <button
        onClick={() => {
          setActive(false);
          setPhaseIndex(0);
        }}
        className="text-xs text-gray-500 hover:text-white transition-colors mt-2"
      >
        Stop
      </button>
    </div>
  );
}
