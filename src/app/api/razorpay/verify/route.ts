// ============================================
// Razorpay Payment Verification API Route
// POST /api/razorpay/verify
// ============================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { credits, subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanId } from "@/config/constants";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // 1. Verify the payment signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error("❌ Razorpay signature verification failed");
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // 2. Get plan details
    const plan = PLANS[planId as PlanId];
    if (!plan || planId === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // 3. Calculate subscription end date
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + plan.durationMonths);

    // 4. Calculate credits to add
    // Monthly & Half-Yearly: 50 credits/month × duration months
    // Annual: 999 credits (effectively unlimited for the period)
    const creditsToAdd = plan.credits === -1
      ? 999 // "Unlimited" represented as 999
      : plan.credits * plan.durationMonths;

    // 5. Upsert subscription record
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, dbUser.id))
      .limit(1);

    if (existingSub.length > 0) {
      await db
        .update(subscriptions)
        .set({
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          plan: planId as "monthly" | "half_yearly" | "annual",
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.userId, dbUser.id));
    } else {
      await db.insert(subscriptions).values({
        userId: dbUser.id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        plan: planId as "monthly" | "half_yearly" | "annual",
        currentPeriodEnd: periodEnd,
      });
    }

    // 6. Update user's subscription status
    await db
      .update(users)
      .set({
        subscriptionStatus: planId as "monthly" | "half_yearly" | "annual",
        updatedAt: now,
      })
      .where(eq(users.id, dbUser.id));

    // 7. Add credits (with idempotency via razorpayPaymentId unique constraint)
    await db.insert(credits).values({
      userId: dbUser.id,
      amount: creditsToAdd,
      reason: `Razorpay Purchase: ${plan.name} Plan (${plan.duration})`,
      razorpayPaymentId: razorpay_payment_id,
    }).onConflictDoNothing({ target: credits.razorpayPaymentId });

    console.log(`✅ Payment verified: ${razorpay_payment_id} | User: ${dbUser.id} | Plan: ${planId} | +${creditsToAdd} credits`);

    return NextResponse.json({
      success: true,
      plan: planId,
      creditsAdded: creditsToAdd,
      periodEnd: periodEnd.toISOString(),
    });
  } catch (error) {
    console.error("[RAZORPAY_VERIFY]", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
