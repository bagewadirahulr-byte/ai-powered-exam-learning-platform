// ============================================
// Cookie Consent Banner
// GDPR-compliant cookie consent component
// ============================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Cookie icon + text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍪</span>
              <h3 className="text-base font-bold text-white">We use cookies</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              We use essential cookies for authentication and session management. No advertising
              or third-party tracking cookies are used. Read our{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>{" "}
              for more details.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 md:flex-none rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
