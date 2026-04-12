// ============================================
// App-wide Constants
// AI-Powered Exam Learning Platform
// ExamAI — Social Impact Extension
// ============================================

// --- Credit System ---
export const FREE_CREDITS = 8; // Daily credits for General students (EWS gets 50)
export const CREDITS_PER_GENERATION = 1; // Credits deducted per AI generation

// --- Daily Credit Limits (Social Impact) ---
export const DAILY_CREDITS_GENERAL = 8;
export const DAILY_CREDITS_EWS = 50;
export const DAILY_CREDITS_CHATBOT_COST = 1; // Credits deducted per tutor chatbot message

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

// --- Supported Languages (Vernacular Engine) ---
export const SUPPORTED_LANGUAGES = {
  english: { label: "English", bcp47: "en-IN" },
  hindi: { label: "हिन्दी (Hindi)", bcp47: "hi-IN" },
  urdu: { label: "اردو (Urdu)", bcp47: "ur-IN" },
  kannada: { label: "ಕನ್ನಡ (Kannada)", bcp47: "kn-IN" },
  tamil: { label: "தமிழ் (Tamil)", bcp47: "ta-IN" },
  telugu: { label: "తెలుగు (Telugu)", bcp47: "te-IN" },
  malayalam: { label: "മലയാളം (Malayalam)", bcp47: "ml-IN" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// --- Supported Exams (Government Exam Focus) ---
export const SUPPORTED_EXAMS = {
  UPSC: {
    label: "UPSC Civil Services",
    negativeMarkingPenalty: -0.33,
    totalTimeMinutes: 120,
  },
  SSC_CGL: {
    label: "SSC CGL",
    negativeMarkingPenalty: -0.50,
    totalTimeMinutes: 60,
  },
  IBPS: {
    label: "IBPS (Banking)",
    negativeMarkingPenalty: -0.25,
    totalTimeMinutes: 60,
  },
  RRB_NTPC: {
    label: "RRB NTPC (Railways)",
    negativeMarkingPenalty: -0.33,
    totalTimeMinutes: 90,
  },
} as const;

export type SupportedExam = keyof typeof SUPPORTED_EXAMS;

// --- Mood Emojis (Wellness Tracker) ---
export const MOOD_EMOJIS = [
  { score: 1, emoji: "😫", label: "Very Stressed" },
  { score: 2, emoji: "😟", label: "Stressed" },
  { score: 3, emoji: "😐", label: "Neutral" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😊", label: "Great" },
] as const;

// --- Subscription Plans ---
export const PLANS = {
  free: {
    id: "free",
    name: "General Student",
    price: 0,
    duration: "forever",
    durationMonths: 0,
    credits: 8,
    creditsLabel: "8 daily credits (resets at midnight)",
    features: [
      "8 AI generations per day",
      "Notes, Quizzes, Flashcards, Q&A",
      "AI Tutor (1 credit/message)",
      "EWS students get 50 daily credits free",
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
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");
