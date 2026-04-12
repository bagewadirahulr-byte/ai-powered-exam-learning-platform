"use client";

import { useState } from "react";
import { toggleContentBookmark, reportError } from "./actions";
import Link from "next/link";
import ListenButton from "@/components/ui/ListenButton";

// ============================================
// Content Action Bar — Bookmark, Report, Tutor
// ============================================

type Props = {
  contentId: string;
  topic: string;
  isBookmarked: boolean;
  contentType: string;
  contentText: string;
  language: string;
};

export default function ContentActionBar({
  contentId,
  topic,
  isBookmarked: initialBookmarked,
  contentType,
  contentText,
  language,
}: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const [reported, setReported] = useState(false);

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      const res = await toggleContentBookmark(contentId);
      if (res.success) {
        setBookmarked(res.bookmarked);
      }
    } catch {
      // silently fail
    }
    setBookmarkLoading(false);
  };

  const handleReport = async () => {
    if (reported) return;
    const reason = window.prompt(
      "What's wrong with this content? (optional — leave blank to skip)"
    );
    // User cancelled the prompt dialog
    if (reason === null) return;

    setReported(true);
    try {
      const res = await reportError(contentId, reason || undefined);
      setReportMsg(res.message);
    } catch {
      setReportMsg("Failed to submit report.");
    }
  };

  // Build tutor URL with context
  const tutorUrl = `/dashboard/tutor?context=${encodeURIComponent(
    `I'm studying "${topic}" (${contentType}). Help me understand this topic better.`
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Bookmark (Mistake Vault) */}
      <button
        onClick={handleBookmark}
        disabled={bookmarkLoading}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
          bookmarked
            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
        }`}
        aria-label={bookmarked ? "Remove from Mistake Vault" : "Add to Mistake Vault"}
      >
        {bookmarked ? "⭐ Saved" : "☆ Vault"}
      </button>

      {/* Ask Tutor */}
      <Link
        href={tutorUrl}
        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20"
      >
        🧑‍🏫 Ask Tutor
      </Link>

      {/* Report Error */}
      <button
        onClick={handleReport}
        disabled={reported}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
          reported
            ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed"
            : "border-gray-700 bg-gray-800 text-gray-400 hover:border-red-500/30 hover:text-red-400"
        }`}
        aria-label="Report an error in this content"
      >
        {reported ? "✓ Reported" : "⚠️ Report Error"}
      </button>

      {/* Listen (TTS) */}
      <ListenButton text={contentText} language={language} />

      {/* Report feedback message */}
      {reportMsg && (
        <span className="text-xs text-gray-400">{reportMsg}</span>
      )}
    </div>
  );
}
