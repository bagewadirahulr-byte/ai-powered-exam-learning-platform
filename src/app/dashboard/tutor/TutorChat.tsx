"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { sendTutorMessage, type ChatMessage } from "./actions";
import Link from "next/link";
import { ChevronLeft, Send, Bot, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// ============================================
// Tutor Chatbot — Client Component
// Wrapped in Suspense by the parent page.tsx
// ============================================

export default function TutorChat() {
  const searchParams = useSearchParams();
  const hiddenContext = searchParams.get("context") || undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize chat with a welcome message (only once)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const welcomeText = hiddenContext
      ? `Hello! I see you need help with your study topic. How can I assist you?`
      : "Hello! I am ExamAI Tutor. What would you like to study today?";

    setMessages([{ role: "assistant", content: welcomeText }]);
  }, [hiddenContext]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setErrorMsg("");

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await sendTutorMessage(userText, messages, hiddenContext);
      const reply = res.reply;

      if (res.success && reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        setErrorMsg(res.message || "Failed to get a response.");
        // Revert last user message on failure
        setMessages((prev) => prev.slice(0, -1));
        setInput(userText);
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(userText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 sm:px-6 pt-24 pb-12 flex flex-col items-center">
        <div className="w-full max-w-3xl flex-1 flex flex-col h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              Ask AI Tutor
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Context-aware doubt clearance · 1 credit per message
            </p>
          </div>

          {/* Chat Container */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl flex flex-col overflow-hidden shadow-xl shadow-blue-900/5">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {loading && (
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 border-gray-700 border rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-6 py-2 bg-red-900/40 border-t border-red-500/30 text-red-300 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-gray-900 border-t border-white/5">
              <form onSubmit={handleSend} className="relative flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question... (Press Enter to send)"
                  aria-label="Tutor chat input"
                  className="w-full max-h-32 min-h-[52px] bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none overflow-y-auto disabled:opacity-50"
                  rows={1}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
