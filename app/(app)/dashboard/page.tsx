"use client";

import { authClient } from "@/lib/auth-client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WeakTopic = {
  id: string;
  topic: string;
  whyYouNeedToStudyThis: string;
  createdAt: string;
  userId: string;
};

const formatTopicLabel = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const getTopicColor = (index: number) => {
  const colors = [
    { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", border: "border-violet-100" },
    { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-400", border: "border-sky-100" },
    { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-100" },
    { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400", border: "border-rose-100" },
    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-100" },
  ];
  return colors[index % colors.length];
};

const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3"
  >
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-neutral-200 animate-pulse" />
      <div className="h-4 w-36 rounded-full bg-neutral-200 animate-pulse" />
    </div>
    <div className="space-y-2 pl-5">
      <div className="h-3 w-full rounded-full bg-neutral-100 animate-pulse" />
      <div className="h-3 w-4/5 rounded-full bg-neutral-100 animate-pulse" />
      <div className="h-3 w-3/5 rounded-full bg-neutral-100 animate-pulse" />
    </div>
    <div className="pl-5 pt-1">
      <div className="h-3 w-24 rounded-full bg-neutral-100 animate-pulse" />
    </div>
  </motion.div>
);

const TopicCard = ({
  topic,
  index,
  delay,
}: {
  topic: WeakTopic;
  index: number;
  delay: number;
}) => {
  const color = getTopicColor(index);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-2xl border ${color.border} bg-white p-5 space-y-3 cursor-default group transition-shadow hover:shadow-sm`}
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          className={`h-2.5 w-2.5 rounded-full ${color.dot}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        />
        <span className={`text-sm font-semibold tracking-tight ${color.text}`}>
          {formatTopicLabel(topic.topic)}
        </span>
      </div>
      <p className="text-sm text-neutral-500 leading-relaxed pl-5">
        {topic.whyYouNeedToStudyThis}
      </p>
      <div className="pl-5">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color.bg} ${color.text}`}>
          needs work
        </span>
      </div>
    </motion.div>
  );
};

const StatCard = ({
  label,
  value,
  sub,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className="rounded-2xl bg-white border border-neutral-100 p-5 space-y-1"
  >
    <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{value}</p>
    {sub && <p className="text-xs text-neutral-400">{sub}</p>}
  </motion.div>
);

const Pill = ({
  label,
  delay,
}: {
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.35 }}
    className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium px-3 py-1.5 rounded-full"
  >
    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
    {label}
  </motion.div>
);

export default function DashboardPage() {
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const userName = session?.user?.name ?? "anon";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (isPending) return;

    const getWeakTopics = async () => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 6000);
      try {
        const userId = session?.user?.id;
        if (!userId) return;
        const res = await axios.get(`/api/get-weak-topics/${userId}`);
        setWeakTopics(res.data?.weakTopics ?? []);
      } catch {
        console.log("error fetching weak topics");
      } finally {
        setTopicsLoading(false);
      }
    };

    getWeakTopics();
  }, [isPending]);

  const quickSkills = ["Node.js", "Express", "MongoDB", "REST APIs", "Auth"];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Toast popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 bg-neutral-900 text-white text-sm px-4 py-3 rounded-2xl shadow-xl max-w-sm">
              <motion.div
                className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span>
                your weak spots are cooking rn — usually takes 3-4 mins, no rush
              </span>
              <button
                onClick={() => setShowPopup(false)}
                className="ml-1 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-sm bg-white" />
            </div>
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">skillcheck</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2.5 bg-neutral-100 hover:bg-neutral-150 px-3 py-1.5 rounded-full transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{initials}</span>
                </div>
                <span className="text-sm text-neutral-700 font-medium hidden sm:block">
                  {userName.split(" ")[0]}
                </span>
                <svg className="h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-neutral-100 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-neutral-50">
                      <p className="text-sm font-semibold text-neutral-900">{userName}</p>
                      <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
                    </div>
                    <div className="p-1.5">
                      <button className="w-full text-left text-sm px-3 py-2 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors">
                        profile settings
                      </button>
                      <button className="w-full text-left text-sm px-3 py-2 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors">
                        billing
                      </button>
                      <div className="h-px bg-neutral-100 my-1" />
                      <button
                        onClick={() => authClient.signOut()}
                        className="w-full text-left text-sm px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-medium"
                      >
                        log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero greeting */}
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl font-semibold text-neutral-900 tracking-tight"
          >
            hey, {userName.split(" ")[0]}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="text-neutral-400 text-sm"
          >
            here's where you're at today
          </motion.p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="streak" value="12" sub="days running" delay={0.22} />
          <StatCard label="topics done" value="38" sub="lifetime" delay={0.28} />
          <StatCard label="weak spots" value={topicsLoading ? "..." : weakTopics.length} sub="flagged today" delay={0.34} />
          <StatCard label="accuracy" value="74%" sub="last session" delay={0.4} />
        </div>

        {/* Skills row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">your stack</p>
          <div className="flex flex-wrap gap-2">
            {quickSkills.map((s, i) => (
              <Pill key={s} label={s} delay={0.46 + i * 0.06} />
            ))}
          </div>
        </motion.div>

        {/* Activity bar (static decorative) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="bg-white border border-neutral-100 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900">this week</p>
            <p className="text-xs text-neutral-400">questions answered</p>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {[3, 7, 5, 9, 12, 4, 8].map((v, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.56 + i * 0.06, duration: 0.4, ease: "backOut" }}
                className="flex-1 bg-neutral-900 rounded-t-md origin-bottom"
                style={{ height: `${(v / 12) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <p key={i} className="flex-1 text-center text-xs text-neutral-300">{d}</p>
            ))}
          </div>
        </motion.div>

        {/* Weak topics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.58 }}
              className="space-y-0.5"
            >
              <p className="text-sm font-semibold text-neutral-900">weak spots</p>
              <p className="text-xs text-neutral-400">
                {topicsLoading
                  ? "analyzing your answers..."
                  : `${weakTopics.length} topics need your attention`}
              </p>
            </motion.div>
            {topicsLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-xs text-neutral-400"
              >
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-amber-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                generating
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} delay={0.62 + i * 0.08} />
                ))
              : weakTopics.map((topic, i) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    index={i}
                    delay={i * 0.1}
                  />
                ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between bg-neutral-900 text-white rounded-2xl px-6 py-5"
        >
          <div>
            <p className="text-sm font-semibold">ready to grind?</p>
            <p className="text-xs text-neutral-400 mt-0.5">tackle your weak spots head on</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white text-neutral-900 text-sm font-semibold px-4 py-2 rounded-xl"
          >
            start session
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-neutral-300 pb-6">skillcheck — built different</p>
      </main>
    </div>
  );
}