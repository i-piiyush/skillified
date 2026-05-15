"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Code2, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [outputInput, setOutputInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  // New state variables for API integration
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendCorrectAnswer, setBackendCorrectAnswer] = useState(null);
  const [nextQuestionData, setNextQuestionData] = useState(null);

  useEffect(() => {
    const createSession = async (userId) => {
      try {
        const res = await axios.post("/api/create-test", { userId });
        
        if (res.data.success && res.data.question) {
          const fetchedQuestion = res.data.question;
          const user = res.data.user;
          
          const formattedQuestion = {
            ...fetchedQuestion,
            domain: user?.domain || "General",
            stack: user?.stack || ["javascript"],
          };

          setQuestions([formattedQuestion]);
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
   
    createSession(userId || "fallback-id");
  }, []);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= totalQuestions;

  // Reusable submit function for both MCQ and Output
  const submitAnswerToBackend = async (userAnswer) => {
    if (isAnswered || isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedAnswer(userAnswer);

    try {
      // Note: Your backend expects the user's answer under the key 'correctAnswer'
      const res = await axios.post("/api/check-answer", {
        questionId: currentQuestion.id,
        correctAnswer: userAnswer, 
        sessionId: sessionId
      });

      const data = res.data;
      
      // Update UI with backend results
      setBackendCorrectAnswer(data.correctAnswer);
      setScore(data.score); // Use the source of truth from DB
      setNextQuestionData(data.nextQuestion);
      setIsAnswered(true);

    } catch (error) {
      console.error("Error checking answer:", error);
      // Revert selection on error so they can try again
      setSelectedAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMCQ = (option) => {
    submitAnswerToBackend(option);
  };

  const handleSubmitOutput = (e) => {
    e.preventDefault();
    if (!outputInput.trim()) return;
    submitAnswerToBackend(outputInput.trim());
  };

  const handleNext = () => {
    // Append the next question fetched from the previous answer submission
    if (nextQuestionData) {
      const formattedNextQuestion = {
        ...nextQuestionData,
        domain: currentQuestion.domain, // Carry over domain/stack for UI
        stack: currentQuestion.stack,
      };
      setQuestions((prev) => [...prev, formattedNextQuestion]);
    }
    
    setCurrentIndex((prev) => prev + 1);
    setIsAnswered(false);
    setSelectedAnswer("");
    setOutputInput("");
    setBackendCorrectAnswer(null);
    setNextQuestionData(null);
  };

  const restartQuiz = () => {
    window.location.reload(); // Simplest way to restart a fresh session from the server
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] p-4 font-serif text-[#2A2927]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#D27B53] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#9A958E] uppercase tracking-widest text-sm font-semibold">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] p-4 font-serif text-[#2A2927]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-10 border border-[#E6E2DD] shadow-sm text-center"
        >
          <h2 className="text-4xl font-semibold mb-4">Test Completed</h2>
          <p className="text-xl text-gray-600 mb-8">
            Final Score: <span className="font-bold text-[#D27B53]">{score}</span>
          </p>
          <button 
            onClick={restartQuiz}
            className="w-full flex items-center justify-center gap-2 bg-[#D27B53] text-white py-3.5 rounded-xl font-medium hover:bg-[#b86642] transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 bg-[#F4F0EB] p-4 overflow-hidden font-serif text-[#2A2927]">
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl flex gap-1.5 px-4 mb-8 z-10">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          let width = "0%";
          if (idx < currentIndex) width = "100%";
          if (idx === currentIndex) width = isAnswered ? "100%" : "30%";

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

      <div className="max-w-2xl w-full flex justify-between items-center mb-8 px-4 z-10">
        <span className="text-sm px-3 py-1 bg-white border border-[#E6E2DD] text-gray-600 rounded-md shadow-sm">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-sm px-3 py-1 bg-[#D27B53]/10 text-[#D27B53] border border-[#D27B53]/20 rounded-md font-medium">
          Score: {score}
        </span>
      </div>

      <div className="relative w-full max-w-2xl h-[580px] md:h-[520px]">
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
                className="absolute top-0 left-0 w-full h-full bg-white rounded-2xl border border-[#E6E2DD] p-6 md:p-10 flex flex-col shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9A958E]">
                    {question.domain}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#D27B53]" />
                  <span className="text-xs text-gray-500 capitalize">{question.stack?.join(", ") || ""}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-medium leading-tight mb-8 flex-grow-0">
                  {question.text}
                </h3>

                {/* Output Based Questions */}
                {question.type === "output" && question.code && (
                  <>
                    <div className="rounded-xl overflow-hidden border border-[#E6E2DD] bg-white shadow-inner relative mb-4">
                      <Code2 className="absolute top-3 right-3 w-5 h-5 text-gray-400" />
                      <SyntaxHighlighter 
                        language={question.stack?.[0]?.toLowerCase() || "javascript"} 
                        style={prism}
                        customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '14px', fontFamily: 'monospace' }}
                      >
                        {question.code}
                      </SyntaxHighlighter>
                    </div>

                    {!isAnswered ? (
                      <form onSubmit={handleSubmitOutput} className="flex gap-3 mt-auto relative">
                        <input
                          type="text"
                          value={outputInput}
                          onChange={(e) => setOutputInput(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Type the exact output..."
                          className="grow px-4 py-3 rounded-xl border border-[#E6E2DD] bg-[#F9F8F6] focus:outline-none focus:border-[#D27B53] focus:ring-1 focus:ring-[#D27B53] transition-all font-sans disabled:opacity-50"
                        />
                        <button 
                          type="submit"
                          disabled={!outputInput.trim() || isSubmitting}
                          className="bg-[#D27B53] flex items-center justify-center min-w-[100px] text-white px-8 py-3 rounded-xl disabled:opacity-50 hover:bg-[#b86642] transition-colors"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
                        </button>
                      </form>
                    ) : (
                      <div className={`mt-auto p-4 rounded-xl flex items-start gap-4 ${selectedAnswer.trim().toLowerCase() === backendCorrectAnswer?.trim().toLowerCase() ? 'bg-[#EEF4EF] border border-[#CDE0D2]' : 'bg-[#FDF3F3] border border-[#F2D6D6]'}`}>
                        {selectedAnswer.trim().toLowerCase() === backendCorrectAnswer?.trim().toLowerCase() ? (
                          <CheckCircle2 className="w-6 h-6 text-[#2E6B3E] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-[#9A2E2E] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm text-gray-700 font-sans">Your answer: <span className="font-semibold text-gray-900">{selectedAnswer}</span></p>
                          {selectedAnswer.trim().toLowerCase() !== backendCorrectAnswer?.trim().toLowerCase() && backendCorrectAnswer && (
                            <p className="text-sm text-gray-700 font-sans mt-1">Correct answer: <span className="font-semibold text-[#2E6B3E]">{backendCorrectAnswer}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* MCQ Questions */}
                {question.type === "mcq" && (
                  <div className="flex-grow flex flex-col gap-3 justify-end font-sans">
                    {question.options?.map((option, i) => {
                      const isSelected = selectedAnswer === option;
                      // Safe comparison handling potential case issues from DB
                      const isCorrect = backendCorrectAnswer && option.trim().toLowerCase() === backendCorrectAnswer.trim().toLowerCase();
                      
                      let btnStateClass = "border-[#E6E2DD] hover:border-[#D27B53] hover:bg-[#D27B53]/5 text-gray-700 bg-white";
                      
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStateClass = "border-[#4CAF50] bg-[#EEF4EF] text-[#2E6B3E]";
                        } else if (isSelected && !isCorrect) {
                          btnStateClass = "border-[#F44336] bg-[#FDF3F3] text-[#9A2E2E]";
                        } else {
                          btnStateClass = "border-[#E6E2DD] text-gray-400 opacity-40 bg-[#F9F8F6]";
                        }
                      } else if (isSubmitting && isSelected) {
                         // State while API is resolving
                         btnStateClass = "border-[#D27B53] bg-[#D27B53]/10 text-[#D27B53]"; 
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectMCQ(option)}
                          disabled={isAnswered || isSubmitting}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center shadow-sm disabled:cursor-default ${btnStateClass}`}
                        >
                          <span className="text-[15px]">{option}</span>
                          
                          {/* Status Icons */}
                          {isSubmitting && isSelected && <Loader2 className="w-5 h-5 animate-spin text-[#D27B53]" />}
                          {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#F44336]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Next Question Overlay */}
                {isAnswered && isTop && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute -bottom-24 left-0 w-full flex justify-center"
                  >
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-3 bg-[#2A2927] text-white px-8 py-4 rounded-full font-sans text-sm tracking-wide hover:bg-[#1A1918] transition-all shadow-md"
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