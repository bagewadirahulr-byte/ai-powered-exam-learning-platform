// ============================================
// Database Migration Script: Stripe → Razorpay
// Run: npx tsx scripts/migrate-razorpay.ts
// ============================================

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log("🔄 Starting Stripe → Razorpay migration...\n");

    // Execute all statements in order
    const statements = [
      // 1. Drop old Stripe constraints
      `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_stripe_customer_id_unique"`,
      `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_stripe_subscription_id_unique"`,
      `ALTER TABLE "credits" DROP CONSTRAINT IF EXISTS "credits_stripe_session_id_unique"`,

      // 2. Convert plan columns to text temporarily
      `ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE text`,
      `ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DEFAULT 'free'`,
      `ALTER TABLE "users" ALTER COLUMN "subscription_status" SET DATA TYPE text`,
      `ALTER TABLE "users" ALTER COLUMN "subscription_status" SET DEFAULT 'free'`,

      // 3. Drop and recreate enum with new values
      `DROP TYPE IF EXISTS "public"."subscription_status"`,
      `CREATE TYPE "public"."subscription_status" AS ENUM('free', 'monthly', 'half_yearly', 'annual')`,

      // 4. Convert back to enum type
      // First update any 'pro' or 'premium' values to 'free' to avoid casting errors
      `UPDATE "subscriptions" SET "plan" = 'free' WHERE "plan" NOT IN ('free', 'monthly', 'half_yearly', 'annual')`,
      `UPDATE "users" SET "subscription_status" = 'free' WHERE "subscription_status" NOT IN ('free', 'monthly', 'half_yearly', 'annual')`,

      `ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DEFAULT 'free'::"public"."subscription_status"`,
      `ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE "public"."subscription_status" USING "plan"::"public"."subscription_status"`,
      `ALTER TABLE "users" ALTER COLUMN "subscription_status" SET DEFAULT 'free'::"public"."subscription_status"`,
      `ALTER TABLE "users" ALTER COLUMN "subscription_status" SET DATA TYPE "public"."subscription_status" USING "subscription_status"::"public"."subscription_status"`,

      // 5. Add new Razorpay columns
      `ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "razorpay_order_id" text`,
      `ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "razorpay_payment_id" text`,
      `ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "razorpay_payment_id" text`,

      // 6. Drop old Stripe columns
      `ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "stripe_customer_id"`,
      `ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "stripe_subscription_id"`,
      `ALTER TABLE "credits" DROP COLUMN IF EXISTS "stripe_session_id"`,

      // 7. Add unique constraint on razorpay_payment_id in credits
      `ALTER TABLE "credits" ADD CONSTRAINT "credits_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")`,
    ];

    for (const sql of statements) {
      try {
        await client.query(sql);
        console.log(`  ✅ ${sql.slice(0, 80)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Ignore "already exists" or "does not exist" errors
        if (msg.includes("already exists") || msg.includes("does not exist")) {
          console.log(`  ⏭️  Skipped (already done): ${sql.slice(0, 60)}...`);
        } else {
          console.error(`  ❌ FAILED: ${sql.slice(0, 60)}...`);
          console.error(`     Error: ${msg}`);
        }
      }
    }

    console.log("\n✅ Migration complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
