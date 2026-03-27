// ============================================
// Generated Content Viewer
// ============================================

import { getContentById, getUserByClerkId } from "@/lib/db/queries";
import { ChevronLeft } from "lucide-react";
import PDFDownload from "@/components/ui/PDFDownload";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { CONTENT_TYPES } from "@/config/constants";

type GeneratedData = {
  title?: string;
  sections?: { heading: string; content: string }[];
  questions?: { question: string; options: string[]; correctAnswer: string; explanation: string }[];
  cards?: { front: string; back: string }[];
  pairs?: { question: string; answer: string }[];
};

export default async function ContentPage({ params }: { params: { id: string } }) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  
  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) redirect("/dashboard");
  
  const contentItem = await getContentById(params.id);
  
  // Security check: User can only view their own content
  if (!contentItem || contentItem.userId !== dbUser.id) {
    redirect("/dashboard");
  }

  const { type, topic, content, createdAt } = contentItem;
  const data = content as GeneratedData;
  const config = CONTENT_TYPES[type as keyof typeof CONTENT_TYPES];

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
        return (
          <div className="space-y-6">
            {data.questions?.map((q, idx) => (
              <div key={idx} className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  <span className="text-indigo-400 mr-2">{idx + 1}.</span> 
                  {q.question}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 mb-4">
                  {q.options?.map((opt, optIdx) => (
                    <div 
                      key={optIdx} 
                      className={`p-3 rounded-lg border text-sm ${
                        opt === q.correctAnswer 
                          ? 'bg-green-500/10 border-green-500/50 text-green-200'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-sm font-semibold text-indigo-300 mb-1">Explanation:</p>
                  <p className="text-sm text-gray-300">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "flashcards":
        return (
          <div className="grid gap-6 sm:grid-cols-2">
            {data.cards?.map((card, idx) => (
              <div key={idx} className="glass-card group perspective flex h-64 flex-col justify-center text-center">
                <div className="p-6 h-1/2 flex items-center justify-center border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">{card.front}</h3>
                </div>
                <div className="p-6 h-1/2 flex items-center justify-center bg-gray-800/50 rounded-b-2xl">
                  <p className="text-sm text-gray-300">{card.back}</p>
                </div>
              </div>
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
            
            {/* PDF Download Button (Only for Notes currently) */}
            {type === "notes" && data.sections && (
              <PDFDownload 
                title={data.title || topic} 
                sections={data.sections} 
              />
            )}
          </div>

          <header className="mb-10 text-center sm:text-left">
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

          <div className="mt-8">
            {renderContentBody()}
          </div>
        </div>
      </main>
    </>
  );
}
