import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { subscriptions, credits, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanId } from "@/config/constants";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Signature" }, { status: 400 });
    }

    // Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(textBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Razorpay Webhook Signature");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    const payload = JSON.parse(textBody);
    
    // Handle specific Razorpay webhook events
    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      
      // The notes object contains metadata we passed during order creation
      const { userId, planId, userEmail } = payment.notes || {};
      
      if (!userId || !planId) {
        console.error("❌ Missing metadata (userId, planId) in Razorpay payment notes");
        return NextResponse.json({ success: true, message: "Handled, but missing metadata" });
      }

      console.log(`✅ Webhook: Payment captured for User ${userId}, Plan ${planId}`);
      
      // Verify the payment ID doesn't already exist to prevent duplicate additions
      // Usually, /api/razorpay/verify would have already run. This acts as a robust fallback.
      const existingCredit = await db.query.credits.findFirst({
        where: eq(credits.razorpayPaymentId, payment.id),
      });

      if (existingCredit) {
        console.log("ℹ️ Payment was already processed by the frontend verification route.");
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // If not processed, do the database updates (Fallback Mechanism)
      const plan = PLANS[planId as PlanId];
      if (!plan) {
         return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + plan.durationMonths);

      const creditsToAdd = plan.credits === -1 ? 999 : plan.credits * plan.durationMonths;

      // 1. Upsert subscription record
      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

      if (existingSub.length > 0) {
        await db.update(subscriptions).set({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          plan: planId as "monthly" | "half_yearly" | "annual",
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        }).where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions).values({
          userId: userId,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          plan: planId as "monthly" | "half_yearly" | "annual",
          currentPeriodEnd: periodEnd,
        });
      }

      // 2. Update user's subscription status
      await db.update(users).set({
        subscriptionStatus: planId as "monthly" | "half_yearly" | "annual",
        updatedAt: now,
      }).where(eq(users.id, userId));

      // 3. Add credits
      await db.insert(credits).values({
        userId: userId,
        amount: creditsToAdd,
        reason: `Razorpay Webhook Fallback: ${plan.name} Plan`,
        razorpayPaymentId: payment.id,
      }).onConflictDoNothing({ target: credits.razorpayPaymentId });
      
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
