"use client";

import Navbar from "@/components/layout/Navbar";
import Script from "next/script";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PLANS } from "@/config/constants";

type PlanId = "monthly" | "half_yearly" | "annual";

interface PlanConfig {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationMonths: number;
  credits: number;
  creditsLabel: string;
  savings?: string;
  features: readonly string[];
}

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (planId: PlanId) => {
    setLoading(planId);
    try {
      // 1. Create Razorpay order on server
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      // 2. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ExamAI",
        description: `${PLANS[planId].name} Plan — ${PLANS[planId].duration}`,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          // 3. Verify payment on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(true);
              setTimeout(() => {
                window.location.href = "/dashboard?success=true";
              }, 2000);
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment received but verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.emailAddresses[0]?.emailAddress || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      if (!window.Razorpay) {
        alert("Payment gateway is still loading. Please try again in a few seconds.");
        setLoading(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen px-6 pt-24 pb-12 flex flex-col items-center justify-center">
          <div className="glass-card max-w-md w-full p-10 text-center">
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">
              Your credits have been added. Redirecting to dashboard...
            </p>
            <div className="h-2 w-32 mx-auto rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12 flex flex-col items-center">
        {/* Header */}
        <div className="max-w-3xl w-full text-center mb-12">
          <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
            Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Plans that fit your <span className="gradient-text">learning goals</span>
          </h1>
          <p className="text-xl text-gray-400">
            Start free with 5 credits. Upgrade anytime with UPI, cards, or net banking.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 w-full max-w-5xl md:grid-cols-2 lg:grid-cols-4">
          {/* Free Plan */}
          <PricingCard
            plan={PLANS.free as unknown as PlanConfig}
            isFree
            onSelect={() => (window.location.href = "/dashboard")}
            loading={false}
          />

          {/* Monthly Plan */}
          <PricingCard
            plan={PLANS.monthly as unknown as PlanConfig}
            onSelect={() => handleCheckout("monthly")}
            loading={loading === "monthly"}
          />

          {/* Half-Yearly Plan — Popular */}
          <PricingCard
            plan={PLANS.half_yearly as unknown as PlanConfig}
            popular
            onSelect={() => handleCheckout("half_yearly")}
            loading={loading === "half_yearly"}
          />

          {/* Annual Plan */}
          <PricingCard
            plan={PLANS.annual as unknown as PlanConfig}
            onSelect={() => handleCheckout("annual")}
            loading={loading === "annual"}
            best
          />
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Powered by Razorpay • Secure payments</p>
          <div className="flex items-center justify-center gap-6 text-gray-400">
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
              Cards
            </span>
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              UPI
            </span>
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>
              Net Banking
            </span>
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              Wallets
            </span>
          </div>
        </div>
      </main>
    </>
  );
}

// --- Pricing Card Component ---
function PricingCard({
  plan,
  popular = false,
  best = false,
  isFree = false,
  onSelect,
  loading,
}: {
  plan: PlanConfig;
  popular?: boolean;
  best?: boolean;
  isFree?: boolean;
  onSelect: () => void;
  loading: boolean;
}) {
  const borderClass = popular
    ? "border-blue-500/50 glow-blue"
    : best
    ? "border-purple-500/50 glow-purple"
    : "";

  return (
    <div
      className={`glass-card relative p-7 flex flex-col transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${borderClass}`}
    >
      {/* Badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
          Most Popular
        </div>
      )}
      {best && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-500/30">
          Best Value
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
      <p className="text-xs text-gray-500 mb-4">{plan.duration}</p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-4xl font-extrabold text-white">
          {plan.price === 0 ? "Free" : `₹${plan.price}`}
        </span>
        {plan.price > 0 && (
          <span className="text-gray-500 text-sm ml-1">/{plan.duration}</span>
        )}
      </div>

      {/* Savings Badge */}
      {"savings" in plan && plan.savings && (
        <span className="inline-block mb-4 rounded-full bg-green-500/10 border border-green-500/30 px-3 py-0.5 text-xs font-medium text-green-400 w-fit">
          {plan.savings}
        </span>
      )}
      {!("savings" in plan && plan.savings) && <div className="mb-4" />}

      {/* Credits */}
      <p className="text-sm text-blue-400 font-medium mb-5">{plan.creditsLabel}</p>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-green-400 mt-0.5 shrink-0">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={loading}
        className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all text-sm ${
          popular
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
            : best
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
            : isFree
            ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        } disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : isFree ? (
          "Get Started Free"
        ) : (
          `Subscribe — ₹${plan.price}`
        )}
      </button>
    </div>
  );
}
