"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { Question } from "@/types/frontendQuestions";
import { authClient } from "@/lib/auth-client";
import { N8N } from "@/types/n8n";
import { UserProfile } from "@/types/user";

export default function QuizPage() {
  // Session & Quiz State
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [score, setScore] = useState(0);

  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [backendCorrectAnswer, setBackendCorrectAnswer] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [nextQuestionData, setNextQuestionData] = useState<Question | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();

  // Initialize Session
  useEffect(() => {
    if (isPending) return;

    const createSession = async () => {
      try {
        setPageError(null);
        const res = await axios.post("/api/test/start");

        if (res.data.question) {
          setQuestions([res.data.question]);
          setSessionId(res.data.sessionId);
          setTotalQuestions(res.data.progress?.total || 10);
        } else {
          throw new Error("No question received from the server.");
        }
      } catch (error) {
        console.error("[QuizPage] Error creating session:", error);
        setPageError("Failed to initialize the quiz session. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    createSession();
  }, [isPending]);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= totalQuestions;

  // Submit Answer Logic
  const submitAnswer = async (userAnswer: string) => {
    if (isAnswered || isSubmitting || !currentQuestion) return;

    setIsSubmitting(true);
    setSelectedAnswer(userAnswer);

    try {
      const res = await axios.post("/api/test/answer", {
        sessionId,
        questionId: currentQuestion.id,
        userAnswer,
      });

      const data = res.data;
      setIsCorrectAnswer(data.correct);
      setBackendCorrectAnswer(data.correctAnswer);
      setScore(data.score);
      setNextQuestionData(data.nextQuestion);
      setIsAnswered(true);
      
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("[QuizPage] Error submitting answer:", err.response?.data || err.message);
      setPageError("Failed to submit your answer. Please check your connection.");
      setSelectedAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMCQ = (option: string) => {
    if (!isAnswered && !isSubmitting) submitAnswer(option);
  };

  const handleNext = () => {
    if (nextQuestionData) {
      setQuestions((prev) => [...prev, nextQuestionData]);
    }
    setCurrentIndex((prev) => prev + 1);
    setIsAnswered(false);
    setSelectedAnswer("");
    setBackendCorrectAnswer(null);
    setNextQuestionData(null);
    setIsCorrectAnswer(null);
    setPageError(null); // Clear any non-fatal errors on next
  };

  // Dashboard Completion Logic
  const handleDashboard = async () => {
    setIsFinishing(true);
    setPageError(null);

    try {
      const user_id = session?.user?.id;
      if (!user_id) throw new Error("User session not found.");

      // 1. Fetch user data
      const userRes = await axios.get(`/api/fetch-user/${user_id}`);
      const fetchedUser: UserProfile = userRes.data?.user;
      
      if (!fetchedUser) throw new Error("User profile could not be loaded.");

      // 2. Prepare Webhook payload
      if (!process.env.NEXT_PUBLIC_N8N_URL) {
        throw new Error("NEXT_PUBLIC_N8N_URL environment variable is missing.");
      }

      const postData: N8N = {
        stack: fetchedUser.stack,
        weakTopics: fetchedUser.weakTopicNames,
        role: fetchedUser.role,
        user_id: fetchedUser.id,
      };

      // 3. Send to N8N
      await axios.post(process.env.NEXT_PUBLIC_N8N_URL, postData, {
        headers: {
          "llama-api-key": "sk_prod_12345", // Consider moving this to an API route instead of exposing to the client
        },
      });

      // Redirect user to dashboard
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("[QuizPage] Error in handleDashboard sync:", error);
      setPageError("Failed to save your final results. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  // ================= RENDERERS ================= //

  // 1. Error Boundary View
  if (pageError && (!questions.length || isFinished)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#F44336]/20 shadow-sm text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-[#F44336] mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2 text-[#2A2927]">Oops, something went wrong</h2>
          <p className="text-[#9A958E] mb-6 text-sm">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-[#2A2927] text-white px-6 py-3 rounded-full font-sans text-sm hover:bg-[#1A1918] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading View
  if (loading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#D27B53] animate-spin" />
          <p className="text-[#9A958E] uppercase tracking-widest text-sm font-sans">
            Loading Session...
          </p>
        </div>
      </div>
    );
  }

  // 3. Finished / Verdict View
  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-10 border border-[#E6E2DD] shadow-sm text-center font-serif"
        >
          <h2 className="text-4xl font-semibold mb-2 text-[#2A2927]">
            Test Complete
          </h2>
          <p className="text-[#9A958E] mb-8 text-sm font-sans">
            Here&apos;s how you performed
          </p>
          <div className="text-6xl font-mono font-bold text-[#D27B53] mb-1">
            {analysisResult?.percentage || "0"}%
          </div>
          <p className="text-[#9A958E] text-sm font-sans mb-8">
            {analysisResult?.verdict || "Verdict not available"}
          </p>
          
          {pageError && (
             <p className="text-[#F44336] text-sm mb-4 bg-[#FDF3F3] p-3 rounded-lg font-sans">
                {pageError}
             </p>
          )}

          <button
            onClick={handleDashboard}
            disabled={isFinishing}
            className="w-full flex items-center justify-center gap-2 bg-[#D27B53] text-white py-3.5 rounded-xl font-medium font-sans hover:bg-[#b86642] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isFinishing ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>
                 <RotateCcw className="w-4 h-4" />
                 Go to dashboard
               </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // 4. Active Quiz View
  return (
    <div className="min-h-screen flex flex-col items-center pt-12 bg-[#F4F0EB] p-4 overflow-hidden font-serif text-[#2A2927]">
      {/* Progress bars */}
      <div className="w-full max-w-2xl flex gap-1.5 px-4 mb-6 z-10">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const width =
            idx < currentIndex
              ? "100%"
              : idx === currentIndex && isAnswered
                ? "100%"
                : idx === currentIndex
                  ? "30%"
                  : "0%";
          return (
            <div
              key={idx}
              className="h-1.5 flex-1 bg-[#E6E2DD] rounded-full overflow-hidden"
            >
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
      <div className="max-w-2xl w-full flex justify-between items-center mb-6 px-4 z-10 font-sans">
        <span className="text-sm px-3 py-1 bg-white border border-[#E6E2DD] text-gray-600 rounded-md shadow-sm">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-sm px-3 py-1 bg-[#D27B53]/10 text-[#D27B53] border border-[#D27B53]/20 rounded-md font-medium">
          Score: {score}
        </span>
      </div>

      {/* Error Toast for mid-quiz submissions */}
      {pageError && !isFinished && (
        <div className="max-w-2xl w-full px-4 mb-4 z-10">
           <div className="flex items-center gap-2 text-sm text-[#F44336] bg-[#FDF3F3] p-3 rounded-lg border border-[#F44336]/20 font-sans">
              <AlertCircle className="w-4 h-4" />
              {pageError}
           </div>
        </div>
      )}

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
                <div className="flex items-center gap-3 mb-5 font-sans">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9A958E]">
                    {question.level === 0
                      ? "Easy"
                      : question.level === 1
                        ? "Medium"
                        : "Hard"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#D27B53]" />
                  <span className="text-xs text-gray-400 font-mono">
                    {question.skillId}
                  </span>
                </div>

                {/* Question text */}
                <h3 className="text-xl md:text-2xl font-medium leading-snug mb-6">
                  {question.text}
                </h3>

                {/* ── MCQ question ── */}
                <div className="flex flex-col gap-3 font-sans">
                  {question.options?.map((option, i) => {
                    const isSelected = selectedAnswer === option;
                    const isRight =
                      backendCorrectAnswer !== null &&
                      option.trim().toLowerCase() ===
                        backendCorrectAnswer.trim().toLowerCase();

                    let cls =
                      "border-[#E6E2DD] hover:border-[#D27B53] hover:bg-[#D27B53]/5 text-gray-700 bg-white";

                    if (isAnswered) {
                      if (isRight)
                        cls = "border-[#4CAF50] bg-[#EEF4EF] text-[#2E6B3E]";
                      else if (isSelected)
                        cls = "border-[#F44336] bg-[#FDF3F3] text-[#9A2E2E]";
                      else
                        cls = "border-[#E6E2DD] text-gray-400 opacity-40 bg-[#F9F8F6]";
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
                        <span className="text-[15px] pr-4">{option}</span>
                        {isSubmitting && isSelected && (
                          <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-[#D27B53]" />
                        )}
                        {isAnswered && isRight && (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#4CAF50]" />
                        )}
                        {isAnswered && isSelected && !isRight && (
                          <XCircle className="w-5 h-5 flex-shrink-0 text-[#F44336]" />
                        )}
                      </button>
                    );
                  })}
                </div>

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
                      {currentIndex === totalQuestions - 1
                        ? "Finish Test"
                        : "Next Question"}
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