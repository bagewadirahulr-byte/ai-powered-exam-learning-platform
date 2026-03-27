// ============================================
// Shared TypeScript Types
// AI-Powered Exam Learning Platform
// ============================================

// --- User Types ---
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  credits: number;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// --- Content Types ---
export type ContentType = "notes" | "quiz" | "flashcards" | "qna";

export interface GeneratedContent {
  id: string;
  userId: string;
  type: ContentType;
  topic: string;
  content: string; // JSON string of the generated content
  createdAt: Date;
}

// --- Quiz specific types ---
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
}

// --- Flashcard specific types ---
export interface Flashcard {
  front: string;
  back: string;
}

// --- Q&A specific types ---
export interface QnAItem {
  question: string;
  answer: string;
}

// --- Credit Types ---
export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive = added, negative = used
  reason: string;
  createdAt: Date;
}

// --- Subscription Types ---
export type SubscriptionStatus = "free" | "pro" | "premium";

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionStatus;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Generation Request Types ---
export interface GenerateRequest {
  topic: string;
  type: ContentType;
  difficulty?: "easy" | "medium" | "hard";
  count?: number; // number of items to generate (e.g., 10 quiz questions)
}
