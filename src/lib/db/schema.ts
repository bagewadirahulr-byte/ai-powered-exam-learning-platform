// ============================================
// Database Schema Definition
// Neon PostgreSQL with Drizzle ORM
// ExamAI — Social Impact Extension
// ============================================

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "free",
  "monthly",
  "half_yearly",
  "annual",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "notes",
  "quiz",
  "flashcards",
  "qna",
]);

export const preferredLanguageEnum = pgEnum("preferred_language", [
  "english",
  "hindi",
  "urdu",
  "kannada",
  "tamil",
  "telugu",
  "malayalam",
]);

export const targetExamEnum = pgEnum("target_exam", [
  "UPSC",
  "SSC_CGL",
  "IBPS",
  "RRB_NTPC",
]);

// --- Users Table ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),

  // --- Social Impact: Identity Fields ---
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),

  // --- EWS Verification ---
  ewsVerified: boolean("ews_verified").default(false).notNull(),
  ewsPending: boolean("ews_pending").default(false).notNull(),
  ewsTempPassExpiry: timestamp("ews_temp_pass_expiry"),

  // --- Daily Credit System ---
  dailyCredits: integer("daily_credits").default(8).notNull(),
  lastCreditReset: timestamp("last_credit_reset").defaultNow().notNull(),

  // --- Vernacular & Exam Preferences ---
  preferredLanguage: preferredLanguageEnum("preferred_language").default("english").notNull(),
  targetExam: targetExamEnum("target_exam"),

  // --- Existing Fields ---
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .default("free")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Generated Content Table ---
export const generatedContent = pgTable("generated_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: contentTypeEnum("type").notNull(),
  topic: text("topic").notNull(),
  examType: targetExamEnum("exam_type"),
  content: jsonb("content").notNull(),
  isBookmarked: boolean("is_bookmarked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Credits Table ---
export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  razorpayPaymentId: text("razorpay_payment_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Subscriptions Table ---
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  plan: subscriptionStatusEnum("plan").notNull().default("free"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// NEW TABLES — Social Impact Extension
// ============================================

// --- Wellness Logs (Mood Tracking) ---
export const wellnessLogs = pgTable("wellness_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moodScore: integer("mood_score").notNull(), // 1-5 (😫 to 😊)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Content Cache (Topic-Key DB Caching for Gemini Cost Control) ---
export const contentCache = pgTable("content_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  cacheKey: text("cache_key").notNull().unique(), // e.g. "UPSC_indian-polity_quiz_english"
  contentType: contentTypeEnum("content_type").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Error Reports (Community QA Pipeline) ---
export const errorReports = pgTable("error_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: uuid("content_id")
    .notNull()
    .references(() => generatedContent.id, { onDelete: "cascade" }),
  reportedByUserId: uuid("reported_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
