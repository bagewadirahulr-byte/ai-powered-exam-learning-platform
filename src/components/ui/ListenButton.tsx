"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/config/constants";

// ============================================
// Listen Button — Chunked Web Speech API TTS
// Fixes: startup lag, Chrome 15s cutoff, voice
//        selection, and progress tracking
// ============================================

const CHUNK_SIZE = 200; // max characters per utterance chunk
const CHROME_KEEPALIVE_MS = 10_000; // pause/resume every 10s to prevent Chrome cutoff

/**
 * Split text into sentence-aware chunks of ~CHUNK_SIZE characters.
 * Splits at sentence boundaries (period, exclamation, question, Devanagari danda, newline).
 */
function chunkText(text: string, maxLen = CHUNK_SIZE): string[] {
  // Split at sentence-ending punctuation (including Hindi/Sanskrit danda ।॥)
  const sentences = text.split(/(?<=[.!?।॥\n])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

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
  const [progress, setProgress] = useState("");
  const [hasVoice, setHasVoice] = useState(true);
  const isPlayingRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Pre-load voices on mount (they load asynchronously) ---
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) return; // Not loaded yet

      // Check if any voice matches the target language
      const langConfig =
        SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
      const bcp47 = langConfig?.bcp47 || "en-IN";
      const langPrefix = bcp47.split("-")[0];
      const match = voices.some((v) => v.lang.startsWith(langPrefix));
      setHasVoice(match || langPrefix === "en");
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [language]);

  // --- Stop playback and clean up ---
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setProgress("");
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  // --- Play: chunk text and queue utterances sequentially ---
  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Clear any previous speech
    window.speechSynthesis.cancel();

    const langConfig =
      SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
    const bcp47 = langConfig?.bcp47 || "en-IN";

    // Find the best available voice for this language
    const voices = speechSynthesis.getVoices();
    const langPrefix = bcp47.split("-")[0];
    const bestVoice =
      voices.find((v) => v.lang === bcp47) ||
      voices.find((v) => v.lang.startsWith(langPrefix)) ||
      voices.find((v) => v.lang.startsWith("en"));

    const chunks = chunkText(text);
    let currentIndex = 0;

    // Chrome keepalive: pause/resume every 10s to prevent the 15-second cutoff bug
    keepAliveRef.current = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, CHROME_KEEPALIVE_MS);

    const speakNext = () => {
      if (currentIndex >= chunks.length || !isPlayingRef.current) {
        stop();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
      utterance.lang = bcp47;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      if (bestVoice) utterance.voice = bestVoice;

      setProgress(`${currentIndex + 1}/${chunks.length}`);

      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };
      // On error: skip this chunk and move to the next one
      utterance.onerror = () => {
        currentIndex++;
        speakNext();
      };

      speechSynthesis.speak(utterance);
    };

    isPlayingRef.current = true;
    setIsPlaying(true);
    speakNext();
  }, [text, language, stop]);

  // --- Toggle handler ---
  const handleToggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      play();
    }
  }, [stop, play]);

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
      title={
        !hasVoice
          ? `Voice not available for ${language} on this browser. Try Chrome on Android for best Indian language support.`
          : undefined
      }
    >
      {isPlaying
        ? `⏹ Stop (${progress})`
        : hasVoice
          ? "🔊 Listen"
          : "🔇 No Voice"}
    </button>
  );
}
