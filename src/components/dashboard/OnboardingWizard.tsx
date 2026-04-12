"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, SUPPORTED_EXAMS } from "@/config/constants";

// ============================================
// Onboarding Wizard — First-Time Profile Setup
// Shown once when user has no firstName set.
// After completion, dashboard loads normally.
// ============================================

type Step = 1 | 2 | 3;

export default function OnboardingWizard({
  saveProfile,
}: {
  saveProfile: (data: FormData) => Promise<{ success: boolean; message?: string }>;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentType, setStudentType] = useState<"general" | "ews">("general");
  const [targetExam, setTargetExam] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState("english");

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }
    if (!targetExam) {
      setError("Please select your target exam.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("firstName", firstName.trim());
      formData.set("middleName", middleName.trim());
      formData.set("lastName", lastName.trim());
      formData.set("preferredLanguage", preferredLanguage);
      formData.set("targetExam", targetExam);

      const res = await saveProfile(formData);
      if (res.success) {
        router.refresh(); // Re-renders server component → firstName is now set → dashboard loads
      } else {
        setError(res.message || "Failed to save profile.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 px-4">
      {/* Background aura */}
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s <= step ? "w-16 bg-blue-500" : "w-8 bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="glass-card p-8 sm:p-10">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl shadow-xl shadow-blue-500/20">
                  👤
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome to ExamAI</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Let&apos;s set up your study profile. This takes 30 seconds.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rahul"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Middle Name <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Kumar"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Bagewadi"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!firstName.trim() || !lastName.trim()) {
                    setError("First Name and Last Name are required.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Student Type */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-3xl shadow-xl shadow-emerald-500/20">
                  🛡️
                </div>
                <h2 className="text-2xl font-bold text-white">Student Category</h2>
                <p className="mt-2 text-sm text-gray-400">
                  This determines your daily free AI credit allocation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStudentType("general")}
                  className={`rounded-2xl border-2 p-6 text-left transition-all ${
                    studentType === "general"
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="font-bold text-white text-lg">General Student</h3>
                  <p className="mt-1 text-sm text-gray-400">8 free AI credits per day</p>
                  <div className="mt-3 text-xs text-blue-400 font-medium">Standard access</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentType("ews")}
                  className={`rounded-2xl border-2 p-6 text-left transition-all ${
                    studentType === "ews"
                      ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-bold text-white text-lg">EWS Student</h3>
                  <p className="mt-1 text-sm text-gray-400">50 free AI credits per day</p>
                  <div className="mt-3 text-xs text-green-400 font-medium">Upload certificate in Settings</div>
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3.5 font-medium text-gray-400 transition-all hover:text-white"
                >
                  ← Back
                </button>
                <button
                  onClick={() => { setError(""); setStep(3); }}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Target Exam + Language */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-3xl shadow-xl shadow-purple-500/20">
                  🎯
                </div>
                <h2 className="text-2xl font-bold text-white">Your Target Exam</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Exam-specific topics cost <strong className="text-green-400">1 credit</strong>. General topics cost <strong className="text-yellow-400">2 credits</strong>.
                </p>
              </div>

              {/* Exam Selector */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Your Exam <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SUPPORTED_EXAMS).map(([key, exam]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTargetExam(key)}
                      className={`rounded-xl border p-3.5 text-left transition-all ${
                        targetExam === key
                          ? "border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <div className="font-bold text-white text-sm">{exam.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{key.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  aria-label="Select preferred language"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                    <option key={key} value={key}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-900/30 p-3 border border-red-500/30 text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3.5 font-medium text-gray-400 transition-all hover:text-white"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Setting up...
                    </span>
                  ) : (
                    "🚀 Start Learning"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 1 errors */}
          {step !== 3 && error && (
            <div className="mt-4 rounded-lg bg-red-900/30 p-3 border border-red-500/30 text-red-200 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
