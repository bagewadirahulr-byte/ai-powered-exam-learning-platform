// ============================================
// Landing Page — AI-Powered Exam Learning Platform
// Premium dark theme with gradients, glow, and animations
// ============================================

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { PLANS } from "@/config/constants";




// --- Pricing Card Component ---
function PricingCard({
  name,
  price,
  features,
  popular = false,
}: {
  name: string;
  price: number;
  features: readonly string[];
  popular?: boolean;
}) {
  return (
    <div
      className={`glass-card relative p-8 transition-all duration-300 hover:scale-[1.02] ${
        popular ? "border-blue-500/50 glow-blue" : ""
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <h3 className="mb-2 text-xl font-bold text-white">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">
          {price === 0 ? "Free" : `₹${price}`}
        </span>
        {price > 0 && <span className="text-gray-400">/month</span>}
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-green-400">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? "primary" : "outline"}
        size="md"
        className="w-full"
      >
        {price === 0 ? "Get Started Free" : "Subscribe Now"}
      </Button>
    </div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="grid-bg relative flex min-h-screen items-center justify-center px-6 pt-20">
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[128px] animate-pulse-glow" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px] animate-pulse-glow" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Gemini AI
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
            Study Smarter with{" "}
            <span className="gradient-text">AI-Powered</span> Learning
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
            Generate comprehensive notes, quizzes, flashcards, and Q&A instantly
            using AI. Your ultimate exam preparation companion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                🚀 Start Learning Free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                See Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Students" },
              { value: "50K+", label: "Notes Generated" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative py-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              Features
            </span>
            <h2 className="mb-4 text-4xl font-bold text-white">
              Everything You Need to{" "}
              <span className="gradient-text">Ace Your Exams</span>
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              Currently powered by Google&apos;s Gemini 2.5 Flash AI — our
              platform generates high-quality, structured study materials
              instantly. We&apos;re starting with the essentials and building
              towards something extraordinary.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Notes */}
            <div className="glass-card group p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl shadow-lg">
                📝
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                AI Notes
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Get comprehensive, well-structured study notes on any topic. Our
                AI breaks down complex subjects into clear sections with
                explanations, key points, and examples.
              </p>
            </div>

            {/* Quiz */}
            <div className="glass-card group p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-lg">
                ❓
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Smart Quizzes
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AI-generated multiple-choice questions that test your
                understanding. Each question comes with 4 options and the
                correct answer — perfect for self-assessment.
              </p>
            </div>

            {/* Flashcards */}
            <div className="glass-card group p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 text-2xl shadow-lg">
                🃏
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Flashcards
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Quick revision cards with key terms and definitions. Flip
                through AI-curated flashcards to memorize important concepts
                before your exam.
              </p>
            </div>

            {/* Q&A */}
            <div className="glass-card group p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-2xl shadow-lg">
                💬
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Q&A Pairs
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Important exam-style questions with detailed answers. Practice
                long-answer and short-answer questions generated specifically
                for your topic and difficulty level.
              </p>
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="glass-card flex items-center gap-4 p-5 transition-all duration-300 hover:border-white/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-lg">
                🌱
              </div>
              <div>
                <h4 className="font-semibold text-white">Beginner</h4>
                <p className="text-xs text-gray-400">
                  Simple explanations for newcomers to the topic
                </p>
              </div>
            </div>
            <div className="glass-card flex items-center gap-4 p-5 transition-all duration-300 hover:border-white/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/20 text-lg">
                ⚡
              </div>
              <div>
                <h4 className="font-semibold text-white">Intermediate</h4>
                <p className="text-xs text-gray-400">
                  Balanced depth for regular exam preparation
                </p>
              </div>
            </div>
            <div className="glass-card flex items-center gap-4 p-5 transition-all duration-300 hover:border-white/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-lg">
                🔥
              </div>
              <div>
                <h4 className="font-semibold text-white">Advanced</h4>
                <p className="text-xs text-gray-400">
                  In-depth, challenging content for competitive exams
                </p>
              </div>
            </div>
          </div>

          {/* Roadmap / Future Banner */}
          <div className="mt-12 glass-card border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Roadmap
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              This Is Just the Beginning 🚀
            </h3>
            <p className="mx-auto max-w-2xl text-sm text-gray-400">
              We&apos;re currently using Gemini AI as our foundation. In the
              future, we plan to expand ExamAI into a{" "}
              <span className="font-medium text-blue-400">
                full mobile app
              </span>{" "}
              with advanced AI modules — including AI-powered study planners,
              voice-based learning, handwriting recognition, smart revision
              schedules, and multi-language support. Stay tuned!
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="relative py-24 px-6">
        {/* Background gradient */}
        <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" />

        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
              How It Works
            </span>
            <h2 className="mb-4 text-4xl font-bold text-white">
              Your Study Guide in{" "}
              <span className="gradient-text">4 Simple Steps</span>
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              Follow this quick guide to generate AI-powered study materials
              tailored to your topic and skill level.
            </p>
          </div>

          {/* Steps — Vertical Timeline */}
          <div className="relative space-y-8">
            {/* Connecting line */}
            <div className="absolute left-7 top-10 bottom-10 hidden w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:block" />

            {/* Step 1: Enter Topic */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  ✏️ Enter Your Topic
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Go to the <span className="font-medium text-blue-400">Generate</span> page
                  from your dashboard. In the topic field, type any subject
                  you want to study — for example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Photosynthesis", "World War II", "Newton's Laws", "Data Structures", "Indian Constitution"].map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Choose Content Type */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-xl font-bold text-white shadow-lg shadow-purple-500/30">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  📋 Choose Your Content Type
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Select the type of study material you want the AI to
                  generate. Each type is designed for a different learning
                  style:
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-center">
                    <div className="text-2xl">📝</div>
                    <div className="mt-1 text-xs font-medium text-blue-400">Notes</div>
                  </div>
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
                    <div className="text-2xl">❓</div>
                    <div className="mt-1 text-xs font-medium text-purple-400">Quiz</div>
                  </div>
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-center">
                    <div className="text-2xl">🃏</div>
                    <div className="mt-1 text-xs font-medium text-orange-400">Flashcards</div>
                  </div>
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center">
                    <div className="text-2xl">💬</div>
                    <div className="mt-1 text-xs font-medium text-green-400">Q&A</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Select Difficulty */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 text-xl font-bold text-white shadow-lg shadow-yellow-500/30">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  🎯 Select Difficulty Level
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Pick a difficulty that matches your current understanding.
                  This helps the AI adjust the complexity and depth of the
                  content:
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
                    <span>🌱</span>
                    <span className="text-sm font-medium text-green-400">Beginner</span>
                    <span className="text-xs text-gray-500">— Easy, simple terms</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
                    <span>⚡</span>
                    <span className="text-sm font-medium text-yellow-400">Intermediate</span>
                    <span className="text-xs text-gray-500">— Balanced depth</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2">
                    <span>🔥</span>
                    <span className="text-sm font-medium text-red-400">Advanced</span>
                    <span className="text-xs text-gray-500">— Competitive level</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Generate & Study */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-green-500/30">
                4
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  🚀 Generate & Start Studying
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Hit the <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">Generate Content (1 Credit)</span> button
                  and wait a few seconds. The AI will create your study
                  material instantly. You can then:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Read through AI-generated notes with clear sections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Take interactive quizzes to test your knowledge
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Flip through flashcards for quick revision
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Download content as PDF for offline study
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
              Pricing
            </span>
            <h2 className="mb-4 text-4xl font-bold text-white">
              Simple, <span className="gradient-text">Affordable</span> Plans
            </h2>
            <p className="mx-auto max-w-xl text-gray-400">
              Start free with 5 credits. Upgrade anytime for unlimited AI power.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              name={PLANS.free.name}
              price={PLANS.free.price}
              features={PLANS.free.features}
            />
            <PricingCard
              name={PLANS.pro.name}
              price={PLANS.pro.price}
              features={PLANS.pro.features}
              popular
            />
            <PricingCard
              name={PLANS.premium.name}
              price={PLANS.premium.price}
              features={PLANS.premium.features}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-24 px-6">
        <div className="glass-card glow-blue mx-auto max-w-4xl p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to <span className="gradient-text">Supercharge</span> Your
            Learning?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-400">
            Join thousands of students using AI to prepare smarter, not harder.
            Start with 5 free credits today.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              🚀 Get Started — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
