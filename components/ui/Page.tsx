"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare } from "lucide-react";

const loadingSteps = [
  "Initializing protocol...",
  "Authenticating session...",
  "Fetching telemetry logs...",
  "Compiling neural map...",
  "Locking in...",
];

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress bar filling up
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Randomize the progress jumps for a more realistic "fetching" feel
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    // Simulate text cycling
    const textInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(textInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Subtle Background Radial */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm border border-zinc-800 bg-[#050505] p-8 rounded-md relative z-10 shadow-2xl"
      >
        {/* Top Wireframe Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-500/50 to-transparent" />

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
            <TerminalSquare size={16} className="text-zinc-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              skillify // v2.0
            </span>
          </div>

          {/* Dynamic Text Log */}
          <div className="h-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 font-mono text-xs text-white tracking-wide"
              >
              {loadingSteps[stepIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              <span>System Load</span>
              <span>{Math.min(progress, 100)}%</span>
            </div>
            
            <div className="h-0.5 w-full bg-zinc-900 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}