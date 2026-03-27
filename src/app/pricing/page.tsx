"use client";

import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to initiate checkout. Please check your Stripe config.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12 flex flex-col items-center">
        <div className="max-w-3xl w-full text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-400">
            Get more AI generation credits to continue your learning journey.
          </p>
        </div>

        <div className="glass-card max-w-md w-full p-8 flex flex-col items-center group hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-500">💎</div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Pro Pack</h2>
          <p className="text-gray-400 mb-8 text-center text-lg">
            Instantly add 100 AI generation credits to your account.
          </p>
          <div className="text-5xl font-extrabold text-white mb-8 group-hover:text-blue-400 transition-colors">
            $5.00
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 text-lg"
          >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </div>
            ) : "Buy 100 Credits"}
          </button>
        </div>
      </main>
    </>
  );
}
