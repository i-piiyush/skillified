"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TerminalSquare, 
  Clock, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  Code2, 
  BrainCircuit, 
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Shadcn UI (Optional: Button if you want to use it for CTAs)
import { Button } from "@/components/ui/button";
import { Roadmap, TopicType } from "@/types/frontendRoadmap";
import Loader from "@/components/ui/Loader";

// ─── Types matching your Prisma Schema ───────────────────────────────────────

// ─── Helper Components ────────────────────────────────────────────────────────

const DepthIndicator = ({ depth }: { depth: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((level) => (
      <div 
        key={level} 
        className={`h-1.5 w-3 rounded-sm ${level <= depth ? "bg-white" : "bg-zinc-800"}`} 
      />
    ))}
  </div>
);

const TypeIcon = ({ type }: { type: TopicType }) => {
  switch (type) {
    case "PRACTICAL": return <Code2 size={14} className="text-blue-400" />;
    case "DSA": return <BrainCircuit size={14} className="text-green-400" />;
    case "SYSTEM_DESIGN": return <Layers size={14} className="text-purple-400" />;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const fetchRoadmap = async () => {
      const userId = session?.user?.id;
      if (!userId) {
        setError("Unauthorized. Please authenticate.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/roadmap/fetch-roadmap/${userId}`);
        if (res.data.roadmap) {
          setRoadmap(res.data.roadmap);
        }
        
        else {
          setRoadmap(null); // No roadmap generated yet
        }
      } catch (err: any) {
        console.error("Error fetching roadmap:", err);

        if (err?.response?.status === 404) {
          setError(err.response?.data?.message || "Roadmap not found.");
        } else {
          setError("Failed to pull roadmap telemetry.");
        }

      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [isPending, session]);

  // ─── Render States ───

  if (loading || isPending) {
    return (
     <Loader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="border border-red-900/50 bg-[#050505] p-8 rounded-md text-center max-w-md w-full shadow-2xl">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">Connection Severed</h2>
          <p className="text-xs font-mono text-zinc-500 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full border-zinc-800 bg-transparent text-white  rounded-sm"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (!roadmap || !roadmap.topics || roadmap.topics.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="border border-zinc-800 bg-[#050505] p-10 rounded-md text-center max-w-md w-full shadow-2xl">
          <GitBranch className="w-10 h-10 text-zinc-600 mx-auto mb-6" />
          <h2 className="text-2xl font-medium text-white mb-3 tracking-tight">No Active Arc</h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            You haven&apos;t generated a progression path yet. Initialize the onboard protocol to map out your journey.
          </p>
          <Button 
            onClick={() => router.push('/onboard/create-roadmap')}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-sm h-11 font-medium transition-colors"
          >
            Initialize Roadmap
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Roadmap Render ───

  const totalWeight = roadmap.practicalWeight + roadmap.dsaWeight + roadmap.systemDesignWeight;
  const pPct = (roadmap.practicalWeight / totalWeight) * 100;
  const dPct = (roadmap.dsaWeight / totalWeight) * 100;
  const sPct = (roadmap.systemDesignWeight / totalWeight) * 100;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.02),transparent_50%)]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-6">
            <TerminalSquare size={16} className="text-zinc-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Execution Thread // Active
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tighter mb-4">
                Your Blueprint.
              </h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
                <Clock size={14} className="text-zinc-500" />
                <span>ETA: {roadmap.estimatedMonths} Months to target</span>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                <span>Weighting</span>
                <span>100%</span>
              </div>
              <div className="h-2 w-full flex rounded-sm overflow-hidden bg-zinc-900">
                <div style={{ width: `${pPct}%` }} className="bg-blue-500/50" title={`Practical: ${pPct.toFixed(0)}%`} />
                <div style={{ width: `${dPct}%` }} className="bg-green-500/50" title={`DSA: ${dPct.toFixed(0)}%`} />
                <div style={{ width: `${sPct}%` }} className="bg-purple-500/50" title={`System Design: ${sPct.toFixed(0)}%`} />
              </div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                <span className="text-blue-400">Prac</span>
                <span className="text-green-400">DSA</span>
                <span className="text-purple-400">Sys</span>
              </div>
            </div>
          </div>
        </header>

        {/* Timeline / Nodes */}
        <div className="relative border-l border-zinc-900 ml-3 md:ml-4 space-y-12 pb-24">
          <AnimatePresence>
            {roadmap.topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline Connector */}
                <div className="absolute -left-px top-6 w-8 md:w-12 h-px bg-zinc-900" />
                <div className="absolute -left-1.25 top-5 w-2.5 h-2.5 rounded-full border-2 border-black bg-zinc-600" />

                {/* Node Card */}
                <div className="border border-zinc-800 bg-[#050505] rounded-md p-6 sm:p-8 hover:border-zinc-700 transition-colors">
                  
                  {/* Node Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                        <TypeIcon type={topic.type} />
                        <span>{topic.type} Node // {index + 1}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                        {topic.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/50 px-2.5 py-1 rounded-sm border border-zinc-800">
                        <Clock size={12} /> {topic.focusedHours} hrs
                      </div>
                      <DepthIndicator depth={topic.depth} />
                    </div>
                  </div>

                  {/* Core Content Grid */}
                  <div className="grid sm:grid-cols-2 gap-8">
                    
                    {/* Focus Array (Do this) */}
                    {topic.focus && topic.focus.length > 0 && (
                      <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-green-400 mb-4 flex items-center gap-2">
                          <CheckCircle2 size={12} /> Core Focus
                        </h4>
                        <ul className="space-y-3">
                          {topic.focus.map((item, i) => (
                            <li key={i} className="text-sm text-zinc-300 leading-relaxed flex items-start gap-2">
                              <span className="text-green-500/50 mt-0.5">&gt;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Avoid Array (Don't do this / No Fluff) */}
                    {topic.avoid && topic.avoid.length > 0 && (
                      <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                          <XCircle size={12} /> Skip (No Fluff)
                        </h4>
                        <ul className="space-y-3">
                          {topic.avoid.map((item, i) => (
                            <li key={i} className="text-sm text-zinc-500 leading-relaxed flex items-start gap-2">
                              <span className="text-red-500/50 mt-0.5">⨯</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>

                  {/* Supplemental Metrics (Projects / LeetCode) */}
                  {(topic.projects.length > 0 || topic.easyQuestions || topic.mediumQuestions) && (
                    <div className="mt-8 pt-6 border-t border-zinc-900/50">
                      <div className="flex flex-wrap gap-4">
                        
                        {/* Projects Array */}
                        {topic.projects.length > 0 && (
                          <div className="flex-1 min-w-50">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-3">Output Requirement</span>
                            <div className="flex flex-wrap gap-2">
                              {topic.projects.map((proj, i) => (
                                <span key={i} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm text-zinc-300">
                                  {proj}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Questions count */}
                        {(topic.easyQuestions || topic.mediumQuestions) && (
                          <div className="flex gap-4">
                            {topic.easyQuestions && (
                              <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Easy</span>
                                <span className="text-lg font-mono text-white">{topic.easyQuestions}</span>
                              </div>
                            )}
                            {topic.mediumQuestions && (
                              <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Medium</span>
                                <span className="text-lg font-mono text-white">{topic.mediumQuestions}</span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* End of timeline indicator */}
          <div className="absolute -left-1.25 bottom-0 w-2.5 h-2.5 rounded-full border-2 border-black bg-white" />
        </div>

        {/* Completion Message */}
        <div className="text-center border border-zinc-800 bg-[#050505] p-8 rounded-md shadow-xl mt-8">
          <h3 className="text-xl font-medium text-white tracking-tight mb-2">End of Sequence</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Execute this path. Don&apos;t side-quest. If you get stuck, run a diagnostic to find your weak spots.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="bg-transparent border-zinc-800 text-white  rounded-sm"
          >
            Return to Command Center
          </Button>
        </div>

      </div>
    </div>
  );
}