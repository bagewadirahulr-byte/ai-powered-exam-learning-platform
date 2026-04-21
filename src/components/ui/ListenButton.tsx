"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ============================================
// Listen Button — Google Cloud TTS Backend
// Robust Multilingual Audio Playback
// ============================================

type ListenButtonProps = {
  text: string;
  language?: string; // key from SUPPORTED_LANGUAGES
  className?: string;
};

// Global cache for generated audio to avoid redundant API calls
const audioCache = new Map<string, string>();

export default function ListenButton({
  text,
  language = "english",
  className = "",
}: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleToggle = useCallback(async () => {
    // If currently playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a unique cache key based on language and text content
      const cacheKey = `${language}-${text.substring(0, 50)}-${text.length}`;
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        // Preprocess text: Strip out markdown formatting that TTS might read aloud
        const cleanText = text.replace(/[*#_`]/g, '').trim();

        console.log(`[TTS Frontend] Requesting audio for ${language}...`);
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText, language }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate audio");
        }

        const data = await response.json();

        if (data.fallbackUsed) {
          console.warn("[TTS Frontend] Note: Fallback English voice was used.");
        }

        // Convert base64 to Blob URL for native playback
        // Using fetch to convert base64 data URI to Blob is a clean, modern approach
        const audioBlob = await fetch(`data:audio/mp3;base64,${data.audioContent}`).then(r => r.blob());
        audioUrl = URL.createObjectURL(audioBlob);
        
        // Cache the URL to prevent regenerating the exact same text
        audioCache.set(cacheKey, audioUrl);
      }

      // Play the audio natively
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error("[TTS Frontend] Audio playback error");
        setError("Playback failed");
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);

    } catch (err) {
      console.error("[TTS Frontend] Error:", err);
      setError("Audio unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, text, language]);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
        isPlaying
          ? "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          : error 
          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
      } ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      aria-label={isPlaying ? "Stop narration" : "Listen to content"}
    >
      {isLoading ? "⏳ Loading..." : isPlaying ? "⏹ Stop" : error ? "❌ Error" : "🔊 Listen"}
    </button>
  );
}

