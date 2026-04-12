"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, HelpCircle, Clock, Save, Trophy } from "lucide-react";
import { SUPPORTED_EXAMS } from "@/config/constants";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type InteractiveQuizProps = {
  questions: Question[];
  examType?: keyof typeof SUPPORTED_EXAMS | null;
};

export default function InteractiveQuiz({ questions, examType }: InteractiveQuizProps) {
  // Store the selected answer for each question index
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Exam Mode State
  const isExamMode = !!examType;
  const examConfig = isExamMode ? SUPPORTED_EXAMS[examType] : null;
  const penalty = examConfig?.negativeMarkingPenalty || 0;
  
  // 1 minute per question in exam mode
  const initialTime = questions.length * 60; 
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitted, setIsSubmitted] = useState(!isExamMode); // In non-exam mode, it's essentially auto-submitted per question
  const [score, setScore] = useState({ correct: 0, incorrect: 0, total: 0 });

  // Timer logic
  useEffect(() => {
    if (!isExamMode || isSubmitted || timeLeft <= 0) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isExamMode, isSubmitted]);

  const handleSelect = (qIndex: number, option: string) => {
    // Stop allowing selections if submitted
    if (isSubmitted && isExamMode) return;
    
    // In practice mode, allow selection only once
    if (!isExamMode && selectedAnswers[qIndex]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  const handleSubmit = () => {
    let correct = 0;
    let incorrect = 0;

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx]) {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    // Calculate penalty
    const totalScore = correct + (incorrect * penalty);

    setScore({
      correct,
      incorrect,
      total: Number(totalScore.toFixed(2)),
    });
    
    setIsSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!questions || questions.length === 0) {
    return <p className="text-gray-400 text-center py-8">No questions available.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Exam Mode Header */}
      {isExamMode && (
        <div className="glass-card mb-8 p-6 border-l-4 border-l-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-24 z-30 shadow-lg shadow-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {examConfig?.label} Mock Test
            </h2>
            <p className="text-sm text-gray-400">
              {questions.length} questions • Negative Marking: <span className="text-red-400">{penalty}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {!isSubmitted ? (
              <>
                <div className={`flex items-center gap-2 text-xl font-mono px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'border-red-500/50 text-red-400 bg-red-500/10 animate-pulse' : 'border-gray-700 bg-gray-800 text-white'}`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" /> Submit Quiz
                </button>
              </>
            ) : (
              <div className="px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 flex gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400">Score</div>
                  <div className="text-lg font-bold text-white max-w-[80px] overflow-hidden whitespace-nowrap text-ellipsis">{score.total} <span className="text-sm font-normal">/ {questions.length}</span></div>
                </div>
                <div className="w-px bg-gray-700 mx-2"></div>
                <div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                  <div className="text-lg font-bold text-green-400">
                    {Math.round((score.correct / questions.length) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {questions.map((q, idx) => {
        // In exam mode, we only show answers AFTER submission.
        // In practice mode, we show answers immediately after selection.
        const showAnswers = isExamMode ? isSubmitted : !!selectedAnswers[idx];
        const selectedOption = selectedAnswers[idx];
        const isCorrect = selectedOption === q.correctAnswer;
        const hasSelection = !!selectedOption;

        return (
          <div 
            key={idx} 
            className={`glass-card p-6 md:p-8 transition-all duration-300 relative overflow-hidden ${
              showAnswers 
                ? isCorrect ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : (hasSelection ? 'border-red-500/30' : 'border-amber-500/30')
                : 'hover:border-indigo-500/30'
            }`}
          >
            {/* Background Hint for answered state */}
            {showAnswers && hasSelection && (
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
                  
                  if (!showAnswers) {
                    // Pre-submission style
                    buttonBaseClass += isThisOptionSelected
                        ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-md cursor-pointer "
                        : "bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-700/80 hover:border-indigo-500/50 hover:shadow-md cursor-pointer ";
                  } else {
                    // Post-submission review style
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
                      disabled={isExamMode ? isSubmitted : hasSelection} // Disable individual questions only after submission in exam mode
                      className={buttonBaseClass}
                    >
                      <span className="pr-8">{opt}</span>
                      
                      {showAnswers && isThisOptionCorrect && (
                         <CheckCircle2 className="w-5 h-5 text-green-400 absolute right-4 shrink-0" />
                      )}
                      {showAnswers && isThisOptionSelected && !isThisOptionCorrect && (
                         <XCircle className="w-5 h-5 text-red-400 absolute right-4 shrink-0" />
                      )}
                      
                      {/* Selection indicator before submission */}
                      {!showAnswers && (
                        <div className={`w-4 h-4 rounded-full border absolute right-4 transition-colors ${
                          isThisOptionSelected ? 'border-[5px] border-indigo-400' : 'border-gray-600 group-hover:border-indigo-400'
                        }`}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Show explanation only after review enabled */}
              {showAnswers && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-forwards">
                  <div className={`p-5 rounded-xl border ${
                    isCorrect 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : (!hasSelection ? 'bg-amber-500/10 border-amber-500/20' : 'bg-indigo-500/10 border-indigo-500/20')
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                       {isCorrect ? (
                         <CheckCircle2 className="w-5 h-5 text-green-400" />
                       ) : (
                         <HelpCircle className="w-5 h-5 text-indigo-400" />
                       )}
                       <p className={`font-semibold ${isCorrect ? 'text-green-300' : 'text-indigo-300'}`}>
                         {isCorrect ? 'Correct! Explanation:' : (!hasSelection ? 'Unanswered. Explanation:' : 'Explanation:')}
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
