"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Zap, Shield, Clock } from "lucide-react";

// ============================================
// Credit Exhausted Modal — Upgrade Paywall
// Shown when daily credits reach 0
// ============================================

interface CreditExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEwsVerified: boolean;
  message?: string;
}

export default function CreditExhaustedModal({
  isOpen,
  onClose,
  isEwsVerified,
  message,
}: CreditExhaustedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8 shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Daily Credits Exhausted
          </h2>
          <p className="text-sm text-gray-400">
            {message || "You've used all your free credits for today."}
          </p>
        </div>

        {/* Next reset info */}
        <div className="mb-6 rounded-xl border border-white/5 bg-gray-800/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Credits reset at
          </p>
          <p className="text-lg font-bold text-green-400">
            12:00 AM IST (Midnight)
          </p>
          <p className="text-xs text-gray-500 mt-1">Tomorrow</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Premium
          </Link>

          {!isEwsVerified && (
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <Shield className="w-4 h-4" />
              Verify EWS Status (Get 50 Free Credits/Day)
            </Link>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 font-medium text-gray-400 transition-all hover:border-gray-600 hover:text-white"
          >
            Come Back Tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
