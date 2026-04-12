"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  className?: string;
}

export default function Flashcard({ front, back, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        "perspective h-64 w-full cursor-pointer group",
        className
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "preserve-3d relative h-full w-full duration-500 ease-in-out transition-transform shadow-xl rounded-2xl",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Side */}
        <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gray-900/80 p-8 text-center backdrop-blur-sm">
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Front</div>
          
          <div className="mb-4 text-4xl opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300">
            {front.toLowerCase().includes('science') || front.toLowerCase().includes('biology') ? '🧬' :
             front.toLowerCase().includes('law') || front.toLowerCase().includes('polity') ? '⚖️' :
             front.toLowerCase().includes('math') || front.toLowerCase().includes('data') || front.toLowerCase().includes('statistics') ? '📊' :
             front.toLowerCase().includes('history') ? '🏛️' :
             front.toLowerCase().includes('geography') || front.toLowerCase().includes('earth') ? '🌍' :
             front.toLowerCase().includes('economy') || front.toLowerCase().includes('finance') ? '📉' : '💡'}
          </div>

          <h3 className="text-xl font-bold text-white transition-all group-hover:scale-105">
            {front}
          </h3>
          <p className="mt-6 text-xs text-blue-400/60 font-medium animate-pulse">Click to flip 🔄</p>
        </div>

        {/* Back Side */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-900/20 p-8 text-center backdrop-blur-md">
           <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-blue-400 font-bold">Back / Answer</div>
          <p className="text-gray-200 leading-relaxed">
            {back}
          </p>
          <div className="mt-8 h-1 w-12 rounded-full bg-blue-500/30" />
        </div>
      </div>
    </div>
  );
}
