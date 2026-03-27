import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { credits } from "@/lib/db/schema";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Retrieve the metadata we passed in checkout creation
    const userId = session.metadata?.userId;
    const amountStr = session.metadata?.amount;
    
    if (userId && amountStr) {
      const amount = parseInt(amountStr, 10);
      
      try {
        // Add credits to the user safely with idempotency check.
        // If this session ID was already processed, it will do nothing.
        await db.insert(credits).values({
          userId,
          amount,
          reason: "Stripe Purchase: Pro Pack",
          stripeSessionId: session.id, // THE UNIQUE KEY
        }).onConflictDoNothing({ target: credits.stripeSessionId });
        
        console.log(`✅ Webhook: Processed session ${session.id} for user ${userId} (+${amount} credits)`);
      } catch (dbErr) {
        console.error("❌ Webhook Database Error:", dbErr);
        // We return 200 anyway to Stripe because we don't want them to spam retries 
        // if it's a permanent logical error, but ideally we'd handle it.
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
