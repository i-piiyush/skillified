"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "framer-motion";

const cn = (...c) => c.filter(Boolean).join(" ");

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Geist:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --chestnut: #8C271E;
      --chestnut-dim: #8C271E14;
      --chestnut-mid: #8C271E32;
      --khaki: #ABA194;
      --dust: #CFCBCA;
      --alabaster: #D8DDDE;
      --bg: #F4F1EE;
      --bg-card: #FAFAF9;
      --ink: #1C1916;
      --ink-2: #3D3832;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Geist', system-ui, sans-serif; background: var(--bg); color: var(--ink); overflow-x: hidden; }
    .display { font-family: 'Cormorant Garamond', Georgia, serif; }
    ::selection { background: var(--chestnut-mid); }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--dust); border-radius: 99px; }
    .grain-overlay {
      position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.038;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 180px;
    }
  `}</style>
);

// Reveal on scroll
const Reveal = ({ children, delay = 0, className = "", style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

// Word-by-word reveal
const WordReveal = ({ text, delay = 0, italic = false, color }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <span ref={ref} style={{ display: "block" }}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.26em" }}>
          <motion.span
            style={{ display: "inline-block", fontStyle: italic ? "italic" : "normal", color: color || "inherit" }}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{ duration: 0.7, delay: delay + i * 0.075, ease: [0.22, 1, 0.36, 1] }}>
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// Counter
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

// Marquee
const TAGS = ["System Design","DSA","React","Kubernetes","LLMs","Rust","GraphQL","Cybersecurity","ML Engineering","DevOps","iOS Dev","Data Engineering","Cloud Architecture","Web3","Backend","Go","TypeScript"];
const Marquee = () => (
  <div style={{ borderTop: "1px solid var(--dust)", borderBottom: "1px solid var(--dust)", overflow: "hidden", position: "relative", padding: "18px 0" }}>
    <div style={{ position: "absolute", inset: "0", left: 0, width: "96px", background: "linear-gradient(to right, var(--bg), transparent)", zIndex: 2, pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: "0", right: 0, left: "auto", width: "96px", background: "linear-gradient(to left, var(--bg), transparent)", zIndex: 2, pointerEvents: "none" }} />
    <motion.div style={{ display: "flex", gap: "3rem", whiteSpace: "nowrap" }}
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 38, ease: "linear", repeat: Infinity }}>
      {[...TAGS, ...TAGS].map((t, i) => (
        <span key={i} style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--khaki)" }}>{t}</span>
      ))}
    </motion.div>
  </div>
);

// Horizontal scroll feature strip
const FEATURES = [
  { num: "01", title: "Adaptive intelligence", body: "Every answer reshapes the next question. The engine continuously recalibrates difficulty — pinpointing exactly where your knowledge breaks down, not just where it ends." },
  { num: "02", title: "Curated resource engine", body: "We crawl documentation, papers, courses, and open-source repos. Then surface only the highest-signal material for your exact weak point — not a generic link dump." },
  { num: "03", title: "Role-precise roadmaps", body: "Intern and Staff Engineer require fundamentally different paths. Your roadmap is built around your target role, sequenced by dependency, and scoped to what actually gets you hired." },
  { num: "04", title: "Production-grade projects", body: "No todo apps. No CRUD. We suggest projects that demonstrate senior-level thinking — the kind that make interviewers stop scrolling your GitHub and start asking questions." },
];

const HScroll = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(FEATURES.length - 1) * 100}%`]);
  return (
    <div ref={ref} style={{ height: `${FEATURES.length * 100}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 2rem", width: "100%", marginBottom: "2.5rem" }}>
          <Reveal>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chestnut)", display: "block", marginBottom: "1rem" }}>what it does</span>
            <h2 className="display" style={{ fontSize: "clamp(2.8rem,5vw,4.5rem)", fontWeight: 600, lineHeight: 1.08, color: "var(--ink)" }}>
              Built for <em style={{ color: "var(--chestnut)" }}>real results</em>
            </h2>
          </Reveal>
        </div>
        <div style={{ overflow: "hidden" }}>
          <motion.div style={{ x, display: "flex" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ minWidth: "100%", padding: "0 2rem" }}>
                <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
                  <div style={{ maxWidth: "560px" }}>
                    <span className="display" style={{ fontSize: "5rem", fontWeight: 600, color: "var(--alabaster)", display: "block", marginBottom: "1.5rem", lineHeight: 1 }}>{f.num}</span>
                    <h3 className="display" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 600, marginBottom: "1.25rem", color: "var(--ink)", lineHeight: 1.1 }}>{f.title}</h3>
                    <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--khaki)" }}>{f.body}</p>
                    <div style={{ marginTop: "2.5rem", height: "1px", width: "56px", background: "var(--chestnut)" }} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        {/* Progress */}
        <div style={{ maxWidth: "1152px", margin: "2.5rem auto 0", padding: "0 2rem", width: "100%", display: "flex", gap: "8px" }}>
          {FEATURES.map((_, i) => (
            <div key={i} style={{ height: "1px", flex: 1, background: "var(--dust)", overflow: "hidden" }}>
              <motion.div style={{
                height: "100%", background: "var(--chestnut)", transformOrigin: "left",
                scaleX: useTransform(scrollYProgress, [i / FEATURES.length, (i + 1) / FEATURES.length], [0, 1])
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Adaptive test demo
const QS = [
  { level: "Mid", q: "What is the time complexity of Dijkstra's algorithm using a min-heap?", tags: ["Graphs", "Complexity"], opts: ["O(V log V)", "O(V²)", "O(E log V)", "O(V + E)"] },
  { level: "Hard", q: "Design a globally distributed rate-limiter for 10M RPS with eventual consistency.", tags: ["System Design", "Distributed"], opts: ["Token bucket", "Sliding window", "Fixed window", "Leaky bucket"] },
  { level: "Hard", q: "How does React's reconciliation algorithm handle key-based list diffing?", tags: ["React", "Internals"], opts: ["Depth-first", "Key comparison", "Fiber traversal", "Virtual DOM diff"] },
  { level: "Mid", q: "Contrast CSRF and XSS attack vectors and specify mitigations for each.", tags: ["Security", "Web"], opts: ["CSRF token", "CSP headers", "SameSite cookie", "Input sanitisation"] },
];

const TestDemo = () => {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const q = QS[active];
  const lc = q.level === "Hard" ? "var(--chestnut)" : "var(--khaki)";

  useEffect(() => {
    if (selected === null) return;
    const id = setTimeout(() => { setActive((a) => (a + 1) % QS.length); setSelected(null); }, 1100);
    return () => clearTimeout(id);
  }, [selected]);

  return (
    <div style={{ borderRadius: "16px", border: "1px solid var(--dust)", background: "var(--bg-card)", padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--chestnut)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--khaki)" }}>Adaptive Engine</span>
        </div>
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "99px", border: `1px solid ${lc}50`, background: `${lc}12`, color: lc }}>{q.level}</span>
      </div>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ height: "2px", borderRadius: "99px", background: "var(--alabaster)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: "var(--chestnut)", transformOrigin: "left" }}
            animate={{ scaleX: (active + 1) / QS.length }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <p style={{ fontSize: "11px", marginTop: "6px", textAlign: "right", color: "var(--dust)" }}>Q{active + 1} of {QS.length}</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}>
          <p style={{ fontSize: "15px", fontWeight: 500, lineHeight: 1.65, marginBottom: "12px", color: "var(--ink)" }}>{q.q}</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
            {q.tags.map((t) => (
              <span key={t} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "4px", background: "var(--chestnut-dim)", color: "var(--chestnut)" }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {q.opts.map((o, i) => (
              <motion.button key={o}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(i)}
                style={{
                  fontSize: "13px", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "1px solid",
                  borderColor: selected === i ? "var(--chestnut)" : "var(--dust)",
                  background: selected === i ? "var(--chestnut-dim)" : "transparent",
                  color: selected === i ? "var(--chestnut)" : "var(--ink-2)",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                <span style={{ marginRight: "8px", color: "var(--dust)", fontWeight: 600 }}>{String.fromCharCode(65 + i)}.</span>{o}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Roadmap demo
const STEPS = [
  { week: "Wk 01–02", label: "Networking fundamentals & OSI model", done: true },
  { week: "Wk 03–04", label: "Linux & CLI mastery", done: true },
  { week: "Wk 05–06", label: "Python scripting for security", done: false },
  { week: "Wk 07–09", label: "Ethical hacking & penetration testing", done: false },
  { week: "Wk 10–12", label: "Capstone: build a custom port scanner", done: false },
];
const RoadmapDemo = () => (
  <div style={{ borderRadius: "16px", border: "1px solid var(--dust)", background: "var(--bg-card)", padding: "2rem" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
      <div>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--khaki)", marginBottom: "4px" }}>Your roadmap</p>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>Cybersecurity → SOC Analyst</p>
      </div>
      <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "99px", border: "1px solid var(--chestnut-mid)", background: "var(--chestnut-dim)", color: "var(--chestnut)" }}>12 weeks</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {STEPS.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex", alignItems: "center", gap: "14px", padding: "10px 14px", borderRadius: "10px",
            border: `1px solid ${s.done ? "var(--chestnut-mid)" : "var(--dust)"}`,
            background: s.done ? "var(--chestnut-dim)" : "transparent",
          }}>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${s.done ? "var(--chestnut)" : "var(--dust)"}`, background: s.done ? "var(--chestnut)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--dust)", width: "60px", flexShrink: 0 }}>{s.week}</span>
          <span style={{ fontSize: "13px", color: s.done ? "var(--chestnut)" : "var(--ink-2)" }}>{s.label}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

// Label
const Label = ({ children }) => (
  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chestnut)", display: "block", marginBottom: "1rem" }}>{children}</span>
);

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SkillifyLanding() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [domain, setDomain] = useState("Frontend");
  const [role, setRole] = useState("SDE-2");

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.95]);

  const DOMAINS = ["Frontend", "Backend", "DevOps", "ML Eng", "Cybersec", "iOS"];
  const ROLES = ["Intern", "SDE-1", "SDE-2", "SDE-3", "Staff"];

  const navBtnStyle = {
    background: "var(--chestnut)", color: "#fff", fontWeight: 600, fontSize: "13px",
    padding: "10px 20px", borderRadius: "10px", textDecoration: "none", display: "inline-block",
  };
  const navLinkStyle = { color: "var(--khaki)", fontSize: "13px", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <GlobalStyles />
      <div className="grain-overlay" />

      {/* NAV */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
          background: navScrolled ? "rgba(244,241,238,0.93)" : "transparent",
          backdropFilter: navScrolled ? "blur(18px)" : "none",
          borderBottom: navScrolled ? "1px solid var(--dust)" : "1px solid transparent",
          padding: navScrolled ? "14px 0" : "22px 0",
          transition: "all 0.3s ease",
        }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--chestnut)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px", fontFamily: "Geist, sans-serif" }}>S</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--ink)", letterSpacing: "-0.02em" }}>skillify</span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {["How it works", "Features", "Domains", "Pricing"].map((item) => (
              <a key={item} href="#" style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = "var(--ink)"}
                onMouseLeave={e => e.target.style.color = "var(--khaki)"}>{item}</a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <a href="#" style={navLinkStyle}
              onMouseEnter={e => e.target.style.color = "var(--ink)"}
              onMouseLeave={e => e.target.style.color = "var(--khaki)"}>Log in</a>
            <motion.a href="#" whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(140,39,30,0.24)" }} whileTap={{ scale: 0.97 }} style={navBtnStyle}>
              Sign up free
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "96px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(140,39,30,0.065) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.022, backgroundImage: "linear-gradient(var(--chestnut) 1px, transparent 1px), linear-gradient(90deg, var(--chestnut) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale, position: "relative", zIndex: 2, maxWidth: "1000px", margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chestnut)", border: "1px solid var(--chestnut-mid)", background: "var(--chestnut-dim)", padding: "8px 16px", borderRadius: "99px", marginBottom: "2.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--chestnut)", display: "inline-block" }} />
            Stop estimating. Start knowing.
          </motion.div>

          <h1 className="display" style={{ fontSize: "clamp(3.5rem,8.5vw,7.5rem)", fontWeight: 600, lineHeight: 1.035, letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>
            <WordReveal text="Know where you" delay={0.06} />
            <WordReveal text="actually stand." delay={0.16} italic color="var(--chestnut)" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            style={{ fontSize: "17px", lineHeight: 1.72, color: "var(--khaki)", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            Adaptive tests calibrated to your role. Curated resources for your exact weak points.
            Personalised roadmaps and projects that actually get you hired.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <motion.a href="#"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 36px rgba(140,39,30,0.28)" }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: "14px", fontWeight: 600, padding: "14px 28px", borderRadius: "12px", background: "var(--chestnut)", color: "#fff", textDecoration: "none" }}>
              Find out your actual level →
            </motion.a>
            <motion.a href="#"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: "14px", fontWeight: 500, padding: "14px 28px", borderRadius: "12px", border: "1px solid var(--dust)", background: "rgba(255,255,255,0.65)", color: "var(--ink)", textDecoration: "none" }}>
              Get my roadmap
            </motion.a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
            style={{ fontSize: "12px", color: "var(--dust)", marginTop: "1.25rem" }}>
            Free to start · No credit card required
          </motion.p>
        </motion.div>

        {/* Floating pills */}
        {[
          { label: "React → SDE-2", style: { left: "6%", top: "60%" } },
          { label: "Cybersec → Analyst", style: { right: "7%", top: "22%" } },
          { label: "ML Eng → L5", style: { right: "5%", top: "66%" } },
          { label: "DevOps → Senior", style: { left: "4%", top: "28%" } },
        ].map((p, i) => (
          <motion.div key={i}
            style={{ position: "absolute", fontSize: "11px", fontWeight: 500, padding: "7px 14px", borderRadius: "99px", border: "1px solid var(--dust)", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(10px)", color: "var(--khaki)", ...p.style }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.4 }}>
            {p.label}
          </motion.div>
        ))}

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--dust)" }}>scroll</span>
          <motion.div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, var(--dust), transparent)", transformOrigin: "top" }}
            animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* STATS */}
      <section style={{ padding: "5rem 2rem", borderBottom: "1px solid var(--dust)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2.5rem" }}>
          {[{ n: 50, s: "+", l: "domains covered" },{ n: 14000, s: "+", l: "tests completed" },{ n: 94, s: "%", l: "accuracy rating" },{ n: 3, s: "×", l: "faster prep" }].map((st, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="display" style={{ fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 600, color: "var(--chestnut)", marginBottom: "6px" }}>
                <Counter to={st.n} suffix={st.s} />
              </p>
              <p style={{ fontSize: "13px", color: "var(--khaki)" }}>{st.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "7rem 2rem" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <Reveal style={{ marginBottom: "4rem" }}>
            <Label>How it works</Label>
            <h2 className="display" style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 600, lineHeight: 1.1 }}>
              Three steps.<br />
              <em style={{ color: "var(--chestnut)" }}>Zero guesswork.</em>
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--dust)" }}>
            {[
              { n: "01", t: "Configure your test", b: "Select your domain, target role, and current stack. We construct an assessment calibrated precisely to the gap between where you are and where you want to be." },
              { n: "02", t: "Take the adaptive assessment", b: "The engine reads every answer in real-time and adjusts difficulty accordingly. It converges on your exact knowledge boundary — not an approximation of it." },
              { n: "03", t: "Get your precise playbook", b: "Your weak points are mapped and ranked. We surface the highest-signal resources for each, plus a sequenced roadmap and projects calibrated to your target role." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.1}
                style={{ background: "var(--bg-card)", padding: "2.5rem", transition: "background 0.2s" }}>
                <span className="display" style={{ fontSize: "4.5rem", fontWeight: 600, color: "var(--alabaster)", display: "block", marginBottom: "1.5rem", lineHeight: 1 }}>{c.n}</span>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "0.75rem", color: "var(--ink)" }}>{c.t}</h3>
                <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--khaki)" }}>{c.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLL */}
      <HScroll />

      {/* TEST SECTION */}
      <section style={{ padding: "7rem 2rem", borderTop: "1px solid var(--dust)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <Label>Adaptive testing</Label>
              <h2 className="display" style={{ fontSize: "clamp(2.5rem,4vw,3.75rem)", fontWeight: 600, lineHeight: 1.08, marginBottom: "1.5rem" }}>
                Not a quiz.<br />
                <em style={{ color: "var(--chestnut)" }}>A calibration.</em>
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--khaki)", marginBottom: "2rem" }}>
                Every answer reshapes the next question. The engine maps your knowledge graph in real-time — identifying the exact ceiling of what you know and the precise floor of what you don't.
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Difficulty recalibrates after every single response","Covers DSA, system design, domain-specific, and behavioural","Role-targeted — SDE-2 differs fundamentally from Staff Engineer","Retake as many times as needed. Progress is tracked."].map((pt) => (
                  <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "var(--ink-2)" }}>
                    <span style={{ marginTop: "3px", width: "16px", height: "16px", borderRadius: "50%", border: "1px solid var(--chestnut-mid)", background: "var(--chestnut-dim)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="var(--chestnut)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.15}><TestDemo /></Reveal>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section style={{ padding: "7rem 2rem", background: "rgba(255,255,255,0.38)", borderTop: "1px solid var(--dust)", borderBottom: "1px solid var(--dust)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <Reveal delay={0.1}><RoadmapDemo /></Reveal>
          <div>
            <Reveal delay={0.2}>
              <Label>Personalised roadmaps</Label>
              <h2 className="display" style={{ fontSize: "clamp(2.5rem,4vw,3.75rem)", fontWeight: 600, lineHeight: 1.08, marginBottom: "1.5rem" }}>
                Start from<br />
                <em style={{ color: "var(--chestnut)" }}>absolute zero.</em>
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--khaki)", marginBottom: "1.75rem" }}>
                Never written a line of security code? Never deployed a container? We build a week-by-week plan scoped to your exact target role — ordered by dependency, not by what's trending on YouTube.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {["Web Dev → Internship","Cyber → SOC Analyst","ML → Research Eng","DevOps → SRE","iOS → Junior Dev","Backend → SDE-1"].map((r) => (
                  <div key={r} style={{ fontSize: "12px", fontWeight: 500, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--dust)", background: "rgba(255,255,255,0.6)", color: "var(--khaki)" }}>{r}</div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PICKER */}
      <section style={{ padding: "7rem 2rem" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <Label>Try it now</Label>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 600, lineHeight: 1.1, marginBottom: "0.75rem" }}>
              Configure your assessment.
            </h2>
            <p style={{ fontSize: "15px", color: "var(--khaki)", marginBottom: "3rem" }}>30 seconds to set up. Results that actually move you forward.</p>
            <div style={{ borderRadius: "16px", border: "1px solid var(--dust)", background: "var(--bg-card)", padding: "2rem", textAlign: "left" }}>
              <div style={{ marginBottom: "1.75rem" }}>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--khaki)", marginBottom: "12px" }}>Domain</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {DOMAINS.map((d) => (
                    <button key={d} onClick={() => setDomain(d)}
                      style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", borderColor: domain === d ? "var(--chestnut)" : "var(--dust)", background: domain === d ? "var(--chestnut)" : "transparent", color: domain === d ? "#fff" : "var(--khaki)" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--khaki)", marginBottom: "12px" }}>Target role</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", borderColor: role === r ? "var(--chestnut)" : "var(--dust)", background: role === r ? "var(--chestnut)" : "transparent", color: role === r ? "#fff" : "var(--khaki)" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(140,39,30,0.26)" }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "15px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, background: "var(--chestnut)", color: "#fff", border: "none", cursor: "pointer" }}>
                Start {domain} → {role} assessment →
              </motion.button>
              <p style={{ fontSize: "11px", textAlign: "center", marginTop: "10px", color: "var(--dust)" }}>Adaptive · ~12 questions · Calibrated results</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.35)", borderTop: "1px solid var(--dust)", borderBottom: "1px solid var(--dust)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <Reveal style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <Label>What people are saying</Label>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 600 }}>Results speak for themselves.</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { name: "Aarav S.", role: "Cracked Google SDE-2", text: "I thought I was solid at graphs. The assessment exposed exactly where my reasoning broke down. Two weeks on those specific gaps — I walked into the interview a different engineer.", ini: "AS" },
              { name: "Priya M.", role: "Landed cybersec internship", text: "Zero prior knowledge. The roadmap was so well-sequenced I never had to wonder what to do next. Got an internship offer three months later.", ini: "PM" },
              { name: "Rohan K.", role: "Staff Eng, Series B startup", text: "The project suggestions are genuinely impressive. Building a distributed rate-limiter instead of another CRUD app — that project came up in three separate final rounds.", ini: "RK" },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ height: "100%", borderRadius: "16px", border: "1px solid var(--dust)", background: "var(--bg-card)", padding: "1.75rem", display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--ink-2)", marginBottom: "1.5rem", flex: 1 }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--chestnut-dim)", border: "1px solid var(--chestnut-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--chestnut)", flexShrink: 0 }}>{t.ini}</div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>{t.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--khaki)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "9rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 45% at 50% 60%, rgba(140,39,30,0.075) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <Reveal>
            <h2 className="display" style={{ fontSize: "clamp(3rem,7vw,6.5rem)", fontWeight: 600, lineHeight: 1.035, marginBottom: "1.5rem" }}>
              Stop guessing.<br />
              <em style={{ color: "var(--chestnut)" }}>Start knowing.</em>
            </h2>
            <p style={{ fontSize: "17px", lineHeight: 1.7, color: "var(--khaki)", maxWidth: "480px", margin: "0 auto 2.5rem" }}>
              Your level is knowable. Your weak points are fixable. Your next role is achievable.
            </p>
            <motion.a href="#"
              whileHover={{ scale: 1.03, boxShadow: "0 16px 48px rgba(140,39,30,0.30)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-block", fontSize: "14px", fontWeight: 600, padding: "16px 36px", borderRadius: "14px", background: "var(--chestnut)", color: "#fff", textDecoration: "none" }}>
              Take the assessment — it's free →
            </motion.a>
            <p style={{ fontSize: "12px", color: "var(--dust)", marginTop: "1rem" }}>No account needed · Results in under 15 minutes</p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2.5rem 2rem", borderTop: "1px solid var(--dust)", background: "rgba(255,255,255,0.28)" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--chestnut)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>S</span>
            </div>
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>skillify</span>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            {["Privacy", "Terms", "Contact", "Careers", "Blog"].map((l) => (
              <a key={l} href="#" style={{ fontSize: "13px", color: "var(--khaki)", textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = "var(--ink)"}
                onMouseLeave={e => e.target.style.color = "var(--khaki)"}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "var(--dust)" }}>© 2025 skillify</p>
        </div>
      </footer>
    </div>
  );
}