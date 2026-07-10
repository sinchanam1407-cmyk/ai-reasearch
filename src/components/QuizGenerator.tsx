"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Paper } from "../lib/mockData";
import { generateQuiz, QuizQuestion } from "../lib/gemini";
import { 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  X,
  FileCheck,
  Award,
  Layers
} from "lucide-react";

interface QuizGeneratorProps {
  paper: Paper;
}

export default function QuizGenerator({ paper }: QuizGeneratorProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quizType, setQuizType] = useState<"mcq" | "flashcard" | "tf">("mcq");
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcards
  const [quizFinished, setQuizFinished] = useState(false);

  // Generate Quiz Questions
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFlipped(false);
    setQuizFinished(false);

    try {
      const qList = await generateQuiz(
        paper.title,
        paper.content.map(c => `${c.sectionTitle}\n${c.text}`).join("\n\n"),
        difficulty,
        quizType
      );
      setQuestions(qList);
    } catch (e) {
      console.error("Quiz creation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (isAnswered || !selectedOption) return;
    
    setIsAnswered(true);
    const correctAns = questions[currentIdx].answer;
    
    if (selectedOption === correctAns) {
      setScore(score + 1);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFlipped(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
      // Trigger Confetti if they score high!
      if (score >= Math.floor(questions.length * 0.7)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Interactive Quiz Generator
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          Test your comprehension
        </span>
      </div>

      {questions.length === 0 ? (
        // Quiz Settings Setup screen
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-white/5 rounded-2xl">
          {isLoading ? (
            <div className="space-y-3 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
              <p className="text-xs text-indigo-300 font-bold animate-pulse">
                Analyzing document facts and writing test sheets...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-5">
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-white mb-1">Generate Active Quiz</h3>
                <p className="text-[10px] text-slate-400">
                  Assess your understanding of the methodology, datasets, and key findings.
                </p>
              </div>

              {/* Settings selectors */}
              <div className="space-y-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                {/* Type Selection */}
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Quiz Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["mcq", "tf", "flashcard"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuizType(t)}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border transition cursor-pointer ${
                          quizType === t
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {t === "mcq" ? "MCQ" : t === "tf" ? "T / F" : "Flashcard"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border transition cursor-pointer ${
                          difficulty === d
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Build Comprehensive Quiz
              </button>
            </div>
          )}
        </div>
      ) : quizFinished ? (
        // Score Report Screen
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-white/5 bg-white/3 rounded-2xl text-center space-y-4">
          <div className="bg-indigo-600/10 p-3 rounded-full border border-indigo-500/20">
            <Award className="w-12 h-12 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Quiz Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Here is your performance report card for **"{paper.title.slice(0, 30)}..."**
            </p>
          </div>

          <div className="bg-zinc-950/40 px-6 py-4 rounded-xl border border-white/5">
            <div className="text-2xl font-black text-indigo-400">
              {score} / {questions.length}
            </div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Correct Answers
            </div>
          </div>

          <p className="text-[10px] text-slate-400 max-w-xs">
            {score === questions.length 
              ? "Flawless score! You have completely mastered the details of this paper."
              : "Great attempt! Review the paper outline on the left and test yourself again."}
          </p>

          <button
            onClick={() => setQuestions([])}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold border border-white/5 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Take Another Quiz
          </button>
        </div>
      ) : (
        // Active Question Screen
        <div className="flex-1 flex flex-col justify-between min-h-0 gap-4">
          {/* Question Head Header */}
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
            <span>Difficulty: <span className="text-indigo-400 font-bold uppercase">{difficulty}</span></span>
            <span>Question {currentIdx + 1} of {questions.length}</span>
          </div>

          {/* Flashcard style panel (flippable) */}
          {quizType === "flashcard" ? (
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`flex-1 border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[160px] ${
                isFlipped 
                  ? "bg-indigo-650/10 border-indigo-500/30 text-indigo-200" 
                  : "bg-white/5 border-white/5 text-slate-200 hover:bg-white/8"
              }`}
            >
              {!isFlipped ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold leading-relaxed">{questions[currentIdx].question}</h4>
                  <span className="inline-block px-3 py-1 bg-white/5 text-[9px] text-slate-400 font-semibold rounded-full border border-white/5">
                    Click to flip & reveal answer
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Answer</div>
                  <p className="text-xs leading-relaxed font-medium">{questions[currentIdx].answer}</p>
                  <span className="inline-block px-3 py-1 bg-indigo-500/10 text-[9px] text-indigo-300 font-bold rounded-full border border-indigo-500/10">
                    Click to show Question
                  </span>
                </div>
              )}
            </div>
          ) : (
            // MCQ or T/F question body
            <div className="flex-1 space-y-4 min-h-0 overflow-y-auto pr-1">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <h4 className="text-xs font-bold leading-relaxed text-slate-100">
                  {questions[currentIdx].question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {questions[currentIdx].options?.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === questions[currentIdx].answer;
                  
                  let optionClass = "bg-white/5 border-white/5 hover:bg-white/8 text-slate-300";
                  if (isSelected) {
                    optionClass = "bg-indigo-600/10 border-indigo-500 text-indigo-300 font-semibold";
                  }
                  if (isAnswered) {
                    if (isCorrect) {
                      optionClass = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold";
                    } else if (isSelected) {
                      optionClass = "bg-rose-500/10 border-rose-500 text-rose-400 font-semibold";
                    } else {
                      optionClass = "bg-white/2 border-white/2 text-slate-600 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => !isAnswered && setSelectedOption(opt)}
                      disabled={isAnswered}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition flex justify-between items-center cursor-pointer ${optionClass}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Next Actions */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-white/5 shrink-0">
            {quizType !== "flashcard" && !isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                {currentIdx < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  "Finish Quiz"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
