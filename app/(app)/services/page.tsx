"use client";

import type { ComponentType } from "react";

import { motion } from "framer-motion";
import { TerminalSquare} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SectionShell,
  WordRevealHeading,
} from "@/components/ui/Landing-components";
import { ARCHITECTURE_LAYERS, PROTOCOLS } from "@/config/landing-data";

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-32 space-y-32">
        {/* Header Section */}
        <SectionShell>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-8">
              <TerminalSquare size={16} className="text-zinc-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                system // core_protocols
              </span>
            </div>

            <WordRevealHeading
              title="System Capabilities."
              className="text-5xl font-medium tracking-tighter text-white sm:text-7xl leading-tight mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-zinc-400 leading-relaxed font-sans max-w-2xl"
            >
              Skillify operates on three core engines designed to extract your
              weak points, compile a recovery path, and output actionable data.
              We don&apos;t do generic tutorials.
            </motion.p>
          </div>
        </SectionShell>

        {/* Core Protocols Grid */}
        <SectionShell>
          <div className="grid lg:grid-cols-3 gap-6">
            {PROTOCOLS.map((protocol, idx) => {
              const Icon = protocol.icon as ComponentType<{
                size?: number;
                className?: string;
              }>;
              return (
                <motion.div
                  key={protocol.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border border-zinc-800 bg-[#050505] rounded-sm p-8 flex flex-col justify-between group hover:border-zinc-600 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="h-10 w-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center rounded-sm">
                        <Icon
                          size={16}
                          className="text-zinc-400 group-hover:text-white transition-colors"
                        />
                      </div>
                      <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                        {protocol.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium text-white tracking-tight mb-4">
                      {protocol.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                      {protocol.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-900 pt-6">
                    <div className="flex flex-wrap gap-2">
                      {protocol.metrics.map((metric) => (
                        <span
                          key={metric}
                          className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 bg-zinc-900/50 border border-zinc-800 px-2 py-1 rounded-sm"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionShell>

        {/* Technical Architecture Pipeline */}
        <SectionShell>
          <div className="border border-zinc-800 bg-[#050505] p-8 md:p-12 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-500/30 to-transparent" />

            <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-center">
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
                  The Pipeline
                </h2>
                <h3 className="text-3xl font-medium text-white tracking-tighter mb-6">
                  How the stack compiles.
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  Your inputs pass through a strict architecture. We capture
                  your diagnostic telemetry, push it through an N8N automation
                  layer to generate custom nodes, and sync it back to your
                  dashboard in real-time.
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-white hover:bg-white hover:text-black  h-11 px-6 transition-all"
                >
                  Initialize Setup
                </Button>
              </div>

              {/* Wireframe Diagram */}
              <div className="relative border border-zinc-900 bg-black p-6 rounded-sm space-y-4">
                {ARCHITECTURE_LAYERS.map((layer, index) => {
                  const LayerIcon = layer.icon;
                  return (
                    <motion.div
                      key={layer.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-900/30 rounded-sm relative"
                    >
                      <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        <LayerIcon size={14} className="text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                          Layer 0{index + 1}
                        </div>
                        <div className="text-sm font-medium text-zinc-200">
                          {layer.name}{" "}
                          <span className="text-zinc-600 font-mono text-[10px] ml-2">
                            `// `{layer.tech}
                          </span>
                        </div>
                      </div>

                      {/* Connecting line to the next block (except last one) */}
                      {index < ARCHITECTURE_LAYERS.length - 1 && (
                        <div className="absolute -bottom-4 left-8 w-px h-4 bg-zinc-800" />
                      )}
                    </motion.div>
                  );
                })}
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
              title="Ready to run the protocol?"
              className="mt-6 text-4xl font-medium tracking-tighter text-white sm:text-5xl"
              center
            />

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => router.push("/signup")}
                className="h-12 px-8 bg-white text-black hover:bg-zinc-200  font-medium transition-colors"
              >
                Create Account
              </Button>
            
            </div>
          </div>
        </SectionShell>
      </main>
    </div>
  );
}
