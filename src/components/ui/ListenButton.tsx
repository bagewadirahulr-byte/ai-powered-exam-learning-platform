"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Volume2, Square, AlertCircle } from "lucide-react";

type ListenButtonProps = {
  text: string;
  language?: string;
  className?: string;
};

/**
 * BCP-47 language tags for browser SpeechSynthesis voice matching.
 * The browser picks the best available voice matching these tags.
 */
const LANG_BCP47: Record<string, string> = {
  english: "en-IN",
  hindi: "hi-IN",
  urdu: "ur-IN",
  kannada: "kn-IN",
  tamil: "ta-IN",
  thamil: "ta-IN",
  telugu: "te-IN",
  malayalam: "ml-IN",
};

/**
 * Finds the best SpeechSynthesis voice for a given BCP-47 language code.
 * Priority: exact match > language prefix match > any available voice.
 */
function findVoice(bcp47: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const langPrefix = bcp47.split("-")[0]; // e.g. "hi" from "hi-IN"

  // 1. Exact match (e.g. "hi-IN")
  const exact = voices.find((v) => v.lang === bcp47);
  if (exact) return exact;

  // 2. Prefix match (e.g. "hi")
  const prefix = voices.find((v) => v.lang.startsWith(langPrefix));
  if (prefix) return prefix;

  // 3. Any Indian variant
  const indian = voices.find((v) => v.lang.endsWith("-IN"));
  if (indian) return indian;

  return null;
}

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const playModeRef = useRef<"browser" | "server" | null>(null);

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
    // Stop browser speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    utteranceRef.current = null;

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

    playModeRef.current = null;

    if (mountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
      setProgress("");
    }
  }, []);

  // ──────────── ENGINE 1: Browser SpeechSynthesis ────────────
  const playViaBrowser = useCallback(
    (cleanText: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const bcp47 = LANG_BCP47[language.toLowerCase()] || "en-IN";
        const voice = findVoice(bcp47);

        if (!voice) {
          console.log("[TTS] No browser voice for", bcp47);
          resolve(false);
          return;
        }

        console.log("[TTS] Using browser voice:", voice.name, voice.lang);

        // Truncate for browser TTS (browsers struggle with very long text)
        const truncated = cleanText.length > 5000 ? cleanText.slice(0, 5000) + "..." : cleanText;

        const utterance = new SpeechSynthesisUtterance(truncated);
        utterance.voice = voice;
        utterance.lang = bcp47;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utteranceRef.current = utterance;
        playModeRef.current = "browser";

        utterance.onstart = () => {
          if (mountedRef.current) {
            setIsPlaying(true);
            setIsLoading(false);
            setProgress("");
          }
        };

        utterance.onend = () => {
          if (mountedRef.current) {
            setIsPlaying(false);
            playModeRef.current = null;
          }
        };

        utterance.onerror = (e) => {
          console.warn("[TTS] Browser speech error:", e.error);
          // "interrupted" is not a real error — user stopped it
          if (e.error !== "interrupted" && e.error !== "canceled") {
            resolve(false);
            return;
          }
          if (mountedRef.current) {
            setIsPlaying(false);
            playModeRef.current = null;
          }
        };

        // Chrome bug: voices sometimes aren't loaded yet
        // Retry with a small delay if speech doesn't start
        const startTimeout = setTimeout(() => {
          if (!speechSynthesis.speaking && mountedRef.current) {
            console.warn("[TTS] Browser speech didn't start, falling back");
            speechSynthesis.cancel();
            resolve(false);
          }
        }, 2000);

        utterance.onstart = () => {
          clearTimeout(startTimeout);
          if (mountedRef.current) {
            setIsPlaying(true);
            setIsLoading(false);
            setProgress("");
          }
          resolve(true); // Speech started successfully
        };

        speechSynthesis.speak(utterance);
      });
    },
    [language]
  );

  // ──────────── ENGINE 2: Server Edge TTS ────────────
  const playViaServer = useCallback(
    async (cleanText: string): Promise<boolean> => {
      const controller = new AbortController();
      abortRef.current = controller;

      // Limit text to prevent excessive processing
      const truncated = cleanText.length > 4000 ? cleanText.slice(0, 4000) : cleanText;

      setProgress("Generating audio...");

      const timeoutId = setTimeout(() => controller.abort(), 90_000);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: truncated, language }),
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

        // Create a proper blob with explicit MIME type
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 100) {
          throw new Error("Audio too small");
        }

        const blob = new Blob([arrayBuffer], { type: contentType });
        const url = URL.createObjectURL(blob);

        if (mountedRef.current) {
          setAudioSrc(url);
          playModeRef.current = "server";
        }

        // Wait a tick for the audio element to get the new src
        await new Promise((r) => setTimeout(r, 100));

        // Play through the DOM audio element
        if (audioElRef.current && mountedRef.current) {
          audioElRef.current.volume = 1.0;
          audioElRef.current.muted = false;
          try {
            await audioElRef.current.play();
          } catch (playError: any) {
            console.warn("[TTS] Autoplay prevented by browser. User must click play manually.", playError);
            // Still return true because the audio is loaded and the controls are visible!
          }
          return true;
        }

        return false;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === "AbortError") {
          return false; // user cancelled
        }
        throw err;
      }
    },
    [language]
  );

  // ──────────── MAIN TOGGLE HANDLER ────────────
  const handleToggle = useCallback(async () => {
    // If playing, stop
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

      // ── ALWAYS USE ENGINE 2: Server Gemini TTS ──
      // Bypassing browser SpeechSynthesis because it silently fails on many devices
      // and the user specifically requested to use the Gemini model for generation.
      if (!mountedRef.current) return;
      setProgress("Generating AI audio...");

      const serverWorked = await playViaServer(cleanText);

      if (serverWorked) {
        if (mountedRef.current) {
          setIsPlaying(true);
          setIsLoading(false);
          setProgress("");
        }
        return; // 🎉 Success via server
      }

      throw new Error("Could not play audio");
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Audio failed";
      console.error("[TTS] Error:", msg);
      setError(msg);
      setIsLoading(false);
      setProgress("");
    }
  }, [isPlaying, isLoading, text, stopAll, playViaBrowser, playViaServer]);

  // Determine visual state
  const showError = error && !isPlaying && !isLoading;

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
        title={showError ? error : isPlaying ? "Stop" : isLoading ? progress : "Listen to content"}
        aria-label={isPlaying ? "Stop audio" : "Listen to content"}
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

      {/* Single Native Audio Element — user can manually play/seek/adjust volume if autoplay fails */}
      {audioSrc && (
        <audio
          ref={audioElRef}
          src={audioSrc}
          controls
          preload="auto"
          className="w-full max-w-xs h-10 mt-2 rounded-lg border border-border bg-background shadow-sm"
          onPlay={() => {
            if (mountedRef.current && playModeRef.current === "server") {
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
              playModeRef.current = null;
            }
          }}
          onError={() => {
            if (mountedRef.current && playModeRef.current === "server") {
              setError("Playback failed");
              setIsPlaying(false);
              setIsLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
