// ============================================
// Contact / Support Page
// /contact — Public page for user support
// ============================================

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/config/constants";
import { Mail, Copy, Check, Send } from "lucide-react";

const SUPPORT_EMAIL = "gururajbagewadi00@gmail.com";

export default function ContactPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  // Pre-fill from Clerk when available
  useState(() => {
    if (user) {
      setName(user.fullName || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");
    }
  });

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = SUPPORT_EMAIL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subjectLine = subject || `[${APP_NAME}] Support Request`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

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
            <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
              Support
            </span>
            <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-gray-400">
              Have a question, feedback, or need help? We&apos;re here for you.
            </p>
          </div>

          {/* Email Display Card */}
          <div className="glass-card mb-8 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Email us directly</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-blue-400 font-semibold hover:underline text-sm"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Email
                </>
              )}
            </button>
          </div>

          {/* Success State */}
          {sent ? (
            <div className="glass-card p-10 text-center">
              <div className="text-5xl mb-6">📧</div>
              <h2 className="text-2xl font-bold text-white mb-3">Email Client Opened!</h2>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Your email client should have opened with your message pre-filled.
                Please click <strong className="text-white">Send</strong> in your email application.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-blue-400 text-sm font-medium hover:underline"
              >
                ← Send another message
              </button>
            </div>
          ) : (
            /* Contact Form */
            <div className="glass-card p-8">
              <h2 className="mb-6 text-lg font-bold text-white">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How can we help?"
                    required
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    required
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:scale-[1.01] text-sm"
                >
                  <Send className="w-4 h-4" />
                  Open Email Client
                </button>

                <p className="text-center text-xs text-gray-500">
                  This will open your default email application with the message pre-filled.
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
