"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Volume2, Square, AlertCircle } from "lucide-react";

type ListenButtonProps = {
  text: string;
  language?: string;
  className?: string;
};

// Global cache for current session to avoid repeated API calls for same text
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
    // 1. If currently playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 2. Preprocess text (Strip markdown for cleaner speech)
      const cleanText = text
        .replace(/[*#_`~]/g, '') // Remove formatting symbols
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
        .trim();

      if (!cleanText) {
        throw new Error("No readable text content");
      }

      // 3. Check Cache
      const cacheKey = `${language}-${cleanText.substring(0, 40)}-${cleanText.length}`;
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        console.log(`[TTS Frontend] Fetching audio for: ${language}`);
        
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText, language }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || "Failed to generate audio");
        }

        // 4. Convert Base64 to Blob URL
        // Fetch is much more efficient than manual ArrayBuffer conversion for large base64 strings
        const audioRes = await fetch(`data:audio/mpeg;base64,${data.audioContent}`);
        const blob = await audioRes.blob();
        audioUrl = URL.createObjectURL(blob);
        
        audioCache.set(cacheKey, audioUrl);
      }

      // 5. Play Audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = (e) => {
        console.error("[TTS Frontend] Audio Playback Error:", e);
        setError("Playback failed");
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();

    } catch (err: any) {
      console.error("[TTS Frontend] Process Error:", err.message);
      setError(err.message || "Failed to load audio");
      setIsLoading(false);
    }
  }, [isPlaying, text, language]);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group relative inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isPlaying
          ? "border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
          : error
          ? "border-red-500/40 bg-red-500/10 text-red-400"
          : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-white"
      } ${isLoading ? "cursor-wait opacity-80" : "cursor-pointer"} ${className}`}
      title={error || (isPlaying ? "Stop audio" : "Listen to content")}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="h-4 w-4 fill-current" />
      ) : error ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
      )}
      
      <span>
        {isLoading ? "Generating..." : isPlaying ? "Stop" : error ? "Try Again" : "Listen"}
      </span>

      {error && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-900 px-2 py-1 text-[10px] text-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
          {error}
        </span>
      )}
    </button>
  );
}
