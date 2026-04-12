"use client";

import { useState, useCallback, useRef } from "react";
import { SUPPORTED_LANGUAGES } from "@/config/constants";

// ============================================
// Listen Button — Web Speech API TTS
// Zero-cost audio narration with BCP-47 mapping
// ============================================

type ListenButtonProps = {
  text: string;
  language?: string; // key from SUPPORTED_LANGUAGES
  className?: string;
};

export default function ListenButton({
  text,
  language = "english",
  className = "",
}: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleToggle = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPlaying) {
      // Stop
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Start narration
    window.speechSynthesis.cancel(); // Clear any queued speech

    const langConfig =
      SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
    const bcp47 = langConfig?.bcp47 || "en-IN";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [isPlaying, text, language]);

  // Don't render on server or if browser doesn't support TTS
  if (typeof window !== "undefined" && !window.speechSynthesis) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
        isPlaying
          ? "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
      } ${className}`}
      aria-label={isPlaying ? "Stop narration" : "Listen to content"}
    >
      {isPlaying ? "⏹ Stop" : "🔊 Listen"}
    </button>
  );
}
