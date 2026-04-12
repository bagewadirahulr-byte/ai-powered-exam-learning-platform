// ============================================
// Razorpay Payment Gateway Configuration
// ============================================

import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables.");
}

// Pass a dummy key during Vercel's build phase to bypass static analysis constructor errors
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "dummy_key_for_build",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_build",
});

/**
 * Verify Razorpay payment signature to confirm authenticity.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
