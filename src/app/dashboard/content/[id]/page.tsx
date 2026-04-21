// ============================================
// Generated Content Viewer
// ============================================

import { getContentById, getUserByClerkId, getErrorReportCount } from "@/lib/db/queries";
import { ChevronLeft } from "lucide-react";
import PrintablePDF from "@/components/ui/PrintablePDF";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { CONTENT_TYPES } from "@/config/constants";
import InteractiveQuiz from "@/components/ui/InteractiveQuiz";
import Flashcard from "@/components/ui/Flashcard";
import ContentActionBar from "./ContentActionBar";


export const dynamic = "force-dynamic";

type GeneratedData = {
  title?: string;
  sections?: { heading: string; content: string }[];
  questions?: { question: string; options: string[]; correctAnswer: string; explanation: string }[];
  cards?: { front: string; back: string }[];
  pairs?: { question: string; answer: string }[];
};

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  
  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect("/dashboard");
  
  const contentItem = await getContentById(id);
  
  // Security check: User can only view their own content
  if (!contentItem || contentItem.userId !== dbUser.id) {
    redirect("/dashboard");
  }

  const { type, topic, content, createdAt, isBookmarked, examType } = contentItem;
  const data = content as GeneratedData;
  const config = CONTENT_TYPES[type as keyof typeof CONTENT_TYPES];

  // Check if content has been flagged by community
  const errorReportCount = await getErrorReportCount(id);
  const isFlagged = errorReportCount >= 3;

  // Render different UI based on the type
  const renderContentBody = () => {
    switch (type) {
      case "notes":
        return (
          <div className="space-y-8">
            {data.sections?.map((section, idx) => (
              <div key={idx} className="glass-card p-6 border-l-4 border-l-blue-500">
                <h3 className="text-xl font-semibold text-white mb-3">{section.heading}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        );

      case "quiz":
        return <InteractiveQuiz questions={data.questions || []} examType={examType} />;

      case "flashcards":
        return (
          <div className="grid gap-6 sm:grid-cols-2">
            {data.cards?.map((card, idx) => (
              <Flashcard key={idx} front={card.front} back={card.back} />
            ))}
          </div>
        );


      case "qna":
        return (
          <div className="space-y-6">
            {data.pairs?.map((pair, idx) => (
              <div key={idx} className="glass-card p-6">
                <div className="flex gap-4 items-start mb-4">
                  <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 font-bold">Q</span>
                  <p className="text-lg font-medium text-white pt-1">{pair.question}</p>
                </div>
                <div className="flex gap-4 items-start pl-4 border-l-2 border-gray-700">
                  <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">A</span>
                  <p className="text-gray-300 leading-relaxed pt-1">{pair.answer}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="glass-card p-6">
            <pre className="text-sm text-gray-400 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            
            {/* PDF Download Button for all types */}
            {data && (
              <PrintablePDF 
                title={topic} 
                type={type as "notes" | "quiz" | "flashcards" | "qna"}
                data={data} 
              />
            )}

          </div>

          <header className="mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config?.color || 'from-gray-600 to-gray-800'} text-2xl shadow-lg`}>
                  {config?.icon || '📄'}
                </span>
                <span className="text-sm uppercase tracking-wider font-semibold text-gray-400">
                  {type}
                </span>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                Generated {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {topic}
            </h1>
          </header>

          {/* Action Bar: Bookmark, Ask Tutor, Report Error, Listen */}
          <div className="mb-8">
            <ContentActionBar
              contentId={id}
              topic={topic}
              isBookmarked={isBookmarked}
              contentType={type}
              contentText={
                // Extract plain text for TTS
                type === "notes"
                  ? (data.sections?.map((s) => `${s.heading}. ${s.content}`).join(". ") || topic)
                  : type === "qna"
                  ? (data.pairs?.map((p) => `Question: ${p.question}. Answer: ${p.answer}`).join(". ") || topic)
                  : type === "flashcards"
                  ? (data.cards?.map((c) => `${c.front}. ${c.back}`).join(". ") || topic)
                  : topic
              }
              language={dbUser.preferredLanguage || "english"}
            />
          </div>

          {/* Community Flagged Warning */}
          {isFlagged && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm text-amber-300">
                ⚠️ <strong>Community Notice:</strong> This content has been flagged by multiple users for potential inaccuracies. Please verify critical information independently.
              </p>
            </div>
          )}

          <div className="mt-4">
            {renderContentBody()}
          </div>
        </div>
      </main>
    </>
  );
}
