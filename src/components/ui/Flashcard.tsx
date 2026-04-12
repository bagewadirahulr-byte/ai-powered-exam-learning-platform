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
        <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 p-8 text-center overflow-hidden">
          {/* Dynamic AI Background Image with Ken Burns animation */}
          <div className="absolute inset-0 z-0 opacity-40 transition-transform duration-[10000ms] ease-linear group-hover:scale-125 group-hover:rotate-1">
            <img 
              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(front + " minimalistic, highly detailed, stunning, dark background")}?width=400&height=300&nologo=true`}
              alt={front}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          <div className="absolute inset-0 z-0 bg-gray-900/30 backdrop-blur-[2px]" />

          <div className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-black/50 px-2 py-1 rounded-md border border-white/10 backdrop-blur-md">
            Front
          </div>
          
          <h3 className="z-10 text-xl font-bold text-white transition-all group-hover:scale-105 drop-shadow-2xl max-w-[90%]">
            {front}
          </h3>
          <p className="z-10 mt-6 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs text-blue-400 font-semibold animate-pulse backdrop-blur-md shadow-lg">
            Tap to flip 🔄
          </p>
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
