"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Volume2, Square, AlertCircle } from "lucide-react";

type ListenButtonProps = {
  text: string;
  language?: string;
  className?: string;
};

/**
 * Clean raw content text for TTS — strips markdown, bullets, excess whitespace.
 */
function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/[*#_`~|]/g, "")               // markdown symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // link text only
    .replace(/\n{3,}/g, "\n\n")              // collapse newlines
    .replace(/^\s*[-•]\s*/gm, "")            // strip bullets
    .replace(/\s{2,}/g, " ")                 // collapse whitespace
    .trim();
}

/**
 * Normalize language string — handles common variations.
 */
function normalizeLang(lang: string): string {
  const map: Record<string, string> = {
    english: "english",
    hindi: "hindi",
    kannada: "kannada",
    tamil: "tamil",
    thamil: "tamil",
    telugu: "telugu",
    thelugu: "telugu",
    malayalam: "malayalam",
    urdu: "urdu",
  };
  return map[lang.toLowerCase()] || "english";
}

export default function ListenButton({
  text,
  language = "english",
  className = "",
}: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────── STOP ALL PLAYBACK ────────────
  const stopAll = useCallback(() => {
    // Stop audio element
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }

    // Abort fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (mountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
      setProgress("");
    }
  }, []);

  // ──────────── GENERATE & PLAY VIA GEMINI TTS API ────────────
  const playViaServer = useCallback(
    async (cleanText: string): Promise<boolean> => {
      const controller = new AbortController();
      abortRef.current = controller;

      const normalizedLang = normalizeLang(language);

      // Truncate for TTS (keep under API limit)
      const truncated = cleanText.length > 6000 ? cleanText.slice(0, 6000) : cleanText;

      setProgress("Generating AI audio...");

      const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: truncated, language: normalizedLang }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let msg = `Server error (${response.status})`;
          try {
            const err = await response.json();
            msg = err.details || err.error || msg;
          } catch {
            // non-JSON error
          }
          throw new Error(msg);
        }

        const contentType = response.headers.get("Content-Type") || "audio/wav";
        if (!contentType.includes("audio")) {
          throw new Error("Server didn't return audio");
        }

        // Create audio blob
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 100) {
          throw new Error("Audio response too small");
        }

        const blob = new Blob([arrayBuffer], { type: contentType });
        const url = URL.createObjectURL(blob);

        // Clean up previous audio URL
        if (audioSrc) {
          URL.revokeObjectURL(audioSrc);
        }

        if (mountedRef.current) {
          setAudioSrc(url);
        }

        // Wait for the audio element to pick up the new src
        await new Promise((r) => setTimeout(r, 150));

        // Play through the DOM audio element
        if (audioElRef.current && mountedRef.current) {
          audioElRef.current.volume = 1.0;
          audioElRef.current.muted = false;
          try {
            await audioElRef.current.play();
          } catch (playError: unknown) {
            console.warn("[TTS] Autoplay blocked by browser. User can click the player controls.", playError);
            // Still return true — audio is loaded, user can manually play
          }
          return true;
        }

        return false;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === "AbortError") {
          return false; // user cancelled or timeout
        }
        throw err;
      }
    },
    [language, audioSrc]
  );

  // ──────────── MAIN TOGGLE HANDLER ────────────
  const handleToggle = useCallback(async () => {
    // If playing or loading, stop
    if (isPlaying || isLoading) {
      stopAll();
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress("Preparing...");

    try {
      const cleanText = cleanTextForSpeech(text);
      if (!cleanText || cleanText.length < 2) {
        throw new Error("No readable text");
      }

      if (!mountedRef.current) return;
      setProgress("Generating AI audio...");

      const serverWorked = await playViaServer(cleanText);

      if (serverWorked) {
        if (mountedRef.current) {
          setIsPlaying(true);
          setIsLoading(false);
          setProgress("");
        }
        return;
      }

      throw new Error("Could not generate audio. Please try again.");
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Audio failed";
      console.error("[TTS] Error:", msg);
      setError(msg);
      setIsLoading(false);
      setProgress("");
    }
  }, [isPlaying, isLoading, text, stopAll, playViaServer]);

  // Determine visual state
  const showError = error && !isPlaying && !isLoading;
  const langLabel = normalizeLang(language);

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      {/* Main Listen Button */}
      <button
        onClick={handleToggle}
        className={`group relative inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isPlaying
            ? "border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
            : isLoading
            ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
            : showError
            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15"
            : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-white"
        } cursor-pointer`}
        title={showError ? error : isPlaying ? "Stop" : isLoading ? progress : `Listen in ${langLabel}`}
        aria-label={isPlaying ? "Stop audio" : `Listen to content in ${langLabel}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Square className="h-4 w-4 fill-current" />
        ) : showError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
        )}

        <span>
          {isLoading
            ? progress || "Generating..."
            : isPlaying
            ? "Stop"
            : showError
            ? "Retry"
            : "Listen"}
        </span>

        {showError && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-900 px-2 py-1 text-[10px] text-red-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {error}
          </span>
        )}
      </button>

      {/* Native Audio Player — visible after audio is generated */}
      {audioSrc && (
        <audio
          ref={audioElRef}
          src={audioSrc}
          controls
          preload="auto"
          className="w-full max-w-xs h-10 mt-2 rounded-lg border border-border bg-background shadow-sm"
          onPlay={() => {
            if (mountedRef.current) {
              setIsPlaying(true);
              setIsLoading(false);
              setProgress("");
            }
          }}
          onPause={() => {
            if (mountedRef.current) {
              setIsPlaying(false);
            }
          }}
          onEnded={() => {
            if (mountedRef.current) {
              setIsPlaying(false);
            }
          }}
          onError={() => {
            if (mountedRef.current) {
              setError("Playback failed — try again");
              setIsPlaying(false);
              setIsLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
