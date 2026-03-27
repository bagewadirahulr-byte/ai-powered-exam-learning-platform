import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ Missing STRIPE_SECRET_KEY environment variable.");
}

// Instantiate Stripe with build-time safety. 
// A placeholder is used if the environment variable is missing to prevent build failures.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
