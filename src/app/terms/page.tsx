// ============================================
// Terms of Service Page
// /terms — Public legal page
// ============================================

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${APP_NAME} — Read our terms and conditions for using the platform.`,
};

const SUPPORT_EMAIL = "gururajbagewadi00@gmail.com";
const EFFECTIVE_DATE = "April 11, 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-16">
        <article className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
              Legal
            </span>
            <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-gray-400">
              Last updated: {EFFECTIVE_DATE}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Section 1 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">1</span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using {APP_NAME} (&quot;the Platform&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not use
                the Platform. We reserve the right to modify these Terms at any time, and continued
                use of the Platform constitutes acceptance of any changes.
              </p>
            </section>

            {/* Section 2 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">2</span>
                Description of Service
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {APP_NAME} is an AI-powered exam learning platform that enables users to generate
                study materials including notes, quizzes, flashcards, and Q&amp;A pairs using
                artificial intelligence (Google Gemini AI). The Platform operates on a credit-based
                system where users can access features through free credits or paid subscription plans.
              </p>
            </section>

            {/* Section 3 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">3</span>
                User Accounts
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>
                  To use certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="space-y-2">
                  {[
                    "Provide accurate and complete information during registration",
                    "Maintain the security of your account credentials",
                    "Notify us immediately of any unauthorized use of your account",
                    "Accept responsibility for all activities under your account",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-purple-400 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-400">
                  You must be at least 13 years of age to use this Platform. If you are under 18,
                  you must have parental or guardian consent.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">4</span>
                Credits & Subscriptions
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>
                  The Platform operates on a credit-based system:
                </p>
                <ul className="space-y-2">
                  {[
                    "Free users receive 5 one-time credits upon signup",
                    "Each AI content generation consumes 1 credit",
                    "Paid subscriptions (Monthly, Half-Yearly, Annual) provide additional credits",
                    "Annual plan subscribers receive unlimited content generation during their subscription period",
                    "Credits are non-transferable and non-refundable once allocated",
                    "Unused credits from paid plans do not carry over after the subscription period ends",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-green-400 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">5</span>
                Payments & Refunds
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>
                  All payments are processed securely through Razorpay. By making a purchase, you agree to:
                </p>
                <ul className="space-y-2">
                  {[
                    "Payments are processed in Indian Rupees (INR)",
                    "Subscriptions are one-time payments for the selected duration (not auto-recurring)",
                    "Refund requests may be considered within 7 days of purchase if no credits have been used",
                    "Once credits from a paid plan have been consumed, refunds will not be issued",
                    "For refund requests, contact us at the support email below",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-yellow-400 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">6</span>
                AI-Generated Content Disclaimer
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                  <p className="text-yellow-300 font-medium text-sm">
                    ⚠️ Important Disclaimer
                  </p>
                  <p className="text-gray-300 mt-2 text-sm">
                    All study materials generated by {APP_NAME} are produced by artificial intelligence
                    (Google Gemini AI) and are provided for educational purposes only. While we strive
                    for accuracy, AI-generated content may contain errors, inaccuracies, or
                    outdated information. Users should always verify critical information with
                    authoritative sources and should not rely solely on AI-generated materials for
                    examination preparation.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">7</span>
                Acceptable Use
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>You agree not to:</p>
                <ul className="space-y-2">
                  {[
                    "Use the Platform for any unlawful or unauthorized purpose",
                    "Attempt to reverse-engineer, hack, or exploit the Platform's systems",
                    "Use automated scripts or bots to abuse the AI generation service",
                    "Resell, redistribute, or commercially exploit generated content without attribution",
                    "Impersonate another user or provide false information",
                    "Overwhelm the service with excessive requests (rate limits apply)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-red-400 shrink-0">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">8</span>
                Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, {APP_NAME} and its team shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages, including
                but not limited to loss of data, loss of profits, or academic consequences arising
                from the use of AI-generated content. The Platform is provided &quot;as is&quot; without
                warranties of any kind, either express or implied.
              </p>
            </section>

            {/* Section 9 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">9</span>
                Contact
              </h2>
              <p className="text-gray-300 leading-relaxed">
                For any questions or concerns regarding these Terms of Service, please contact us at:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-400 hover:underline font-medium">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
