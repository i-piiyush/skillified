"use client";

import { motion,} from "framer-motion";
import { 
  TerminalSquare, 
  Code2, 
  Cpu, 
  Workflow, 
  Zap, 
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SectionShell, WordRevealHeading } from "@/components/ui/Landing-components";


export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-32 space-y-32">
        
        {/* Header / Intro */}
        <SectionShell>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-8">
              <TerminalSquare size={16} className="text-zinc-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                system // about_protocol
              </span>
            </div>
            <WordRevealHeading
              title="We are patching the education meta."
              className="text-5xl font-medium tracking-tighter text-white sm:text-7xl leading-tight mb-8"
            />
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-zinc-400 leading-relaxed font-sans"
            >
              The current tech pipeline is broken. You watch a 10-hour tutorial, build a generic clone, and then catch massive Ls in the technical screen because nobody told you how to handle actual engineering problems. Skillify was built to execute a hard reset on this cycle.
            </motion.p>
          </div>
        </SectionShell>

        {/* Chapter 1: The Manifesto */}
        <SectionShell>
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
            <div className="sticky top-32">
              <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-4">
                01 // The Manifesto
              </div>
              <h2 className="text-3xl font-medium text-white tracking-tighter">
                Tutorial hell is a trap.
              </h2>
            </div>
            
            <div className="space-y-8 font-sans text-zinc-400 leading-relaxed">
              <p>
                Most developers aren&apos;t failing because they lack the drive. They are failing because the system is designed around consumption, not execution. You are handed a static checklist of tools to learn, but zero context on what the industry actually demands.
              </p>
              <p>
                Recruiters are ghosting candidates not because of a bad resume, but because of a weak underlying foundation. When the technical round hits, the gaps in system design, core platform knowledge, and deep framework mechanics are instantly exposed.
              </p>
              <div className="border-l border-zinc-800 pl-6 my-10 py-2">
                <p className="text-lg text-zinc-200 font-medium">
                  &quot;Stop guessing what companies want. We built an engine that tells you the brutal truth about your skill tree.&quot;
                </p>
              </div>
              <p>
                Skillify cuts the noise. No generic advice. No fluff. Just raw telemetry on your vulnerabilities and a custom blueprint to secure the bag.
              </p>
            </div>
          </div>
        </SectionShell>

        {/* Chapter 2: The Origin Story */}
        <SectionShell>
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
            <div className="sticky top-32">
              <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-4">
                02 // The Origin
              </div>
              <h2 className="text-3xl font-medium text-white tracking-tighter">
                Built by developers, for developers.
              </h2>
            </div>
            
            <div className="space-y-8 font-sans text-zinc-400 leading-relaxed">
              <p>
                Skillify didn&apos;t spawn in a corporate boardroom. It was engineered out of pure necessity during a BCA program. Piyush Chhabra, a full-stack developer pushing the limits of modern web architecture, saw exactly where the traditional academic path fell short. 
              </p>
              <p>
                While building out highly technical e-commerce platforms using Next.js, TypeScript, and Prisma, the contrast became obvious: students were being taught outdated concepts and then sent into the wild to beg for internships. The standard approach was a massive L.
              </p>
              <div className="border border-zinc-800 bg-[#050505] p-6 rounded-sm my-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-500/30 to-transparent" />
                <h3 className="font-mono text-xs text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-zinc-400" />
                  The Paradigm Shift
                </h3>
                <p className="text-sm">
                  The goal shifted from &quot;asking for opportunities&quot; to &quot;operating as a high-value asset.&ldquo; Skillify was built in public, engineered to be the exact tool needed to bridge the gap between being a student and executing as a top-tier engineer.
                </p>
              </div>
              <p>
                If you want to crack modern tech, you need modern infrastructure. Skillify is the manifestation of that mindset.
              </p>
            </div>
          </div>
        </SectionShell>

        {/* Chapter 3: The Architecture */}
        <SectionShell>
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
            <div className="sticky top-32">
              <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-4">
                03 // The Architecture
              </div>
              <h2 className="text-3xl font-medium text-white tracking-tighter">
                Under the hood.
              </h2>
            </div>
            
            <div className="space-y-12">
              <p className="font-sans text-zinc-400 leading-relaxed">
                This isn&apos;t just a basic CRUD app wrapping a generic quiz. It is a highly optimized execution environment designed to adapt to your inputs in milliseconds. Here is how the protocol operates:
              </p>

              <div className="grid gap-6">
                
                {/* Node 1 */}
                <div className="border border-zinc-800 bg-[#050505] p-6 rounded-sm group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm">
                      <Cpu size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Adaptive Diagnostic Engine</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed font-sans">
                    The frontend interface continuously syncs your real-time responses. Answer correctly, and we instantly escalate the difficulty node to test your actual depth. Fumble, and we drop down to verify your foundational layers.
                  </p>
                </div>

                {/* Node 2 */}
                <div className="border border-zinc-800 bg-[#050505] p-6 rounded-sm group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm">
                      <Workflow size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-white">N8N Telemetry Sync</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed font-sans">
                    Once the diagnostic terminates, your vulnerability data is piped through our N8N automation layer. We analyze the exact skills you missed and compile a structured, JSON-ready payload to generate your roadmap.
                  </p>
                </div>

                {/* Node 3 */}
                <div className="border border-zinc-800 bg-[#050505] p-6 rounded-sm group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-sm">
                      <Code2 size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Dynamic Pathing Generation</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed font-sans">
                    The engine outputs a strict execution thread. It splits your required learning into Practical, DSA, and System Design nodes, explicitly highlighting what to focus on and what to avoid (zero fluff).
                  </p>
                </div>

              </div>
            </div>
          </div>
        </SectionShell>

        {/* Final CTA */}
        <SectionShell className="pt-16">
          <div className="border border-zinc-800 bg-zinc-950/50 p-12 lg:p-20 text-center relative overflow-hidden rounded-md">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
              [SYS_END]
            </div>
            
            <WordRevealHeading
              title="Stop reading. Start executing."
              className="mt-6 text-4xl font-medium tracking-tighter text-white sm:text-6xl"
              center
            />
            
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => router.push('/signup')}
                className="h-12 px-8 bg-white text-black cursor-pointer hover:bg-zinc-200 font-medium transition-colors"
              >
                Initialize Profile
              </Button>
              
            </div>
          </div>
        </SectionShell>

      </main>
    </div>
  );
}