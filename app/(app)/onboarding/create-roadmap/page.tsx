"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TerminalSquare, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Types (Adjust paths as needed for your project)
import { Question } from "@/types/question";
import { DOMAINS } from "../assesment/page"; // Or redefine here if needed

// Shadcn UI
import { Button } from "@/components/ui/button";

const INITIALQUESTIONS = [
  { 
    id: "domain", 
    text: "Which domain are we grinding in? Select your main:", 
    options: DOMAINS 
  },
  { 
    id: "goal", 
    text: "Target locked. What's the actual mission? Securing the bag or just building for the vibes?", 
    options: ["Internship", "SDE 1", "SDE 2", "SDE 3"] 
  },
  { 
    id: "targetCompany", 
    text: "Specify the boss level. Which tier of company are you trying to crack?", 
    options: ["Product based", "Product based startup", "Service based", "MAANG/FAANG level"] 
  },
  { 
    id: "focusStudyHours", 
    text: "Be real. How many compute hours are you dedicating to this daily?", 
    options: ["0-1 hours", "2-3 hours", "3-4 hours"] 
  },
  { 
    id: "academicStatus", 
    text: "Current academic status?", 
    options: ["High school", "Undergraduate", "Postgraduate"] 
  },
];

// Terminal-style loading indicator
const TerminalLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-4 pl-4 border-l border-zinc-800"
  >
    <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
    <span>Awaiting system response...</span>
  </motion.div>
);

export default function RoadmapOnboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(INITIALQUESTIONS);
  const endRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const MAX_QUESTIONS = 9;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step, isTyping]);

  const handleSelect = async (option: string) => {
    const updatedAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(updatedAnswers);
    
    if (step < questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setStep(step + 1);
      }, 600); // Slightly faster, snappier terminal feel
    } else if(questions.length < MAX_QUESTIONS) {
      setIsTyping(true);
      try {
        const res = await axios.post("/api/roadmap/generate-question", { updatedAnswers });
        const fetchedQuestion: Question = res.data.question;
        
        setQuestions((prev) => [...prev, {
          id: fetchedQuestion.jsonKey,
          text: fetchedQuestion.question,
          options: fetchedQuestion.options
        }]);
        setStep(step + 1);
      } catch (error) {
        console.error("Failed to pull next question node", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    console.log("Payload:", answers);

    try {
      const res = await axios.post("/api/roadmap/generate-roadmap", { answers });
      if(res.data.success) {
        console.log(res.data.message);
        router.replace("/dashboard/roadmap");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(error);
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Subtle Background Radial */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Context / Header */}
          <div className="md:col-span-4 relative">
            <div className="md:sticky md:top-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                <TerminalSquare size={16} className="text-zinc-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Pathfinder Protocol
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-medium text-white tracking-tighter mb-4">
                  Map it out.
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                  Provide your configuration parameters. We&apos;ll strip the fluff and build a custom progression sequence for your exact goal.
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="hidden md:block pt-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-3 flex justify-between">
                  <span>Configuration</span>
                  <span>{Math.round((step / Math.max(questions.length, 1)) * 100)}%</span>
                </div>
                <div className="h-0.5 w-full bg-zinc-900">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / Math.max(questions.length, 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Feed */}
          <div className="md:col-span-8 pb-32">
            <div className="space-y-10 max-w-2xl">
              {questions.slice(0, step + 1).map((q, i) => {
                const isAnswered = !!answers[q.id];

                return (
                  <div key={q.id} className="space-y-4">
                    
                    {/* Bot Prompt */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                        [SYS] QUERY_{i + 1}
                      </div>
                      <p className="text-base text-zinc-200 leading-relaxed border-l border-zinc-800 pl-4 py-1">
                        {q.text}
                      </p>
                    </motion.div>

                    {/* User Answer / Options */}
                    {isAnswered ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pl-4"
                      >
                        <div className="font-mono text-sm text-white flex items-center gap-2">
                          <span className="text-zinc-600">&gt;</span> 
                          <span className="bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
                            {answers[q.id]}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="pl-4 pt-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, _index) => (
                            <button
                              key={opt}
                              onClick={() => handleSelect(opt)}
                              className="text-left bg-transparent border border-zinc-800 p-3.5 rounded-sm text-sm font-medium text-zinc-400 flex justify-between items-center group hover:border-zinc-500 hover:bg-zinc-900 transition-all"
                            >
                              <span className="group-hover:text-zinc-200 transition-colors">{opt}</span>
                              <Check size={14} className="opacity-0 group-hover:opacity-100 text-white transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div className="flex justify-start">
                    <TerminalLoader />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={endRef} className="h-1" />
            </div>

            {/* Final Execution Button */}
            <AnimatePresence>
              {step === questions.length - 1 && answers[questions[step].id] && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="pt-12 mt-12 border-t border-zinc-900"
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
                    Configuration Complete. Ready to execute.
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="h-12 px-8 bg-white text-black hover:bg-zinc-200 rounded-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Compiling Nodes...</span>
                      </>
                    ) : (
                      <>
                        Execute Build Sequence
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}