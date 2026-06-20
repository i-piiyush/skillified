"use client";

import React, { useEffect } from "react";
import Grainient from "@/components/ui/Grainient";
import Navbar from "@/components/ui/Navbar";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

// Imports from extracted files
import { ease, fadeUp, reveal, stagger } from "@/lib/animation";
import {
  socialItems,
  menuItems,
  problemCards,
  roadmapCards,
} from "@/config/landing-data";
import { HorizontalStorySection } from "@/components/sections/HorizontalStorySection";
import {
  WordRevealHeading,
  SectionHeading,
  ScrollTypography,
  SectionShell,
  ShowcaseLabel,
  AnimatedMetric,
} from "@/components/ui/Landing-components";
import { useRouter } from "next/navigation";

function Page() {

  useEffect(() => {
  const nav = document.querySelector('.nav-blur') as HTMLElement;
  
  const applyStyles = (isMobile: boolean) => {
    if (!nav) return;
    if (isMobile) {
      nav.style.backgroundColor = 'rgba(0, 0, 0, 0.01)';
      nav.style.backdropFilter = 'blur(5px)';
      nav.style.webkitBackdropFilter = 'blur(30px)';
    } else {
      nav.style.backgroundColor = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.webkitBackdropFilter = 'none';
    }
  };

  const mediaQuery = window.matchMedia('(max-width: 1024px)');
  applyStyles(mediaQuery.matches);
  
  const handler = (e: MediaQueryListEvent) => applyStyles(e.matches);
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}, []);

  const router = useRouter()
  return (
    <div className="w-full min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black antialiased relative">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <div className="relative h-[60vh]">
        <Grainient
          color1="#000000"
          color2="#727272"
          color3="#000000"
          timeSpeed={0.25}
          colorBalance={-0.13}
          warpStrength={1.8}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={1.3}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-black/60 to-black" />
      </div>

      <div className="nav-blur fixed top-0 left-0 w-full z-50 h-[78px]"
       >
        <nav
          className="w-screen h-screen pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Navbar
            isFixed={false}
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials
            displayItemNumbering={true}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#000000"
            changeMenuColorOnOpen={true}
            colors={["#333333", "#000000"]}
            accentColor="#6d6d6d"
            logoContent={
              <h1 className="text-xl tracking-tighter text-white font-medium">
                skillify.
              </h1>
            }
          />
        </nav>
      </div>
      <main className="relative z-10 -mt-[50vh] pb-24">
        {/* HERO SECTION */}
        <SectionShell>
          <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="lg:col-span-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 border border-zinc-800 inline-block px-3 py-1 rounded-full"
              >
                v2.0 // no cap
              </motion.div>

              <WordRevealHeading
                title="Stop getting cooked in interviews."
                className="max-w-xl text-5xl font-medium tracking-tighter text-white sm:text-6xl lg:text-7xl leading-none"
              />

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 max-w-md text-base leading-relaxed text-zinc-400"
              >
                Adaptive assessments that expose your skill gaps, so you
                actually know what to study instead of binge-watching random
                tutorials.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={()=>{
                    router.replace("/test")
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-medium text-black transition-colors duration-200 hover:bg-zinc-200"
                >
                  Take Adaptive Quiz <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={()=>{
                    router.replace("/onboarding/create-roadmap")
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-zinc-800 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-900"
                >
                  Create Roadmap
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-zinc-900 pt-8"
              >
                <ShowcaseLabel title="Target" value="Top Tech" />
                <ShowcaseLabel title="Signal" value="Skill Gaps" />
                <ShowcaseLabel title="Output" value="Curated Path" />
              </motion.div>
            </motion.div>

            {/* HERO BENTO */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.9, ease }}
            >
              <div className="relative overflow-hidden border border-zinc-800 bg-zinc-950/30 p-1 font-mono text-sm">
                <div className="grid gap-px bg-zinc-800 lg:grid-cols-[1.5fr_1fr]">
                  <div className="flex flex-col gap-px bg-zinc-800">
                    <div className="grid grid-cols-2 gap-px">
                      <div className="bg-black p-6">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">
                          Domain
                        </div>
                        <div className="space-y-2">
                          {["frontend", "backend", "fullstack", "ai_ml"].map(
                            (item, idx) => (
                              <div
                                key={item}
                                className={`px-3 py-2 border ${idx === 0 ? "border-white text-white" : "border-zinc-900 text-zinc-500"} flex items-center justify-between`}
                              >
                                <span>{item}</span>
                                {idx === 0 && (
                                  <span className="h-1.5 w-1.5 bg-white rounded-full" />
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="bg-black p-6 flex flex-col justify-between">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">
                          Telemetry
                        </div>
                        <div className="space-y-6">
                          <AnimatedMetric
                            label="React.js"
                            value="92%"
                            bar="92%"
                          />
                          <AnimatedMetric
                            label="Sys Design"
                            value="34%"
                            bar="34%"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-black p-8 relative group min-h-55">
                      <div className="text-[10px] text-white uppercase tracking-widest flex items-center justify-between mb-6">
                        <span>execution/adaptive_quiz</span>
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="h-2 w-2 bg-white"
                        />
                      </div>
                      <p className="text-lg text-zinc-300 font-sans mb-6">
                        What is React reconciliation?
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="border border-zinc-900 p-3 text-zinc-500">
                          A_ DOM mutation strategy
                        </div>
                        <div className="border border-white bg-white/5 p-3 text-white flex justify-between items-center">
                          <span>B_ Diffing old and new trees</span>
                          <span className="text-xs">[SELECTED]</span>
                        </div>
                        <div className="border border-zinc-900 p-3 text-zinc-500">
                          C_ Server-side rendering
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-px bg-zinc-800">
                    <div className="bg-black p-6 h-full">
                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-6">
                        Intelligence Matrix
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: "Level 1_Foundations", status: "PASS" },
                          { label: "Level 2_Framework", status: "PASS" },
                          { label: "Level 3_Architecture", status: "PENDING" },
                        ].map((step, idx) => (
                          <div
                            key={step.label}
                            className="border-b border-zinc-900 pb-3 last:border-0"
                          >
                            <div className="flex justify-between text-[11px] mb-2">
                              <span
                                className={
                                  step.status === "PASS"
                                    ? "text-zinc-300"
                                    : "text-zinc-600"
                                }
                              >
                                {step.label}
                              </span>
                              <span
                                className={
                                  step.status === "PASS"
                                    ? "text-white"
                                    : "text-zinc-600"
                                }
                              >
                                [{step.status}]
                              </span>
                            </div>
                            <div className="h-px bg-zinc-900 w-full">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{
                                  width: step.status === "PASS" ? "100%" : "0%",
                                }}
                                viewport={{ once: false }}
                                transition={{ duration: 1, delay: idx * 0.2 }}
                                className="h-full bg-zinc-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black p-6 h-full">
                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-6">
                        Roadmap Buffer
                      </div>
                      <div className="relative border-l border-zinc-800 pl-4 space-y-6">
                        <div className="relative">
                          <div className="absolute -left-5.25 top-1.5 h-2 w-2 bg-white" />
                          <div className="text-zinc-200">
                            Hooks Internal API
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
                            Priority 1
                          </div>
                        </div>
                        <div className="relative opacity-40">
                          <div className="absolute -left-5.25 top-1.5 h-2 w-2 border border-zinc-500 bg-black" />
                          <div className="text-zinc-200">System Design</div>
                          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
                            Locked
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </SectionShell>

        <ScrollTypography text="You aren't failing because you aren't trying." />

        {/* PROBLEM SECTION */}
        <SectionShell className="py-24 border-t border-zinc-900" id="problem">
          <SectionHeading
            eyebrow="The Lore"
            title="You're catching Ls because the system is broken."
            description="Generic bootcamps waste time, hide blind spots, and leave you studying entirely the wrong tech stack."
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4"
          >
            {problemCards.map((card) => (
              <motion.div
                key={card.title}
                variants={reveal}
                className="border-l border-zinc-800 pl-6 flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-xs text-zinc-600 tracking-widest mb-4">
                    {card.number}
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SectionShell>

        <ScrollTypography text="Skillify fixes the meta." />
        <HorizontalStorySection />

        {/* ADAPTIVE INTELLIGENCE */}
        <SectionShell
          className="pt-32 pb-24 border-t border-zinc-900"
          id="adaptive-intelligence"
        >
          <SectionHeading
            eyebrow="Core Engine"
            title="One correct answer shouldn't waste your time."
            description="The engine tightens or expands depending on what you actually know. If you are breezing through, we escalate the difficulty instantly."
          />
          <div className="mt-16 grid lg:grid-cols-2 gap-px bg-zinc-900 border border-zinc-800">
            <div className="bg-black p-8 sm:p-12">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-8">
                Event Log
              </div>
              <div className="space-y-6">
                <div className="border border-white/10 p-4 bg-zinc-950">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-2">
                    <span>Q_ID: 4892</span>
                    <span className="text-white">STATUS: CORRECT</span>
                  </div>
                  <div className="text-sm text-zinc-300">
                    What is React reconciliation?
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pl-4 border-l border-zinc-800">
                  <span>|</span>
                  <span className="animate-pulse">
                    re-calibrating difficulty...
                  </span>
                </div>
                <div className="border border-white bg-white/5 p-4">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-2">
                    <span className="text-white">Q_ID: 4893 [ESCALATED]</span>
                    <span className="animate-pulse h-1.5 w-1.5 bg-white rounded-full" />
                  </div>
                  <div className="text-sm text-white">
                    Explain how keys affect diffing behavior in lists and the
                    specific bug unstable keys cause.
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black p-8 sm:p-12 flex flex-col justify-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-6">
                Outcome
              </div>
              <h3 className="text-3xl font-medium text-white mb-8 tracking-tighter">
                Pure progression. No static quizzes.
              </h3>
              <div className="space-y-1">
                {[
                  {
                    trigger: "Correct Answer",
                    action: "Unlock deep-dive question",
                  },
                  {
                    trigger: "Partial Answer",
                    action: "Follow-up on missing concept",
                  },
                  {
                    trigger: "Wrong Answer",
                    action: "Drop to foundational checks",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between border-b border-zinc-900 py-4 text-sm"
                  >
                    <span className="text-white font-medium">
                      {item.trigger}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500 text-right">
                      {item.action}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        {/* SKILL GAPS */}
        <SectionShell className="pt-24 sm:pt-32 border-t border-zinc-900">
          <SectionHeading
            eyebrow="Telemetry"
            title="A dashboard that tells the brutal truth."
            description="We aren't here to inflate your ego. We are here to expose your weak spots fast and give you the exact docs to close the gap."
          />
          <div className="mt-16 grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-7 space-y-12">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-900 pb-2">
                  Analysis Results
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <AnimatedMetric label="React.js" value="90%" bar="90%" />
                  <AnimatedMetric label="Node.js" value="75%" bar="75%" />
                  <AnimatedMetric label="System Design" value="30%" bar="30%" />
                  <AnimatedMetric
                    label="Auth Protocols"
                    value="40%"
                    bar="40%"
                  />
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-900 pb-2">
                  Generated Actions
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "React Server Components Deep Dive",
                    "System Design: Trade-offs",
                    "OAuth2 & JWT Architecture",
                  ].map((title) => (
                    <div
                      key={title}
                      className="border border-zinc-800 p-4 hover:bg-zinc-950 transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-white">
                          {title}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="mt-4 font-mono text-[10px] text-zinc-500 uppercase">
                        Curated Target
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="text-3xl font-medium text-white mb-8 tracking-tighter">
                Clear steps. Zero noise.
              </h3>
              <div className="space-y-4">
                {[
                  "Spot the exact tech you are failing at",
                  "Get resources mapped to your level",
                  "Skip topics you already mastered",
                  "Track your comeback arc",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 border border-zinc-800 p-4 text-sm text-zinc-300"
                  >
                    <div className="h-1.5 w-1.5 bg-white" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <ScrollTypography text="Stop wandering. Lock in your roadmap." />

        {/* ROADMAPS */}
        <SectionShell
          className="pt-24 sm:pt-32 border-t border-zinc-900"
          id="roadmaps"
        >
          <SectionHeading
            eyebrow="Dynamic Pathing"
            title="The roadmap adapts to you."
            description="You aren't missing the drive to learn. You are just learning the wrong things in the wrong order. We fix that sequence."
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {roadmapCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={reveal}
                className="border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-600 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-mono text-[10px] text-zinc-500 mb-4 tracking-widest">
                    TARGET_{index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400">{card.subtitle}</p>
                </div>
                <div className="mt-8 font-mono text-xs text-white border-t border-zinc-900 pt-4 flex items-center justify-between">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SectionShell>

        {/* COMPARISON */}
        <SectionShell className="pt-32 pb-32 border-t border-zinc-900">
          <div className="grid lg:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
            <div className="bg-[#050505] p-10 sm:p-16">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-10">
                The Old Meta
              </div>
              <div className="space-y-6 text-sm text-zinc-500">
                {[
                  "Random, disconnected tutorials",
                  "Generic advice from influencers",
                  "Zero actual feedback loops",
                  "Guessing what to build next",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="text-zinc-700">⨯</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black p-10 sm:p-16">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white mb-10">
                The New Meta
              </div>
              <div className="space-y-6 text-sm text-zinc-200 font-medium">
                {[
                  "Real-time adaptive tech screens",
                  "Highly personalized developer roadmaps",
                  "Brutal skill gap reality checks",
                  "Targeted docs to actually level up",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-white h-1.5 w-1.5 bg-white rounded-sm" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        {/* TESTIMONIALS */}
        <SectionShell className="pt-24 border-t border-zinc-900">
          <SectionHeading
            eyebrow="Logs"
            title="Verified telemetry from actual students."
            description="Reactions from people who finally stopped guessing and started making real moves."
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="mt-16 grid gap-12 lg:grid-cols-3"
          >
            {[
              {
                name: "Aman",
                role: "3rd-year CS student",
                text: "I was stuck in tutorial hell for months and still getting cooked on basic questions. This quiz gave me a reality check in 10 minutes.",
              },
              {
                name: "Riya",
                role: "Internship seeker",
                text: "The roadmap is an absolute W. I finally stopped side-questing and followed a path that actually makes sense.",
              },
              {
                name: "Kabir",
                role: "Self-taught developer",
                text: "The feedback was brutal but lowkey exactly what I needed. Locked in on my weak spots and finally secured the bag.",
              },
            ].map((item) => (
              <motion.div
                key={item.name}
                variants={reveal}
                className="border-t border-zinc-900 pt-6"
              >
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
                  Log // {item.name}
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  &quot;{item.text}&quot;
                </p>
                <div className="mt-6 text-xs text-zinc-600">{item.role}</div>
              </motion.div>
            ))}
          </motion.div>
        </SectionShell>

        {/* FINAL CTA */}
        <SectionShell className="pt-40 relative z-20">
          <div className="border border-zinc-800 bg-zinc-950/50 p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
              Initialize sequence
            </div>
            <WordRevealHeading
              title="Lock in your developer arc."
              className="mt-6 text-4xl font-medium tracking-tighter text-white sm:text-6xl"
              center
            />
            <p className="mt-6 max-w-xl mx-auto text-base text-zinc-400">
              Stop wasting time on irrelevant side quests. Get your custom
              roadmap and start making actual progress.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#adaptive-quiz"
                className="inline-flex items-center justify-center bg-white px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Take Adaptive Quiz
              </a>
              <a
                href="#roadmaps"
                className="inline-flex items-center justify-center border border-zinc-800 bg-black px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
              >
                Create Roadmap
              </a>
            </div>
          </div>
        </SectionShell>
      </main>
    </div>
  );
}

export default Page;
