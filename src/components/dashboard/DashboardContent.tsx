"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, HelpCircle, Layers, MessageSquare, Plus } from "lucide-react";
import { CONTENT_TYPES } from "@/config/constants";
import Button from "@/components/ui/Button";

interface ContentItem {
  id: string;
  userId: string;
  topic: string;
  type: string;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

interface DashboardContentProps {
  initialHistory: ContentItem[];
}

export default function DashboardContent({ initialHistory }: DashboardContentProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredHistory = useMemo(() => {
    return initialHistory.filter((item) => {
      const matchesSearch = item.topic.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "all" || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [initialHistory, search, activeFilter]);

  const filterOptions = [
    { id: "all", label: "All Content", icon: <Layers className="w-4 h-4" /> },
    { id: "notes", label: "Notes", icon: <BookOpen className="w-4 h-4" /> },
    { id: "quiz", label: "Quizzes", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "flashcards", label: "Flashcards", icon: <Plus className="w-4 h-4" /> },
    { id: "qna", label: "Q&A", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search your study materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === opt.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div>
        <h2 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
            Recent Content
            <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {filteredHistory.length}
            </span>
        </h2>
        
        {filteredHistory.length === 0 ? (
          <div className="glass-card flex flex-col items-center p-16 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6 text-5xl opacity-50 grayscale">📚</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {search || activeFilter !== 'all' ? "No materials found" : "No study materials yet"}
            </h3>
            <p className="mb-8 text-sm text-gray-400 max-w-xs mx-auto">
              {search || activeFilter !== 'all' 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "Start by generating notes, quizzes, or flashcards using the quick actions above."}
            </p>
            {!search && activeFilter === 'all' && (
              <Link href="/generate">
                <Button variant="primary" size="md">
                  Generate First Content
                </Button>
              </Link>
            )}
            {(search || activeFilter !== 'all') && (
              <button 
                onClick={() => { setSearch(""); setActiveFilter("all"); }}
                className="text-blue-400 text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredHistory.map((item, idx) => {
              const config = CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES];
              
              return (
                <Link 
                    key={item.id} 
                    href={`/dashboard/content/${item.id}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                >
                  <div className="glass-card group flex flex-col p-6 hover:scale-[1.03] hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config?.color || 'from-gray-600 to-gray-800'} text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {config?.icon || '📄'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-white line-clamp-2 mb-3 text-lg leading-snug group-hover:text-blue-400 transition-colors">
                      {item.topic}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 capitalize px-2 py-0.5 bg-white/5 rounded border border-white/5">
                            {item.type === 'qna' ? 'Q&A' : item.type}
                        </span>
                        <span className="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                        </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
