"use client";

import { useState } from "react";
import { updateProfile, verifyEwsCertificate } from "./actions";
import { SUPPORTED_LANGUAGES, SUPPORTED_EXAMS } from "@/config/constants";

// ============================================
// Settings Form — Client Component
// Profile, Language, Exam & EWS Verification
// ============================================

type UserData = {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  preferredLanguage: string;
  targetExam: string | null;
  ewsVerified: boolean;
  ewsPending: boolean;
  ewsTempPassExpiry: Date | null;
  ewsStatus: string;
  ewsRejectionReason: string | null;
  dailyCredits: number;
};

export default function SettingsForm({ user }: { user: UserData }) {
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [ewsMsg, setEwsMsg] = useState("");
  const [showEwsUpload, setShowEwsUpload] = useState(false);

  // --- Profile Save ---
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg("");
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateProfile(formData);
      setProfileMsg(res.message);
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Failed to update profile.");
    }
    setSaving(false);
  };

  // --- EWS Certificate Verification ---
  const handleEwsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifying(true);
    setEwsMsg("");
    try {
      const formData = new FormData(e.currentTarget);
      const res = await verifyEwsCertificate(formData);
      setEwsMsg(res.message);
    } catch (err) {
      setEwsMsg(err instanceof Error ? err.message : "Verification failed.");
    }
    setVerifying(false);
  };

  const getEwsStatusBadge = () => {
    const status = user.ewsStatus || (user.ewsVerified ? "approved" : user.ewsPending ? "pending" : "none");
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 border border-green-500/20">
            ✅ Verified EWS Student
          </span>
        );
      case "needs_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-400 border border-amber-500/20">
            🔍 Needs Admin Review
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400 border border-yellow-500/20">
            ⏳ Pending (Temp Pass Active)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400 border border-red-500/20">
            ❌ Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const ewsStatus = user.ewsStatus || (user.ewsVerified ? "approved" : "none");

  return (
    <div className="space-y-8">
      {/* ===== Profile Section ===== */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="mb-1 text-xl font-bold text-white">Your Profile</h2>
        <p className="mb-6 text-sm text-gray-400">
          Set your identity and study preferences. These are used to personalize AI-generated content.
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">First Name *</label>
              <input
                name="firstName"
                type="text"
                defaultValue={user.firstName || ""}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Rahul"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Middle Name</label>
              <input
                name="middleName"
                type="text"
                defaultValue={user.middleName || ""}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Last Name *</label>
              <input
                name="lastName"
                type="text"
                defaultValue={user.lastName || ""}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Bagewadi"
              />
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Preferred Language</label>
            <select
              name="preferredLanguage"
              aria-label="Preferred Language"
              defaultValue={user.preferredLanguage}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              AI will generate study materials in this language.
            </p>
          </div>

          {/* Exam Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Target Exam</label>
            <select
              name="targetExam"
              aria-label="Target Exam"
              defaultValue={user.targetExam || ""}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">— Select your exam —</option>
              {Object.entries(SUPPORTED_EXAMS).map(([key, exam]) => (
                <option key={key} value={key}>
                  {exam.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Quizzes will follow this exam&apos;s pattern, including negative marking rules.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {profileMsg && (
              <p className="text-sm text-green-400">{profileMsg}</p>
            )}
          </div>
        </form>
      </div>

      {/* ===== EWS Verification Section ===== */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-1">
          <h2 className="text-xl font-bold text-white">EWS Student Verification</h2>
          {getEwsStatusBadge()}
        </div>
        <p className="mb-6 text-sm text-gray-400">
          Economically Weaker Section students receive <strong className="text-white">50 free AI credits per day</strong> instead of 8.
          Upload your government-issued EWS or Income certificate for instant AI-powered verification.
        </p>

        {ewsStatus === "approved" ? (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-green-300 text-sm">
              🎉 Your EWS status is <strong>verified</strong>. You have access to 50 daily AI credits.
              Your current balance: <strong className="text-green-400">{user.dailyCredits} credits</strong>.
            </p>
          </div>
        ) : (
          <>
            {ewsStatus === "rejected" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-4">
                <p className="text-red-300 text-sm">
                  ❌ Your EWS verification was rejected.
                  {user.ewsRejectionReason && (
                    <span className="block mt-1 text-red-400/80">
                      Reason: {user.ewsRejectionReason}
                    </span>
                  )}
                </p>
                <p className="text-xs text-red-400/60 mt-2">
                  You can re-upload a clearer certificate (3 attempts per 24 hours).
                </p>
              </div>
            )}
            
            {/* Student Type Toggle */}
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEwsUpload(false)}
                className={`flex-1 rounded-xl border p-4 text-sm font-medium transition-all ${
                  !showEwsUpload
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                🎓 General Student
                <span className="block mt-1 text-xs opacity-70">8 credits/day</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEwsUpload(true)}
                className={`flex-1 rounded-xl border p-4 text-sm font-medium transition-all ${
                  showEwsUpload
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                🛡️ EWS Student
                <span className="block mt-1 text-xs opacity-70">50 credits/day (free)</span>
              </button>
            </div>

            {/* EWS Upload Form */}
            {showEwsUpload && (
              <form onSubmit={handleEwsSubmit} className="space-y-4">
                <div className="rounded-xl border border-dashed border-gray-600 bg-gray-800/50 p-6 text-center">
                  <p className="mb-3 text-sm text-gray-300">
                    Upload your EWS Certificate, Income Certificate, or BPL Card
                  </p>
                  <input
                    name="certificate"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    required
                    aria-label="Upload EWS Certificate"
                    className="mx-auto block text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:px-4 file:py-2 file:text-sm file:text-blue-400 file:cursor-pointer hover:file:bg-blue-600/30"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Max 10MB · JPEG, PNG, WebP, or HEIC · Document is never stored (zero-retention)
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-300/80">
                    🔒 <strong>Privacy Policy:</strong> Your certificate is processed by AI in volatile server memory only.
                    It is permanently destroyed the instant verification completes. We never save, store, or transmit your document.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] hover:shadow-green-500/40 disabled:opacity-50"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      AI is analyzing your document...
                    </span>
                  ) : (
                    "Verify Certificate with AI"
                  )}
                </button>

                {ewsMsg && (
                  <div className={`rounded-xl border p-4 text-sm ${
                    ewsMsg.includes("successful") || ewsMsg.includes("granted")
                      ? "border-green-500/20 bg-green-500/5 text-green-300"
                      : "border-red-500/20 bg-red-500/5 text-red-300"
                  }`}>
                    {ewsMsg}
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </div>

      {/* ===== Daily Credits Info ===== */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="mb-1 text-xl font-bold text-white">Daily AI Credits</h2>
        <p className="mb-4 text-sm text-gray-400">
          Your credits reset automatically at midnight IST (12:00 AM India Standard Time) every day.
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-green-400">{user.dailyCredits}</span>
          <span className="text-gray-400">credits remaining today</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                (user.dailyCredits / (user.ewsVerified ? 50 : 8)) * 100
              )}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {user.ewsVerified ? "EWS Plan: 50 credits/day" : "General Plan: 8 credits/day"} ·{" "}
          Each content generation uses 1 credit
        </p>
      </div>
    </div>
  );
}
