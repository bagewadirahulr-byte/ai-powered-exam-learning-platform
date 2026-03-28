"use client";

import { useState } from "react";
import { generateContent } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ContentType = "notes" | "quiz" | "flashcards" | "qna";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ContentType>("notes");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a specific topic to study.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const res = await generateContent(formData);
      
      if (res.success && res.contentId) {
        // Redirect directly to the newly generated content!
        router.push(`/dashboard/content/${res.contentId}`);
      } else {
        // Handle cases where success is false but no error was thrown
        setError(res.message || "Failed to generate study material.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(error instanceof Error ? error.message : "An unknown error occurred during AI generation.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] mt-[80px] flex flex-col items-center justify-center px-6 py-12">
      {/* Immersive Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div className="relative mb-8 h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-blue-500/40" />
            <div className="flex h-full w-full items-center justify-center rounded-full border border-blue-500/30 bg-gray-900 shadow-2xl shadow-blue-500/20">
              <span className="animate-bounce text-4xl">🧠</span>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">AI is Thinking...</h2>
          <p className="max-w-xs text-center text-gray-400">
            Crafting your specialized {type === 'qna' ? 'Q&A' : type} on <span className="text-blue-400 font-medium">{topic}</span>. 
            This usually takes 5-10 seconds.
          </p>
          <div className="mt-8 flex gap-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0s' }} />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }} />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      <div className={`w-full max-w-xl rounded-2xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10 text-center transition-all duration-500 ${loading ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
        
        <div className="mb-4 text-5xl">🧠</div>
        <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">
          Create Study Material
        </h1>
        <p className="mb-8 text-gray-400">
          Transform any topic into instant lessons using Google Gemini AI.
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/30 p-4 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex flex-col gap-6 text-left">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to learn?
            </label>
            <input 
              name="topic"
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cellular Respiration, React Hooks, World War II..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 whitespace-nowrap">
              {['notes', 'quiz', 'flashcards', 'qna'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t as ContentType)}
                  className={`capitalize rounded-lg border p-3 text-sm font-medium transition-all ${
                    type === t 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                  disabled={loading}
                >
                  {t === 'qna' ? 'Q&A' : t}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-all ${
                    level === l 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                  disabled={loading}
                >
                  {l}
                </button>
              ))}
            </div>
            <input type="hidden" name="level" value={level} />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !topic.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              'Generate Content (1 Credit)'
            )}
          </button>
        </form>

        <div className="mt-8">
           <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">
              ← Cancel & return to Dashboard
           </Link>
        </div>
      </div>
    </div>
  );
}
