"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export default function InteractiveQuiz({ questions }: { questions: Question[] }) {
  // Store the selected answer for each question index
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qIndex: number, option: string) => {
    // Only allow selecting if not already answered
    if (selectedAnswers[qIndex]) return;
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  if (!questions || questions.length === 0) {
    return <p className="text-gray-400 text-center py-8">No questions available.</p>;
  }

  return (
    <div className="space-y-8">
      {questions.map((q, idx) => {
        const isAnswered = !!selectedAnswers[idx];
        const selectedOption = selectedAnswers[idx];
        const isCorrect = selectedOption === q.correctAnswer;

        return (
          <div 
            key={idx} 
            className={`glass-card p-6 md:p-8 transition-all duration-300 relative overflow-hidden ${
              isAnswered 
                ? isCorrect ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-red-500/30'
                : 'hover:border-indigo-500/30'
            }`}
          >
            {/* Background Hint for answered state */}
            {isAnswered && (
              <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 pointer-events-none">
                {isCorrect ? (
                  <CheckCircle2 className="w-40 h-40 text-green-500" />
                ) : (
                  <XCircle className="w-40 h-40 text-red-500" />
                )}
              </div>
            )}

            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white mb-6 flex items-start">
                <span className="flex items-center justify-center min-w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold mr-3 mt-0.5 shadow-sm">
                  {idx + 1}
                </span> 
                <span className="leading-snug">{q.question}</span>
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                {q.options?.map((opt, optIdx) => {
                  const isThisOptionSelected = selectedOption === opt;
                  const isThisOptionCorrect = q.correctAnswer === opt;
                  
                  let buttonBaseClass = "relative p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group overflow-hidden ";
                  
                  if (!isAnswered) {
                    buttonBaseClass += "bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-700/80 hover:border-indigo-500/50 hover:shadow-md cursor-pointer";
                  } else {
                    buttonBaseClass += "cursor-default ";
                    if (isThisOptionCorrect) {
                       buttonBaseClass += "bg-green-500/10 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.1)] ";
                    } else if (isThisOptionSelected && !isThisOptionCorrect) {
                       buttonBaseClass += "bg-red-500/10 border-red-500/50 text-red-300 ";
                    } else {
                       buttonBaseClass += "bg-gray-800/20 border-gray-800/50 text-gray-600 opacity-50 ";
                    }
                  }

                  return (
                    <button 
                      key={optIdx} 
                      onClick={() => handleSelect(idx, opt)}
                      disabled={isAnswered}
                      className={buttonBaseClass}
                    >
                      <span className="pr-8">{opt}</span>
                      
                      {isAnswered && isThisOptionCorrect && (
                         <CheckCircle2 className="w-5 h-5 text-green-400 absolute right-4 shrink-0" />
                      )}
                      {isAnswered && isThisOptionSelected && !isThisOptionCorrect && (
                         <XCircle className="w-5 h-5 text-red-400 absolute right-4 shrink-0" />
                      )}
                      {!isAnswered && (
                        <div className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-indigo-400 absolute right-4 transition-colors"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-forwards">
                  <div className={`p-5 rounded-xl border ${
                    isCorrect 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-indigo-500/10 border-indigo-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                       {isCorrect ? (
                         <CheckCircle2 className="w-5 h-5 text-green-400" />
                       ) : (
                         <HelpCircle className="w-5 h-5 text-indigo-400" />
                       )}
                       <p className={`font-semibold ${isCorrect ? 'text-green-300' : 'text-indigo-300'}`}>
                         {isCorrect ? 'Correct! Explanation:' : 'Explanation:'}
                       </p>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base ml-7">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
