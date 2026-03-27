import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    const user = await currentUser();

    if (!clerkUserId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return new NextResponse("User not found in DB", { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "100 AI Generation Credits",
              description: "Pro Pack for Exam Learning Platform",
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: dbUser.id, // Internal Postgres UUID
        type: "credits_pack",
        amount: 100,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
