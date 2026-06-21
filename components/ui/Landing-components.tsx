"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { reveal } from "../../lib/animation";

export function WordRevealHeading({ title, className = "", center = false }: { title: string; className?: string; center?: boolean }) {
  const words = title.split(" ");
  return (
    <motion.div
      className={`flex flex-wrap ${center ? "justify-center" : ""} ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
        hidden: {},
      }}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="mr-[0.25em] mb-[0.1em]"
          variants={{
            hidden: { opacity: 0, filter: "blur(8px)", y: 20 },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-120px" }}
      className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4">
        {eyebrow}
      </div>
      <WordRevealHeading
        title={title}
        center={center}
        className="text-3xl font-medium tracking-tighter text-white sm:text-4xl lg:text-5xl"
      />
      <motion.p 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] } }
        }}
        className="mt-6 text-sm leading-relaxed text-zinc-400 sm:text-base"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export function ScrollTypography({ text }: { text: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);

  return (
    <div ref={ref} className="flex h-[60vh] items-center justify-center relative z-20 px-4 pointer-events-none border-y border-zinc-900 bg-black/50">
      <motion.div style={{ opacity, y }} className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white">{text}</h2>
      </motion.div>
    </div>
  );
}

export function SectionShell({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 ${className}`}>
      {children}
    </section>
  );
}

export function ShowcaseLabel({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-l border-zinc-800 pl-4 py-1">
      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{title}</div>
      <div className="mt-1 text-sm text-zinc-200">{value}</div>
    </div>
  );
}

export function AnimatedMetric({ label, value, bar }: { label: string; value: string; bar: string }) {
  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-0.5 w-full bg-zinc-900 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: bar }}
          viewport={{ once: false }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-white"
        />
      </div>
    </div>
  );
}