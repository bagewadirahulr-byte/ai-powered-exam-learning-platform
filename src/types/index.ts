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
  content: string;
  createdAt: Date;
}

// --- Quiz specific types ---
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
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
  amount: number;
  reason: string;
  createdAt: Date;
}

// --- Subscription Types ---
export type SubscriptionStatus = "free" | "monthly" | "half_yearly" | "annual";

export interface Subscription {
  id: string;
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  plan: SubscriptionStatus;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- Razorpay Types ---
export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  keyId: string;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: string;
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
  count?: number;
}
