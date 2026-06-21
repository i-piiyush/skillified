"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  AlertCircle,
  TerminalSquare
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Types
import { Question } from "@/types/frontendQuestions";
import { authClient } from "@/lib/auth-client";
import { N8N } from "@/types/n8n";
import { UserProfile } from "@/types/user";

// Shadcn UI
import { Button } from "@/components/ui/button";

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
  const [_isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [nextQuestionData, setNextQuestionData] = useState<Question | null>(null);
  const [analysisResult, setAnalysisResult] = useState<unknown>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const hasInitialized = useRef(false);

  // Initialize Session
useEffect(() => {
  if (isPending) return;
  if (hasInitialized.current) return; // ← blocks double-run
  hasInitialized.current = true;

  if (!session?.user.userOnboarded) {
    router.replace("/onboarding/assesment");
    return;
  }

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
      setPageError("Failed to initialize the sequence. Please try again.");
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
      setPageError("Failed to submit telemetry. Check connection.");
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

      // const latestSession = await axios.get(`/api/latest-test-session/${user_id}`)
      // const sessionId = 

     

      const payload: N8N = {
        stack: fetchedUser.stack,
        weakTopics: fetchedUser.weakTopicNames,
        role: fetchedUser.role,
        user_id: fetchedUser.id,
        sessionId : sessionId
      };
console.log("payload: ",payload)
      // 3. Send to N8N
      await axios.post("/api/n8n/hit-n8n", payload);

      router.replace("/dashboard")
    } catch (error) {
      console.error("[QuizPage] Error in handleDashboard sync:", error);
      setPageError("Failed to compile final results. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  // ================= RENDERERS ================= //

  // Background wrapper used in all views
  const bgWrapper = "min-h-screen bg-black text-zinc-300 font-sans flex items-center justify-center p-6 selection:bg-white selection:text-black relative overflow-hidden";
  const bgRadial = (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
    </div>
  );

  // 1. Error Boundary View
  if (pageError && (!questions.length || isFinished)) {
    return (
      <div className={bgWrapper}>
        {bgRadial}
        <div className="max-w-md w-full bg-[#050505] rounded-md p-8 border border-red-900/50 shadow-2xl text-center flex flex-col items-center relative z-10">
          <AlertCircle className="w-10 h-10 text-red-500 mb-6" />
          <h2 className="text-2xl font-medium mb-2 text-white tracking-tight">
            System Failure
          </h2>
          <p className="text-zinc-500 mb-8 text-sm font-mono">{pageError}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full h-11 border-zinc-800 bg-transparent text-white  rounded-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reload Sequence
          </Button>
        </div>
      </div>
    );
  }

  // 2. Loading View
  if (loading || isPending) {
    return (
      <div className={bgWrapper}>
        {bgRadial}
        <div className="flex flex-col items-center gap-5 relative z-10">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
          <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">
            Initializing node sequence...
          </p>
        </div>
      </div>
    );
  }

  // 3. Finished / Verdict View
  if (isFinished) {
    return (
      <div className={bgWrapper}>
        {bgRadial}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full bg-[#050505] rounded-md p-10 border border-zinc-800 shadow-2xl text-center relative z-10"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-8 flex items-center justify-center gap-2">
            <TerminalSquare size={14} /> Sequence Complete
          </div>
          
          <div className="text-7xl font-medium text-white mb-4 tracking-tighter">
            {(analysisResult as any)?.percentage || "0"}%
          </div>
          
          <p className="text-zinc-400 text-sm mb-10 border-t border-zinc-900 pt-6">
            {(analysisResult as any)?.verdict || "Compiling verdict data..."}
          </p>

          {pageError && (
            <p className="text-red-400 text-xs mb-6 bg-red-950/20 border border-red-900/50 p-3 rounded-sm font-mono">
              {pageError}
            </p>
          )}

          <Button
            onClick={handleDashboard}
            disabled={isFinishing}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-sm font-medium transition-colors"
          >
            {isFinishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Return to Dashboard
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // 4. Active Quiz View
  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center pt-16 p-6 overflow-hidden font-sans relative selection:bg-white selection:text-black">
      {bgRadial}

      {/* Flat Wireframe Progress Bar */}
      <div className="w-full max-w-2xl flex gap-0.5 mb-8 z-10">
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
              className="h-0.5 flex-1 bg-zinc-900 overflow-hidden relative"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-white absolute top-0 left-0"
              />
            </div>
          );
        })}
      </div>

      {/* Counter + Score (Monospace Terminal style) */}
      <div className="max-w-2xl w-full flex justify-between items-center mb-8 z-10 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        <span>Node // {currentIndex + 1}_{totalQuestions}</span>
        <span className="text-white bg-white/10 px-2 py-1 rounded-sm border border-white/20">
          Score // {score}
        </span>
      </div>

      {/* Error Toast for mid-quiz submissions */}
      {pageError && !isFinished && (
        <div className="max-w-2xl w-full mb-6 z-10">
          <div className="flex items-center gap-3 text-xs text-red-400 bg-red-950/20 p-3 rounded-sm border border-red-900/50 font-mono">
            <AlertCircle className="w-4 h-4" />
            {pageError}
          </div>
        </div>
      )}

      {/* Stacked Cards Layout */}
      <div className="relative w-full max-w-2xl min-h-125 z-10">
        <AnimatePresence mode="popLayout">
          {questions.map((question, index) => {
            if (index < currentIndex || index > currentIndex + 2) return null;

            const isTop = index === currentIndex;
            const offset = index - currentIndex;

            return (
              <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{
                  opacity: 1 - offset * 0.3,
                  y: offset * 12, // Tighter stacking for wireframe look
                  scale: 1 - offset * 0.02,
                  zIndex: 10 - offset,
                  pointerEvents: isTop ? "auto" : "none",
                }}
                exit={{ opacity: 0, x: -100, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 left-0 w-full bg-[#050505] rounded-md border border-zinc-800 p-6 md:p-10 flex flex-col shadow-2xl"
              >
                {/* Level Badge */}
                <div className="flex items-center gap-3 mb-6 font-mono text-[10px] uppercase tracking-widest">
                  <span className={
                    question.level === 0 ? "text-green-400" :
                    question.level === 1 ? "text-yellow-400" :
                    "text-red-400"
                  }>
                    [Lvl // {question.level === 0 ? "Easy" : question.level === 1 ? "Medium" : "Hard"}]
                  </span>
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-zinc-600">
                    ID_{question.skillId.substring(0, 8)}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-white tracking-tight">
                  {question.text}
                </h3>

                {/* MCQ Options */}
                <div className="flex flex-col gap-3 font-sans">
                  {question.options?.map((option, i) => {
                    const isSelected = selectedAnswer === option;
                    const isRight =
                      backendCorrectAnswer !== null &&
                      option.trim().toLowerCase() === backendCorrectAnswer.trim().toLowerCase();

                    // Wireframe Logic styling
                    let cls = "border-zinc-800 text-zinc-300 bg-transparent hover:border-zinc-600 hover:bg-zinc-900/50";

                    if (isAnswered) {
                      if (isRight) {
                        cls = "border-green-500/50 bg-green-500/10 text-green-400";
                      } else if (isSelected) {
                        cls = "border-red-500/50 bg-red-500/10 text-red-400";
                      } else {
                        cls = "border-zinc-900 text-zinc-600 bg-transparent opacity-40";
                      }
                    } else if (isSubmitting && isSelected) {
                      cls = "border-zinc-500 bg-zinc-900 text-white";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectMCQ(option)}
                        disabled={isAnswered || isSubmitting}
                        className={`w-full text-left px-5 py-4 rounded-sm border transition-all flex justify-between items-center disabled:cursor-default ${cls}`}
                      >
                        <span className="text-sm pr-4 leading-relaxed">{option}</span>
                        
                        {isSubmitting && isSelected && (
                          <Loader2 className="w-4 h-4 shrink-0 animate-spin text-zinc-400" />
                        )}
                        {isAnswered && isRight && (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                        )}
                        {isAnswered && isSelected && !isRight && (
                          <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                {isAnswered && isTop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 flex justify-end"
                  >
                    <Button
                      onClick={handleNext}
                      className="bg-white text-black hover:bg-zinc-200 rounded-sm h-11 px-6 font-medium"
                    >
                      {currentIndex === totalQuestions - 1 ? "Compile Results" : "Next Node"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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