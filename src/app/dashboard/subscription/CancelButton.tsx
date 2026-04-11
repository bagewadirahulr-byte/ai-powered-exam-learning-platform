// ============================================
// Cancel Subscription Button — Client Component
// Handles confirmation dialog and loading state
// ============================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "./actions";

export default function CancelButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription?\n\n" +
      "• Your plan will revert to Free immediately.\n" +
      "• Your remaining purchased credits will still be available.\n" +
      "• You can re-subscribe anytime from the Pricing page."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          Cancelling...
        </span>
      ) : (
        "Cancel Subscription"
      )}
    </button>
  );
}
