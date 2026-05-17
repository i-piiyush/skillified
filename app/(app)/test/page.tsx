"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Code2, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios, { AxiosError } from "axios";
import { Question } from "@/types/frontendQuestions";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [outputInput, setOutputInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendCorrectAnswer, setBackendCorrectAnswer] = useState<string | null>(null);
  const [nextQuestionData, setNextQuestionData] = useState<Question | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    const createSession = async (userId: string) => {
      try {
        
        const res = await axios.post("/api/test/start", { userId });

        if (res.data.question) {
          setQuestions([res.data.question]);
          setSessionId(res.data.sessionId);
          setTotalQuestions(res.data.progress?.total || 10);
        }
      } catch (error) {
        console.error("Error creating session:", error);
      } finally {
        setLoading(false);
      }
    };

    const userId = localStorage.getItem("userId");
    createSession(userId || "");
  }, []);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= totalQuestions;

  const submitAnswer = async (userAnswer: string) => {
    if (isAnswered || isSubmitting || !currentQuestion) return;

    console.log(currentQuestion.id,userAnswer,sessionId)

    setIsSubmitting(true);
    setSelectedAnswer(userAnswer);

    try {
      // ✅ correct route + correct field name (was "correctAnswer", should be "userAnswer")
      const res = await axios.post("/api/test/answer", {
        sessionId,
        questionId: currentQuestion.id,
        userAnswer,          // ← fixed
      });

      const data = res.data;
      

      setIsCorrectAnswer(data.correct);          // ← boolean from backend
      setBackendCorrectAnswer(data.correctAnswer);
      setScore(data.score);
      setNextQuestionData(data.nextQuestion);
      setIsAnswered(true);
      setAnalysisResult(data.analysis); 
      console.log(data.analysis)
    } catch (error) {
      const err = error as AxiosError
      console.error("Error submitting answer:", err.response);
      setSelectedAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMCQ = (option: string) => {
    if (!isAnswered && !isSubmitting) submitAnswer(option);
  };

  const handleSubmitOutput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outputInput.trim()) return;
    submitAnswer(outputInput.trim());
  };

  const handleNext = () => {
    if (nextQuestionData) {
      setQuestions((prev) => [...prev, nextQuestionData]);
    }
    setCurrentIndex((prev) => prev + 1);
    setIsAnswered(false);
    setSelectedAnswer("");
    setOutputInput("");
    setBackendCorrectAnswer(null);
    setNextQuestionData(null);
    setIsCorrectAnswer(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#D27B53] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#9A958E] uppercase tracking-widest text-sm">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-10 border border-[#E6E2DD] shadow-sm text-center font-serif"
        >
          <h2 className="text-4xl font-semibold mb-2 text-[#2A2927]">Test Complete</h2>
          <p className="text-[#9A958E] mb-8 text-sm">Here's how you performed</p>
          <div className="text-6xl font-mono font-bold text-[#D27B53] mb-1">{analysisResult.percentage || "percentage not available"}%</div>
          <p className="text-[#9A958E] text-sm font-mono mb-8">{analysisResult.verdict || "verdict not available" }</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-[#D27B53] text-white py-3.5 rounded-xl font-medium hover:bg-[#b86642] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 bg-[#F4F0EB] p-4 overflow-hidden font-serif text-[#2A2927]">

      {/* Progress bars */}
      <div className="w-full max-w-2xl flex gap-1.5 px-4 mb-6 z-10">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const width = idx < currentIndex ? "100%" : idx === currentIndex && isAnswered ? "100%" : idx === currentIndex ? "30%" : "0%";
          return (
            <div key={idx} className="h-1.5 flex-1 bg-[#E6E2DD] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-[#D27B53]"
              />
            </div>
          );
        })}
      </div>

      {/* Counter + score */}
      <div className="max-w-2xl w-full flex justify-between items-center mb-6 px-4 z-10">
        <span className="text-sm px-3 py-1 bg-white border border-[#E6E2DD] text-gray-600 rounded-md shadow-sm">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-sm px-3 py-1 bg-[#D27B53]/10 text-[#D27B53] border border-[#D27B53]/20 rounded-md font-medium">
          Score: {score}
        </span>
      </div>

      {/* Stacked cards */}
      <div className="relative w-full max-w-2xl" style={{ minHeight: 520 }}>
        <AnimatePresence mode="popLayout">
          {questions.map((question, index) => {
            if (index < currentIndex || index > currentIndex + 2) return null;

            const isTop = index === currentIndex;
            const offset = index - currentIndex;

            return (
              <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{
                  opacity: 1 - offset * 0.25,
                  y: offset * 20,
                  scale: 1 - offset * 0.04,
                  zIndex: 10 - offset,
                  pointerEvents: isTop ? "auto" : "none",
                }}
                exit={{ opacity: 0, x: -300, rotate: -3, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="absolute top-0 left-0 w-full bg-white rounded-2xl border border-[#E6E2DD] p-6 md:p-10 flex flex-col shadow-sm"
              >
                {/* Level badge */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9A958E]">
                    {question.level === 0 ? "Easy" : question.level === 1 ? "Medium" : "Hard"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#D27B53]" />
                  <span className="text-xs text-gray-400 font-mono">{question.skillId}</span>
                </div>

                {/* Question text */}
                <h3 className="text-xl md:text-2xl font-medium leading-snug mb-6">
                  {question.text}
                </h3>

                {/* ── OUTPUT question ── */}
                {question.type === "output" && (
                  <>
                    {question.code && (
                      <div className="rounded-xl overflow-hidden border border-[#E6E2DD] mb-4 relative">
                        <Code2 className="absolute top-3 right-3 w-4 h-4 text-gray-400 z-10" />
                        <SyntaxHighlighter
                          language="javascript"
                          style={prism}
                          customStyle={{
                            margin: 0,
                            padding: "1.25rem",
                            background: "#fafaf9",
                            fontSize: "13px",
                            fontFamily: "monospace",
                          }}
                        >
                          {question.code}
                        </SyntaxHighlighter>
                      </div>
                    )}

                    {!isAnswered ? (
                      <form onSubmit={handleSubmitOutput} className="flex gap-3 mt-4">
                        <input
                          type="text"
                          value={outputInput}
                          onChange={(e) => setOutputInput(e.target.value)}
                          disabled={isSubmitting}
                          placeholder='Type the exact output...'
                          className="grow px-4 py-3 rounded-xl border border-[#E6E2DD] bg-[#F9F8F6] focus:outline-none focus:border-[#D27B53] focus:ring-1 focus:ring-[#D27B53] transition-all font-mono text-sm disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={!outputInput.trim() || isSubmitting}
                          className="bg-[#D27B53] text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:bg-[#b86642] transition-colors min-w-[90px] flex items-center justify-center"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                        </button>
                      </form>
                    ) : (
                      // ✅ uses isCorrectAnswer boolean from backend (not string compare)
                      <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${isCorrectAnswer ? "bg-[#EEF4EF] border-[#CDE0D2]" : "bg-[#FDF3F3] border-[#F2D6D6]"}`}>
                        {isCorrectAnswer
                          ? <CheckCircle2 className="w-5 h-5 text-[#2E6B3E] shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-[#9A2E2E] shrink-0 mt-0.5" />
                        }
                        <div className="font-sans text-sm">
                          <p className="text-gray-700">Your answer: <span className="font-semibold text-gray-900">{selectedAnswer}</span></p>
                          {!isCorrectAnswer && backendCorrectAnswer && (
                            <p className="text-gray-700 mt-1">Correct answer: <span className="font-semibold text-[#2E6B3E]">{backendCorrectAnswer}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── MCQ question ── */}
                {question.type === "mcq" && (
                  <div className="flex flex-col gap-3 font-sans">
                    {question.options?.map((option, i) => {
                      const isSelected = selectedAnswer === option;
                      // ✅ uses backendCorrectAnswer for comparison
                      const isRight = backendCorrectAnswer !== null &&
                        option.trim().toLowerCase() === backendCorrectAnswer.trim().toLowerCase();

                      let cls = "border-[#E6E2DD] hover:border-[#D27B53] hover:bg-[#D27B53]/5 text-gray-700 bg-white";

                      if (isAnswered) {
                        if (isRight) cls = "border-[#4CAF50] bg-[#EEF4EF] text-[#2E6B3E]";
                        else if (isSelected) cls = "border-[#F44336] bg-[#FDF3F3] text-[#9A2E2E]";
                        else cls = "border-[#E6E2DD] text-gray-400 opacity-40 bg-[#F9F8F6]";
                      } else if (isSubmitting && isSelected) {
                        cls = "border-[#D27B53] bg-[#D27B53]/10 text-[#D27B53]";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectMCQ(option)}
                          disabled={isAnswered || isSubmitting}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center shadow-sm disabled:cursor-default ${cls}`}
                        >
                          <span className="text-[15px]">{option}</span>
                          {isSubmitting && isSelected && <Loader2 className="w-4 h-4 animate-spin text-[#D27B53]" />}
                          {isAnswered && isRight && <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />}
                          {isAnswered && isSelected && !isRight && <XCircle className="w-4 h-4 text-[#F44336]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Next button */}
                {isAnswered && isTop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 flex justify-end"
                  >
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-[#2A2927] text-white px-6 py-3 rounded-full font-sans text-sm hover:bg-[#1A1918] transition-all shadow-md"
                    >
                      {currentIndex === totalQuestions - 1 ? "Finish Test" : "Next Question"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}