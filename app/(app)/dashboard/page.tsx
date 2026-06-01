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
  Map, 
  RotateCcw,
  ExternalLink
} from "lucide-react";

// Types matching your Prisma Schema
type TopResource = {
  id: string;
  type: string;
  title: string;
  url: string;
  source: string;
  whyChosen: string;
  weakTopicId: string;
};

type WeakTopic = {
  id: string;
  topic: string;
  whyYouNeedToStudyThis: string;
  createdAt: string;
  userId: string;
  topResource?: TopResource;
};

const formatTopicLabel = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="rounded-2xl border border-[#E5E4E0] bg-[#F7F6F3] p-6 space-y-4"
  >
    <div className="space-y-3">
      <div className="h-6 w-3/4 rounded bg-[#E5E4E0] animate-pulse" />
      <div className="h-4 w-full rounded bg-[#E5E4E0] animate-pulse" />
      <div className="h-4 w-4/5 rounded bg-[#E5E4E0] animate-pulse" />
    </div>
  </motion.div>
);

const TopicCard = ({ topic, delay }: { topic: WeakTopic; delay: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const resource = topic.topResource;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl border border-[#E5E4E0] bg-[#F7F6F3] overflow-hidden transition-all hover:border-[#D1CEC7]"
    >
      <div 
        className="p-6 cursor-pointer flex flex-col gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-serif text-neutral-900 tracking-tight leading-snug">
            {formatTopicLabel(topic.topic)}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-neutral-400 mt-1 shrink-0"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
        <p className="text-sm font-sans text-neutral-600 leading-relaxed">
          {topic.whyYouNeedToStudyThis}
        </p>
      </div>

      <AnimatePresence>
        {isOpen && resource && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#E5E4E0] bg-[#FDFDFC]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-chestnut)]">
                {resource.type.toLowerCase() === "video" ? (
                  <Video size={14} />
                ) : (
                  <BookOpen size={14} />
                )}
                <span>curated drop: {resource.source}</span>
              </div>
              
              <div className="space-y-3 font-sans">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group flex items-start gap-2 text-base font-medium text-neutral-900 hover:text-[var(--color-chestnut)] transition-colors"
                >
                  {resource.title}
                  <ExternalLink size={16} className="mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
                <p className="text-sm text-neutral-500 italic">
                  "{resource.whyChosen}"
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
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const { data: session, isPending } = authClient.useSession();

  const userName = session?.user?.name ?? "";
  const userEmail = session?.user?.email ?? "";
  
  const fetchWeakTopics = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const res = await axios.get(`/api/get-weak-topics/${session.user.id}`);
      setWeakTopics(res.data?.weakTopics ?? []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) fetchWeakTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#E5E4E0]">
      
      {/* Section 1: Header / Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E4E0]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-900">
            skillify.
          </div>

          <div className="relative z-50">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <div className="h-9 w-9 rounded-full bg-[#1A1918] flex items-center justify-center text-white">
                <User size={16} />
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-64 bg-white border border-[#E5E4E0] shadow-xl rounded-2xl overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-[#E5E4E0]">
                    <p className="text-sm font-bold text-neutral-900 truncate">{userName}</p>
                    <p className="text-xs font-medium text-neutral-500 mt-1 truncate">{userEmail}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => authClient.signOut()}
                      className="w-full flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-xl text-[var(--color-chestnut)] hover:bg-[#F7F6F3] transition-colors font-semibold uppercase tracking-wider text-[10px]"
                    >
                      <LogOut size={14} />
                      bail out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Hero */}
        <header className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-chestnut)]">
            dashboard — overview
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-neutral-900 tracking-tight">
            time to lock in, {userName.split(" ")[0].toLowerCase()}.
          </h1>
          <p className="text-base text-neutral-500 font-sans max-w-md">
            the backend cooked. here are the concepts you fumbled.
          </p>
        </header>

        {/* Section 2: Data Flow */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-chestnut)]">
              your flop era
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-[#F7F6F3] px-3 py-1 rounded-full">
              {loading ? "syncing..." : `${weakTopics.length} spots`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.1} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-[#FFF9F9] p-8 text-center space-y-4">
              <AlertCircle className="mx-auto text-[var(--color-chestnut)]" size={32} />
              <div>
                <h3 className="font-serif text-2xl text-neutral-900 tracking-tight">vibe check failed</h3>
                <p className="text-sm text-neutral-600 mt-2 font-sans">
                  could not pull your data from the server. n8n might be sleeping.
                </p>
              </div>
              <button
                onClick={fetchWeakTopics}
                className="inline-flex items-center gap-2 bg-[#1A1918] text-white px-6 py-3 rounded-2xl text-sm font-sans font-medium hover:opacity-90 transition-opacity mt-2"
              >
                <RefreshCcw size={16} />
                force retry
              </button>
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E4E0] bg-[#F7F6F3] p-12 text-center text-neutral-500 font-serif text-xl">
              massive W. you have no weak spots currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTopics.map((topic, i) => (
                <TopicCard key={topic.id} topic={topic} delay={i * 0.1} />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-[#E5E4E0]" />

        {/* Section 3: Roadmap & Actions */}
        <section className="space-y-8 pb-12">
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-chestnut)]">
              next steps
            </h2>
            <h3 className="text-3xl font-serif text-neutral-900 tracking-tight">
              bored? let's build something real.
            </h3>
            <p className="text-sm text-neutral-500 font-sans max-w-md">
              answer a few quick questions and generate a personalized learning roadmap. strictly Ws from here on out.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => router.push('/onboard/create-roadmap')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1918] text-white px-8 py-3.5 rounded-[16px] font-sans font-medium text-sm hover:bg-black transition-colors"
            >
              Map it out &rarr;
            </button>
            
            <button
              onClick={() => router.push('/test')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F7F6F3] border border-[#E5E4E0] text-neutral-900 px-8 py-3.5 rounded-[16px] font-sans font-medium text-sm hover:bg-[#F0EFEA] transition-colors"
            >
              <RotateCcw size={16} />
              Run it back
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}