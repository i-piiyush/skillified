"use client";

import { authClient } from "@/lib/auth-client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Video,
  BookOpen,
  RefreshCcw,
  AlertCircle,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  TerminalSquare,
  Map,
  Activity,
  CheckCircle2,
} from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { WeakTopic } from "@/types/weakTopic";
import Loader from "@/components/ui/Loader";

const formatTopicLabel = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const SkeletonLog = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="border border-zinc-800 bg-[#050505] p-5 space-y-4 rounded-md"
  >
    <div className="space-y-3">
      <div className="h-5 w-1/3 bg-zinc-900 animate-pulse rounded-sm" />
      <div className="h-3 w-full bg-zinc-900 animate-pulse rounded-sm" />
      <div className="h-3 w-4/5 bg-zinc-900 animate-pulse rounded-sm" />
    </div>
  </motion.div>
);

const TopicCard = ({ topic, delay }: { topic: WeakTopic; delay: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const resource = topic.topResource;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="border border-zinc-800 bg-[#050505] overflow-hidden transition-colors hover:border-zinc-700 rounded-md"
    >
      <div
        className="p-5 cursor-pointer flex flex-col gap-3 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded-sm border border-red-400/20">
              Vulnerability
            </span>
            <h3 className="text-base font-medium text-zinc-200 tracking-tight group-hover:text-white transition-colors">
              {formatTopicLabel(topic.topic)}
            </h3>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-zinc-600 mt-0.5 shrink-0"
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
        <p className="text-sm font-sans text-zinc-500 leading-relaxed pl-1">
          {topic.whyYouNeedToStudyThis}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && resource && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-zinc-900 bg-black"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {resource.type.toLowerCase() === "video" ? (
                  <Video size={14} className="text-zinc-400" />
                ) : (
                  <BookOpen size={14} className="text-zinc-400" />
                )}
                <span>Target Resource // {resource.source}</span>
              </div>

              <div className="space-y-2 border-l border-zinc-800 pl-4">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  {resource.title}
                  <ExternalLink
                    size={14}
                    className="mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </a>
                <p className="text-xs text-zinc-600 font-mono">
                  {resource.whyChosen.toLowerCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function DashboardPage() {
  const aiEnabled = process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === "true";
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  // States for Polling & N8N Webhook
  type SyncStatus =
    | "LOADING"
    | "PROCESSING"
    | "COMPLETED"
    | "NO_SESSION"
    | "ERROR";
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("LOADING");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true); // Controls the useEffect interval

  const { data: session, isPending } = authClient.useSession();

  const userName = session?.user?.name ?? "";
  const userEmail = session?.user?.email ?? "";
  const userAlias = userName.split(" ")[0].toLowerCase() || "user";

  // 1. Fetch Final Topics
  const fetchWeakTopics = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await axios.get(`/api/get-weak-topics/${session.user.id}`);
      setWeakTopics(res.data?.weakTopics ?? []);
      setSyncStatus("COMPLETED");
    } catch (err) {
      console.error(err);
      setSyncStatus("ERROR");
    }
  };

  // 2. Main Polling Loagic
  useEffect(() => {
    if (isPending || !session?.user.id || !isPolling) return;

    const poll = async () => {
      try {
        const userId = session?.session?.userId || session?.user.id;
        const res = await axios.get(`/api/latest-test-session/${userId}`);

        const currentStatus = res.data.status;
        console.log("current status: ", currentStatus);
        setCurrentSessionId(res.data.sessionId); // Save ID for the webhook payload

        if (currentStatus === "COMPLETED") {
          fetchWeakTopics();
          setIsPolling(false);
        } else if (currentStatus === "FAILED") {
          setSyncStatus("ERROR");
          setIsPolling(false); // Stop polling on error to show retry button
        } else if (currentStatus === "NOT_STARTED") {
          setSyncStatus("NO_SESSION");
          setIsPolling(false);
        } else {
          setSyncStatus("PROCESSING");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setSyncStatus("NO_SESSION");
          setIsPolling(false);
        } else {
          setSyncStatus("ERROR");
          setIsPolling(false);
        }
      }
    };

    const interval = setInterval(poll, 3000);
    poll(); // Trigger instantly

    return () => clearInterval(interval);
  }, [isPending, session, isPolling]);

  const handleRetrySync = async () => {
    // 1. Instantly change UI to loading skeletons
    setSyncStatus("PROCESSING");

    try {
      const user_id = session?.user?.id;
      if (!user_id) throw new Error("User session not found.");
      if (!currentSessionId) throw new Error("No session ID found to retry.");

      const userRes = await axios.get(`/api/fetch-user/${user_id}`);
      const fetchedUser = userRes.data?.user;

      if (!fetchedUser) throw new Error("User profile could not be loaded.");

      const payload = {
        stack: fetchedUser.stack,
        weakTopics: fetchedUser.weakTopicNames,
        role: fetchedUser.role,
        user_id: fetchedUser.id,
        sessionId: currentSessionId,
      };

      await axios.post("/api/n8n/hit-n8n", payload);

      setIsPolling(true);
    } catch (error) {
      console.error("[Dashboard] Error in handleRetrySync:", error);
      setSyncStatus("ERROR"); // Revert UI if our own API fails
    }
  };
  if (isPending) return <Loader />;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_40%)]" />
      </div>

      <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-medium tracking-tight text-white flex items-center gap-2">
            <TerminalSquare size={18} className="text-zinc-500" />
            skillify // terminal
          </div>

          <div className="relative z-50">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center justify-center h-8 w-8 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <User size={14} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-[#050505] border border-zinc-800 shadow-2xl rounded-md overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-zinc-900">
                    <p className="text-sm font-medium text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono truncate">
                      {userEmail}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        authClient.signOut();
                        router.replace("/login");
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-sm text-red-400 hover:bg-zinc-900 transition-colors font-mono uppercase tracking-widest text-[10px]"
                    >
                      <LogOut size={12} /> Terminate Session
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-8">
        <div className="lg:col-span-8 space-y-8">
          <header className="space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              System Status: Online
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tighter">
              Welcome back, {userAlias}.
            </h1>
            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              Below are the structural vulnerabilities detected during your
              diagnostic runs.
            </p>
          </header>

          <div className="pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Telemetry // Logs
              </h2>
              <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
                {syncStatus === "LOADING" || syncStatus === "PROCESSING"
                  ? "SYNCING..."
                  : `${weakTopics.length} RECORDS`}
              </span>
            </div>

            <div className="space-y-3">
              {/* STATE 1: LOADING OR PROCESSING */}
              {syncStatus === "LOADING" || syncStatus === "PROCESSING" ? (
                <>
                  {syncStatus === "PROCESSING" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4 border border-blue-900/50 bg-blue-950/10 p-4 rounded-md flex items-center gap-3"
                    >
                      <RefreshCcw
                        className="text-blue-500 animate-spin"
                        size={16}
                      />
                      <p className="text-sm text-blue-400 font-mono tracking-tight">
                        Analyzing your answers... your topics are cooking.
                      </p>
                    </motion.div>
                  )}
                  <SkeletonLog delay={0} />
                  <SkeletonLog delay={0.1} />
                  <SkeletonLog delay={0.2} />
                </>
              ) : /* STATE 2: NO SESSION */
              syncStatus === "NO_SESSION" ? (
                <div className="border border-zinc-800 bg-[#050505] p-12 rounded-md text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                    <Activity className="h-5 w-5 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white tracking-tight">
                    Unknown Variables Detected
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto mb-6">
                    Take a diagnostic test to know your real level and populate
                    your telemetry logs.
                  </p>
                  <Button
                    onClick={() => router.push("/test")}
                    disabled={!aiEnabled}
                    className="bg-white text-black hover:bg-zinc-200 rounded-sm h-9 px-6 font-medium disabled:bg-zinc-800 disabled:text-zinc-400 disabled:border disabled:border-zinc-700 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 disabled:opacity-60"
                  >
                    Take a Test
                  </Button>
                </div>
              ) : /* STATE 3: ERROR (Connected with handleRetrySync) */
              syncStatus === "ERROR" ? (
                <div className="border border-red-900/50 bg-red-950/10 p-8 rounded-md text-center space-y-4">
                  <AlertCircle className="mx-auto text-red-500" size={24} />
                  <div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Sync Failure
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Unable to pull telemetry data. The pipeline might have
                      crashed.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRetrySync}
                    className="mt-2 bg-transparent border-zinc-800 text-white  rounded-sm h-9"
                  >
                    <RefreshCcw size={14} className="mr-2" />
                    Force Retry
                  </Button>
                </div>
              ) : /* STATE 4: COMPLETED + NO WEAK TOPICS */
              syncStatus === "COMPLETED" && weakTopics.length === 0 ? (
                <div className="border border-green-900/30 bg-[#050505] p-12 rounded-md text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-green-400 tracking-tight">
                    You killed it!
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                    You don&apos;t have any weak topics available. Your structural
                    integrity is at 100%.
                  </p>
                </div>
              ) : (
                /* STATE 5: COMPLETED + DATA */
                weakTopics.map((topic, i) => (
                  <TopicCard key={topic.id} topic={topic} delay={i * 0.05} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
                Execution // Commands
              </h2>
              <div className="border border-zinc-800 bg-[#050505] p-6 rounded-md space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Activity size={14} className="text-zinc-400" />
                      Adaptive Diagnostic
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      Take or retake the assessment to calibrate your skill gaps
                      in real-time. Unlimited runs allowed.
                    </p>
                  </div>
                  <Button
                    disabled={!aiEnabled}
                    onClick={() => router.push("/test")}
                    variant="outline"
                    title={
                      !aiEnabled ? "AI features are currently disabled" : ""
                    }
                    className="
    w-full justify-start h-10
    bg-transparent border-zinc-800
    text-white hover:bg-white hover:text-black
    rounded-sm transition-all

    disabled:bg-zinc-900
    disabled:text-zinc-500
    disabled:border-zinc-800
    disabled:cursor-not-allowed
    disabled:opacity-50
    disabled:hover:bg-zinc-900
    disabled:hover:text-zinc-500
  "
                  >
                    <RotateCcw size={14} className="mr-2" />
                    Run Diagnostic
                  </Button>
                </div>

                <div className="h-px bg-zinc-900 w-full" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Map size={14} className="text-zinc-400" />
                      Pathing Engine
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      Generate a new progression sequence from scratch or view
                      your currently active roadmap.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => router.push("/onboarding/create-roadmap")}
                      className="w-full justify-start h-10 bg-white text-black hover:bg-zinc-200 rounded-sm transition-all"
                    >
                      <TerminalSquare size={14} className="mr-2" />
                      Initialize Roadmap
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard/roadmap")}
                      variant="ghost"
                      className="w-full justify-start h-10 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-sm transition-all"
                    >
                      View Active Path &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#050505] p-4 rounded-md">
              <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                <span>Account Tier</span>
                <span className="text-zinc-300">Standard</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
