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
    name: "Free",
    price: 0,
    credits: 5,
    features: [
      "5 AI generations",
      "Notes, Quizzes, Flashcards",
      "Basic support",
    ],
  },
  pro: {
    name: "Pro",
    price: 499, // in INR (₹499/month)
    credits: 50,
    features: [
      "50 AI generations/month",
      "All content types",
      "Priority support",
      "PDF export",
    ],
  },
  premium: {
    name: "Premium",
    price: 999, // in INR (₹999/month)
    credits: -1, // unlimited
    features: [
      "Unlimited AI generations",
      "All content types",
      "Priority support",
      "PDF export",
      "Custom prompts",
    ],
  },
} as const;

// --- App Metadata ---
export const APP_NAME = "ExamAI";
export const APP_DESCRIPTION =
  "AI-Powered Exam Learning Platform — Generate notes, quizzes, flashcards, and Q&A using AI for exam preparation.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
