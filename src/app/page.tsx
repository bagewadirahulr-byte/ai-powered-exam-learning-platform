// ============================================
// Landing Page — AI-Powered Exam Learning Platform
// Premium dark theme with gradients, glow, and animations
// ============================================

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { CONTENT_TYPES, PLANS } from "@/config/constants";

// --- Feature Card Component ---
function FeatureCard({
  icon,
  label,
  description,
  color,
}: {
  icon: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <div className="glass-card group p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
      {/* Icon with gradient background */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-2xl shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{label}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}

// --- Step Card Component ---
function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step number */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

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
            <p className="mx-auto max-w-xl text-gray-400">
              Powered by Google&apos;s Gemini AI, our platform generates
              high-quality study materials tailored to your needs.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(CONTENT_TYPES).map((feature) => (
              <FeatureCard key={feature.label} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
              How It Works
            </span>
            <h2 className="mb-4 text-4xl font-bold text-white">
              Start Learning in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid gap-12 md:grid-cols-3">
            <StepCard
              step={1}
              title="Enter Your Topic"
              description="Type any subject or topic you want to study. From Physics to History — we cover everything."
            />
            <StepCard
              step={2}
              title="Choose Content Type"
              description="Select notes, quiz, flashcards, or Q&A. Our AI generates tailored content for your needs."
            />
            <StepCard
              step={3}
              title="Study & Ace It"
              description="Review the AI-generated content, take quizzes, flip flashcards, and prepare with confidence."
            />
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
