import { SUPPORTED_EXAMS } from "@/config/constants";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

// ============================================
// Programmatic SEO Pages for Exams
// Dynamic route: /exams/[exam]
// ============================================

type Props = {
  params: Promise<{ exam: string }>;
};

// --- Next.js Static Generation ---
// This tells Next.js to pre-render these pages at build time.
export async function generateStaticParams() {
  return Object.keys(SUPPORTED_EXAMS).map((examKey) => ({
    exam: examKey.toLowerCase().replace(/_/g, "-"),
  }));
}

// --- Dynamic Metadata & JSON-LD Headers ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params;
  
  // Reverse map the slug back to the enum key
  const examKey = Object.keys(SUPPORTED_EXAMS).find(
    (k) => k.toLowerCase().replace(/_/g, "-") === exam
  ) as keyof typeof SUPPORTED_EXAMS | undefined;

  const examLabel = examKey ? SUPPORTED_EXAMS[examKey].label : exam.toUpperCase();

  return {
    title: `${examLabel} Preparation 2025 | ExamAI`,
    description: `Free AI-generated study notes, quizzes with negative marking, and mock tests for the ${examLabel} examination. Join thousands of aspirants on ExamAI.`,
    openGraph: {
      title: `Ace ${examLabel} with ExamAI`,
      description: `Targeted AI mock tests and smart flashcards tailored specifically for ${examLabel} syllabus.`,
      type: "article",
    },
  };
}

export default async function ExamSeoPage({ params }: Props) {
  const { exam } = await params;
  
  const examKey = Object.keys(SUPPORTED_EXAMS).find(
    (k) => k.toLowerCase().replace(/_/g, "-") === exam
  ) as keyof typeof SUPPORTED_EXAMS | undefined;

  const examData = examKey ? SUPPORTED_EXAMS[examKey] : null;
  const examLabel = examData ? examData.label : exam.toUpperCase();

  // --- JSON-LD Structured Data Schema (for Google Rich Snippets) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${examLabel} Preparation Course`,
    "description": `Comprehensive study materials, quizzes, and mock exams for ${examLabel}.`,
    "provider": {
      "@type": "Organization",
      "name": "ExamAI",
      "sameAs": "https://examai.vercel.app"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen px-6 pt-32 pb-24 flex flex-col items-center">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Prepare for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{examLabel}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Our Vernacular AI Engine is tuned specifically for the {examLabel} syllabus. 
            Generate dynamic notes, attempt quizzes with actual negative marking (-{examData?.negativeMarkingPenalty || 0.25}), and track your mistakes in the secure Vault.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto text-left mb-12">
            <div className="glass-card p-6 border-t-4 border-t-blue-500">
              <h3 className="font-bold text-white mb-2 text-lg">Smart Quizzes</h3>
              <p className="text-sm text-gray-400">Strict timing and native {examData?.negativeMarkingPenalty || -0.25} negative marking logic.</p>
            </div>
            <div className="glass-card p-6 border-t-4 border-t-emerald-500">
              <h3 className="font-bold text-white mb-2 text-lg">Vernacular Support</h3>
              <p className="text-sm text-gray-400">Generate syllabus notes in Hindi, Tamil, Telugu, and more instantly.</p>
            </div>
            <div className="glass-card p-6 border-t-4 border-t-purple-500">
              <h3 className="font-bold text-white mb-2 text-lg">Error Vault</h3>
              <p className="text-sm text-gray-400">Automatically save every mistake you make into a private revision vault.</p>
            </div>
          </div>

          <Link href="/sign-up">
            <button className="rounded-xl bg-white text-gray-950 px-8 py-4 font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
              Start Studying for {examLabel} Free
            </button>
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            EWS Students receive 50 free generations daily upon document verification.
          </p>
        </div>
      </main>
    </>
  );
}
