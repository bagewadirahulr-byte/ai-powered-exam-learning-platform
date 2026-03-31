// ============================================
// Database Schema Definition
// Neon PostgreSQL with Drizzle ORM
// ============================================

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  pgEnum,
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

// --- Users Table ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
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
  content: jsonb("content").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
