// ============================================
// Bug Report Page
// /bug-report — Structured bug reporting
// ============================================

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/config/constants";
import { Bug, Send } from "lucide-react";

const SUPPORT_EMAIL = "gururajbagewadi00@gmail.com";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low", description: "Minor issue, cosmetic", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  { value: "medium", label: "Medium", description: "Functionality affected", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { value: "high", label: "High", description: "Major feature broken", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  { value: "critical", label: "Critical", description: "App unusable / data loss", color: "text-red-400 bg-red-500/10 border-red-500/30" },
] as const;

export default function BugReportPage() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userName = user?.fullName || "Anonymous";
    const userEmail = user?.emailAddresses[0]?.emailAddress || "Not signed in";

    const subjectLine = `[${APP_NAME} Bug] [${severity.toUpperCase()}] ${title}`;
    const body = [
      `Bug Report — ${APP_NAME}`,
      `${"=".repeat(40)}`,
      ``,
      `Reporter: ${userName} (${userEmail})`,
      `Severity: ${severity.toUpperCase()}`,
      ``,
      `Title: ${title}`,
      ``,
      `Description:`,
      description,
      ``,
      `Steps to Reproduce:`,
      steps || "Not provided",
      ``,
      `Expected Behavior:`,
      expected || "Not provided",
      ``,
      `Actual Behavior:`,
      actual || "Not provided",
      ``,
      `${"=".repeat(40)}`,
      `Browser: ${typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join("\n");

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-16">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400">
              Bug Report
            </span>
            <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">
              Report a <span className="gradient-text">Bug</span>
            </h1>
            <p className="text-gray-400">
              Found something broken? Help us fix it by providing details below.
            </p>
          </div>

          {/* Success State */}
          {sent ? (
            <div className="glass-card p-10 text-center">
              <div className="text-5xl mb-6">🐛✅</div>
              <h2 className="text-2xl font-bold text-white mb-3">Report Opened!</h2>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Your email client should have opened with the bug report pre-filled.
                Please click <strong className="text-white">Send</strong> in your email application.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Thank you for helping us improve {APP_NAME}!
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-blue-400 text-sm font-medium hover:underline"
              >
                ← Report another bug
              </button>
            </div>
          ) : (
            /* Bug Report Form */
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                  <Bug className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Bug Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bug Title */}
                <div>
                  <label htmlFor="bug-title" className="block text-sm font-medium text-gray-300 mb-2">
                    Bug Title *
                  </label>
                  <input
                    id="bug-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quiz answers not highlighted correctly"
                    required
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                {/* Severity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Severity *
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SEVERITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSeverity(opt.value)}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          severity === opt.value
                            ? opt.color + " border-current"
                            : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <div className="text-sm font-bold">{opt.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="bug-description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="bug-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the bug in detail..."
                    required
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label htmlFor="bug-steps" className="block text-sm font-medium text-gray-300 mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="bug-steps"
                    rows={3}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder={"1. Go to Generate page\n2. Select 'Quiz' type\n3. Enter topic and click generate\n4. See the error"}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Expected vs Actual */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bug-expected" className="block text-sm font-medium text-gray-300 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      id="bug-expected"
                      rows={3}
                      value={expected}
                      onChange={(e) => setExpected(e.target.value)}
                      placeholder="What should happen..."
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="bug-actual" className="block text-sm font-medium text-gray-300 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      id="bug-actual"
                      rows={3}
                      value={actual}
                      onChange={(e) => setActual(e.target.value)}
                      placeholder="What actually happens..."
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-3.5 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:scale-[1.01] text-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit Bug Report
                </button>

                <p className="text-center text-xs text-gray-500">
                  This will open your email client with the report pre-filled. Click Send to submit.
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
