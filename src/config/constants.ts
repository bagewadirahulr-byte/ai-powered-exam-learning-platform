// ============================================
// App-wide Constants
// AI-Powered Exam Learning Platform
// ============================================

// --- Credit System ---
export const FREE_CREDITS = 5; // Credits given to new users on signup
export const CREDITS_PER_GENERATION = 1; // Credits deducted per AI generation

// --- Content Types Config ---
export const CONTENT_TYPES = {
  notes: {
    label: "Notes",
    description: "AI-generated study notes on any topic",
    icon: "📝",
    color: "from-blue-500 to-cyan-500",
  },
  quiz: {
    label: "Quiz",
    description: "Multiple-choice questions to test your knowledge",
    icon: "❓",
    color: "from-purple-500 to-pink-500",
  },
  flashcards: {
    label: "Flashcards",
    description: "Quick revision cards with key concepts",
    icon: "🃏",
    color: "from-orange-500 to-yellow-500",
  },
  qna: {
    label: "Q&A",
    description: "Important questions and detailed answers",
    icon: "💬",
    color: "from-green-500 to-emerald-500",
  },
} as const;

// --- Subscription Plans ---
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    duration: "forever",
    durationMonths: 0,
    credits: 5,
    creditsLabel: "5 credits (one-time)",
    features: [
      "5 AI generations total",
      "Notes, Quizzes, Flashcards, Q&A",
      "Basic support",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 199,
    duration: "1 month",
    durationMonths: 1,
    credits: 50,
    creditsLabel: "50 credits/month",
    features: [
      "50 AI generations/month",
      "All content types",
      "PDF export",
      "Priority support",
    ],
  },
  half_yearly: {
    id: "half_yearly",
    name: "Half-Yearly",
    price: 499,
    duration: "6 months",
    durationMonths: 6,
    credits: 50,
    creditsLabel: "50 credits/month",
    savings: "Save ₹695",
    features: [
      "50 AI generations/month",
      "All content types",
      "PDF export",
      "Priority support",
      "Save ₹695 vs monthly",
    ],
  },
  annual: {
    id: "annual",
    name: "Annual",
    price: 999,
    duration: "12 months",
    durationMonths: 12,
    credits: -1, // unlimited
    creditsLabel: "Unlimited credits",
    savings: "Save ₹1,389",
    features: [
      "Unlimited AI generations",
      "All content types",
      "PDF export",
      "Priority support",
      "Custom prompts",
      "Save ₹1,389 vs monthly",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// --- App Metadata ---
export const APP_NAME = "ExamAI";
export const APP_DESCRIPTION =
  "AI-Powered Exam Learning Platform — Generate notes, quizzes, flashcards, and Q&A using AI for exam preparation.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
