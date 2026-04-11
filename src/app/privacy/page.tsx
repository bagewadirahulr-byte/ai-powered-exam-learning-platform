// ============================================
// Privacy Policy Page
// /privacy — Public legal page
// ============================================

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${APP_NAME} — Learn how we collect, use, and protect your data.`,
};

const SUPPORT_EMAIL = "gururajbagewadi00@gmail.com";
const EFFECTIVE_DATE = "April 11, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-16">
        <article className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              Legal
            </span>
            <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">
              Privacy <span className="gradient-text">Policy</span>
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
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">1</span>
                Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to {APP_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
                your privacy and ensuring the security of your personal information. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our
                AI-powered exam learning platform.
              </p>
            </section>

            {/* Section 2 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">2</span>
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div>
                  <h3 className="mb-2 font-semibold text-white">2.1 Account Information</h3>
                  <p>
                    When you create an account via our authentication provider (Clerk), we collect your
                    name, email address, and profile picture. We do <strong className="text-white">not</strong> store
                    passwords — authentication is handled entirely by Clerk&apos;s secure infrastructure.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-white">2.2 Usage Data</h3>
                  <p>
                    We store records of the study materials you generate (notes, quizzes, flashcards, Q&amp;A),
                    including the topics and content type, in our secure Neon PostgreSQL database.
                    This data is linked to your account and is used solely to provide you with
                    your study history and dashboard features.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-white">2.3 Payment Information</h3>
                  <p>
                    Payment processing is handled by Razorpay. We do <strong className="text-white">not</strong> store
                    your credit card numbers, UPI IDs, or banking details. We only store Razorpay
                    transaction IDs and order IDs for record-keeping and credit allocation purposes.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-white">2.4 Cookies</h3>
                  <p>
                    We use essential cookies for authentication session management (provided by Clerk)
                    and user preference storage (such as cookie consent). We do not use third-party
                    advertising or tracking cookies.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">3</span>
                How We Use Your Information
              </h2>
              <ul className="space-y-3 text-gray-300">
                {[
                  "To provide and maintain the ExamAI platform and its features",
                  "To generate personalized AI study materials based on your requests",
                  "To manage your account, credits, and subscription status",
                  "To process payments and allocate credits to your account",
                  "To communicate with you regarding your account or support requests",
                  "To improve our platform and develop new features",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-green-400 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">4</span>
                Third-Party Services
              </h2>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>We use the following third-party services to operate our platform:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Clerk", purpose: "Authentication & user management" },
                    { name: "Neon", purpose: "PostgreSQL database hosting" },
                    { name: "Google Gemini AI", purpose: "AI content generation" },
                    { name: "Razorpay", purpose: "Payment processing" },
                    { name: "Vercel", purpose: "Application hosting & deployment" },
                  ].map((service) => (
                    <div key={service.name} className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <div className="font-semibold text-white text-sm">{service.name}</div>
                      <div className="text-xs text-gray-400">{service.purpose}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Each of these services has their own privacy policies governing their use of data.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">5</span>
                Data Security
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your data, including:
                encrypted database connections (SSL/TLS), HMAC SHA256 payment signature verification,
                parameterized database queries to prevent SQL injection, secure HttpOnly session cookies,
                and server-side-only execution of sensitive operations. However, no method of transmission
                over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 6 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">6</span>
                Your Rights
              </h2>
              <ul className="space-y-3 text-gray-300">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate personal data",
                  "Request deletion of your account and associated data",
                  "Withdraw consent for data processing at any time",
                  "Export your generated content history",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-blue-400 shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-gray-400 text-sm">
                To exercise any of these rights, please contact us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-400 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>

            {/* Section 7 */}
            <section className="glass-card p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">7</span>
                Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
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
