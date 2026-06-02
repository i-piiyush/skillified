"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const questions = [
  { id: "domain", text: "Yo, what are we cooking today? Which field are you grinding in?", options: ["Frontend", "Backend", "Fullstack", "DevOps", "AI/ML"] },
  { id: "goal", text: "Dope. What's the main mission? Trying to land a job or just building for the vibes?", options: ["Land a job", "Building a project", "Upskilling", "Just exploring"] },
  { id: "background", text: "Got it. What's your current situation? Uni life or self-taught grind?", options: ["Uni student", "Self-taught", "Bootcamp", "Working pro"] },
  { id: "years", text: "How long you been at it? Be real.", options: ["0-6 months", "6-12 months", "1-2 years", "2+ years"] },
  { id: "pain", text: "Last one—where do you keep fumbling? What's your biggest blocker?", options: ["Consistency", "System design", "Auth/Security", "Deploying", "Database"] },
];

const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, originY: 1 }}
    className="bg-[#F7F6F3] border border-[#E5E4E0] px-4 py-3.5 rounded-2xl rounded-tl-sm w-16 flex items-center justify-center gap-1 shadow-sm"
  >
    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
  </motion.div>
);

export default function RoadmapOnboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step, isTyping]);

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [questions[step].id]: option }));
    
    if (step < questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setStep(step + 1);
      }, 800); // 800ms of "typing" before next question
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-[#E5E4E0]">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Ultra Minimal Header */}
          <div className="md:col-span-4 relative">
            <div className="md:sticky md:top-24 space-y-3">
              <h1 className="text-2xl lg:text-3xl font-serif text-neutral-900 tracking-tight leading-tight">
                Let's map it out.
              </h1>
              <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
                Answer these few and I'll build your personal path. No fluff.
              </p>
            </div>
          </div>

          {/* Right Column: Chat Feed */}
          <div className="md:col-span-8 pb-32">
            <div className="space-y-8 max-w-xl">
              {questions.slice(0, step + 1).map((q, i) => (
                <div key={q.id} className="space-y-4">
                  
                  {/* Bot Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95, transformOrigin: "bottom left" }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#F7F6F3] border border-[#E5E4E0] p-4 lg:p-5 rounded-2xl rounded-tl-sm max-w-[90%] lg:max-w-[85%] shadow-sm transition-shadow hover:shadow-md">
                      <p className="text-base lg:text-lg font-serif text-neutral-900 leading-snug">
                        {q.text}
                      </p>
                    </div>
                  </motion.div>

                  {/* User Answer / Options */}
                  {answers[q.id] ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#1A1918] text-white px-5 py-2.5 rounded-2xl rounded-tr-sm shadow-md font-medium text-sm">
                        {answers[q.id]}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 lg:pl-6"
                    >
                      {q.options.map((opt, index) => (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.02, backgroundColor: "#FCFBFA" }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          onClick={() => handleSelect(opt)}
                          className="text-left bg-white border border-[#E5E4E0] p-3.5 rounded-xl text-xs lg:text-sm font-medium text-neutral-600 flex justify-between items-center group transition-colors"
                        >
                          {opt}
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="text-[var(--color-chestnut)]"
                          >
                            <Check size={14} />
                          </motion.div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div className="flex justify-start pt-2">
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={endRef} className="h-4" />
            </div>

            {/* Final Generation CTA */}
            <AnimatePresence>
              {step === questions.length - 1 && answers[questions[step].id] && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                  className="pt-12 mt-6 flex justify-end"
                >
                  <motion.button 
                    whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px -10px rgba(140, 39, 30, 0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center gap-2.5 bg-[var(--color-chestnut)] text-white px-6 py-3.5 rounded-2xl font-medium text-sm transition-colors"
                  >
                    <Sparkles size={16} />
                    Generate my roadmap
                    <ArrowRight size={16} className="ml-1" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}