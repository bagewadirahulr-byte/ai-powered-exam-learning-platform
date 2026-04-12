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
  duration,
  features,
  popular = false,
  best = false,
}: {
  name: string;
  price: number;
  duration: string;
  features: readonly string[];
  popular?: boolean;
  best?: boolean;
}) {
  return (
    <div
      className={`glass-card relative p-8 transition-all duration-300 hover:scale-[1.02] ${
        popular ? "border-blue-500/50 glow-blue" : best ? "border-purple-500/50 glow-purple" : ""
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}
      {best && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-1 text-xs font-semibold text-white">
          Best Value
        </div>
      )}

      <h3 className="mb-2 text-xl font-bold text-white">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">
          {price === 0 ? "Free" : `₹${price}`}
        </span>
        {price > 0 && <span className="text-gray-400">/{duration}</span>}
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-green-400">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link href="/pricing">
        <Button
          variant={popular ? "primary" : "outline"}
          size="md"
          className="w-full"
        >
          {price === 0 ? "Get Started Free" : "Subscribe Now"}
        </Button>
      </Link>
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

          {/* Bento Grid Features */}
          <div className="grid gap-6 md:grid-cols-6 md:grid-rows-2 h-auto">
            {/* AI Notes — Large Card */}
            <div className="md:col-span-4 md:row-span-1 glass-card group p-8 flex flex-col md:flex-row gap-8 transition-all hover:border-blue-500/30 overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 h-48 w-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
              <div className="flex-1 relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    📝
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">Advanced AI Notes</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                    Our AI generates high-fidelity, structured study notes. Complex subjects are broken down into logical sections with clear explanations, key terminology, and real-world examples.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">Structured</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">Comprehensive</span>
                </div>
              </div>
              <div className="hidden md:flex flex-1 items-center justify-center relative">
                  <div className="w-full rotate-2 rounded-xl border border-white/5 bg-white/5 p-4 shadow-2xl group-hover:rotate-0 transition-transform duration-500">
                      <div className="h-4 w-2/3 bg-white/10 rounded mb-3" />
                      <div className="h-3 w-full bg-white/5 rounded mb-2" />
                      <div className="h-3 w-full bg-white/5 rounded mb-2" />
                      <div className="h-3 w-4/5 bg-white/5 rounded" />
                  </div>
              </div>
            </div>

            {/* Smart Quizzes */}
            <div className="md:col-span-2 md:row-span-1 glass-card group p-8 flex flex-col transition-all hover:border-purple-500/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform">
                ❓
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Interactive Quizzes</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Test your mastery with AI-generated multiple-choice questions. Get instant feedback and explanations for every answer.
              </p>
            </div>

            {/* Flashcards */}
            <div className="md:col-span-3 md:row-span-1 glass-card group p-8 flex flex-col transition-all hover:border-orange-500/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 text-3xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                🃏
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Smart Flashcards</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Master terminology with 3D-flipping flashcards. Optimized for quick revision and long-term retention.
              </p>
              <div className="mt-auto flex gap-2">
                  <div className="h-8 w-12 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">🔄</div>
                  <div className="h-8 flex-1 rounded bg-orange-500/5 border border-orange-500/10" />
              </div>
            </div>

            {/* Q&A Pairs */}
            <div className="md:col-span-3 md:row-span-1 glass-card group p-8 flex flex-col transition-all hover:border-green-500/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-3xl shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Exam Q&A</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Detailed exam-style question and answer pairs designed specifically for your target difficulty level. Perfect for theory practice.
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
              <span className="gradient-text">5 Simple Steps</span>
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              Set up your profile, select your target exam, and let our AI generate
              exam-specific study materials in your preferred language.
            </p>
          </div>

          {/* Steps — Vertical Timeline */}
          <div className="relative space-y-8">
            {/* Connecting line */}
            <div className="absolute left-7 top-10 bottom-10 hidden w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:block" />

            {/* Step 1: Set Up Profile */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-xl font-bold text-white shadow-lg shadow-pink-500/30">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  ⚙️ Set Up Your Profile
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Go to <span className="font-medium text-blue-400">Settings</span> and select your
                  identity: <strong className="text-white">General Student</strong> (8 daily credits) or
                  <strong className="text-white"> EWS Student</strong> (50 daily credits — upload your certificate for instant verification).
                  Choose your target exam and preferred language.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["UPSC", "SSC CGL", "IBPS", "RRB NTPC"].map((exam) => (
                    <span key={exam} className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400 font-medium">
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Enter Topic */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  ✏️ Enter Your Topic
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Go to the <span className="font-medium text-blue-400">Generate</span> page.
                  Type any subject — the AI automatically tailors content to your selected exam and language.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Indian Polity", "Quantitative Aptitude", "Current Affairs", "Reasoning", "General Science"].map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Choose Content Type & Difficulty */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-xl font-bold text-white shadow-lg shadow-purple-500/30">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  📋 Choose Content Type & Difficulty
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Select what to generate and the difficulty level. Each costs 1 daily credit.
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

            {/* Step 4: Generate & Study */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-green-500/30">
                4
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  🚀 Generate & Study
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Hit <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">Generate Content (1 Credit)</span> and
                  your exam-specific material appears instantly. Then:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    🔊 Listen to content with native language TTS audio
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    ⭐ Save mistakes to your Vault for targeted revision
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    📥 Download as PDF for offline study
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    ⏱️ Take timed quizzes with real exam negative marking
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 5: Ask AI Tutor */}
            <div className="glass-card relative flex flex-col gap-6 p-6 transition-all duration-300 hover:border-white/20 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-cyan-500/30">
                5
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-white">
                  🧑‍🏫 Ask the AI Tutor
                </h3>
                <p className="mb-3 text-sm text-gray-400">
                  Confused by a question? Click <span className="font-medium text-blue-400">Ask Tutor</span> and
                  our context-locked AI chatbot already knows exactly what you&apos;re studying.
                  It costs 1 credit per message and responds in your preferred language.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Doubt Clearance", "Concept Breakdown", "Exam Tips", "Wrong Answer Explanation"].map((t) => (
                    <span key={t} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
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
              General students get 8 daily credits free. EWS students get 50. Upgrade anytime for unlimited AI power.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <PricingCard
              name={PLANS.free.name}
              price={PLANS.free.price}
              duration={PLANS.free.duration}
              features={PLANS.free.features}
            />
            <PricingCard
              name={PLANS.monthly.name}
              price={PLANS.monthly.price}
              duration={PLANS.monthly.duration}
              features={PLANS.monthly.features}
            />
            <PricingCard
              name={PLANS.half_yearly.name}
              price={PLANS.half_yearly.price}
              duration={PLANS.half_yearly.duration}
              features={PLANS.half_yearly.features}
              popular
            />
            <PricingCard
              name={PLANS.annual.name}
              price={PLANS.annual.price}
              duration={PLANS.annual.duration}
              features={PLANS.annual.features}
              best
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
            Join thousands of aspirants using AI to prepare smarter, not harder.
            Get 8 free daily credits — EWS students get 50.
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
