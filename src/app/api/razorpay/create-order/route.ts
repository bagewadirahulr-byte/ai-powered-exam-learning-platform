// ============================================
// Razorpay Create Order API Route
// POST /api/razorpay/create-order
// ============================================

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries";
import { razorpay } from "@/lib/razorpay";
import { PLANS, type PlanId } from "@/config/constants";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const user = await currentUser();

    if (!clerkUserId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const planId = body.planId as PlanId;

    if (!planId || !PLANS[planId] || planId === "free") {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Create Razorpay order (amount in paise = price × 100)
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${dbUser.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: dbUser.id,
        planId: planId,
        userEmail: user.emailAddresses[0].emailAddress,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: planId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_ORDER]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
