"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HorizontalStorySection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  const panels = [
    { title: "Pick Your Main", desc: "Select your stack. Web, AI, or Security. Set your target level and lock in." },
    { title: "The Final Boss", desc: "Our engine scales difficulty in real-time. If you know your stuff, we skip the basic trivia." },
    { title: "Reality Check", desc: "We pinpoint exactly where you are lacking. No more guessing why recruiters are ghosting you." },
    { title: "The Blueprint", desc: "A custom progression sequence optimized for your target role. No fluff, just the critical path." },
    { title: "Level Up", desc: "Stop watching irrelevant tutorials. Attack the concepts that are actually blocking your hire." },
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden border-y border-zinc-900">
        <motion.div style={{ x }} className="flex w-[500vw]">
          {panels.map((panel, i) => (
            <div key={i} className="flex h-full w-screen items-center justify-center px-4 sm:px-8">
              <div className="w-full max-w-2xl text-center">
                <div className="font-mono text-sm text-zinc-600 mb-6 tracking-widest">0{i + 1}` // 05`</div>
                <h3 className="text-4xl font-medium tracking-tighter text-white sm:text-6xl">{panel.title}</h3>
                <p className="mt-6 text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">{panel.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}