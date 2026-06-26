import { FeatureCard, RoadmapCard } from "@/types/landing";
import { ActivityIcon, Cpu, Database, GitBranch, Layers, ShieldAlert } from "lucide-react";


export const socialItems = [
  { label: "Twitter", link: "https://x.com/piiyush_jsx" },
  { label: "GitHub", link: "https://github.com/i-piiyush" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/piyush-chhabra-552b8a238/" },
];

export const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "About", ariaLabel: "Learn about us", link: "/about" },
  { label: "Services", ariaLabel: "View our services", link: "/services" },
  { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
];

export const problemCards: FeatureCard[] = [
  {
    number: "01",
    title: "Tutorial Hell",
    description: "You keep endlessly consuming content without knowing what actually moves the needle for interviews.",
  },
  {
    number: "02",
    title: "Side Questing",
    description: "You are learning flashy tools before understanding the core fundamentals that companies actually test for.",
  },
  {
    number: "03",
    title: "Skill Gaps",
    description: "You study broadly, but get completely cooked the second an interviewer asks a specific architecture question.",
  },
  {
    number: "04",
    title: "Zero Plot Armor",
    description: "Most students are just guessing what the industry expects, leaving them defenseless in technical screens.",
  },
];

export const roadmapCards: RoadmapCard[] = [
  {
    title: "FAANG Frontend Dev",
    subtitle: "Zero-fluff prep to survive heavy technical screens and system design rounds.",
    bullets: ["Core web platform", "DSA & problem solving", "React internals", "Performance metrics"],
  },
  {
    title: "Startup Engineer",
    subtitle: "Fast-moving meta for shipping features quickly and handling pure ambiguity.",
    bullets: ["MVP architecture", "Product thinking", "APIs + auth flows", "Full-stack execution"],
  },
  {
    title: "AI/ML Engineer",
    subtitle: "The structured path from basic math foundations to deploying actual models.",
    bullets: ["Math foundations", "Pandas / Numpy", "Model training", "Deployment pipelines"],
  },
  {
    title: "Cybersecurity Analyst",
    subtitle: "Role-specific progression built around what security teams actually expect.",
    bullets: ["Networking layers", "Threat models", "Detection tooling", "Incident response"],
  },
];

export const PROTOCOLS = [
  {
    id: "SYS_01",
    title: "Adaptive Diagnostics",
    description: "Real-time technical screens that escalate in difficulty based on your inputs. We expose your exact vulnerabilities instead of testing you on generic trivia.",
    icon: ActivityIcon,
    metrics: ["Low Latency", "Dynamic Scaling", "O(1) Feedback"]
  },
  {
    id: "SYS_02",
    title: "Pathfinder Engine",
    description: "Dynamic execution threads built for your specific target role. No fluff, just the exact nodes you need to clear to secure the bag.",
    icon: GitBranch,
    metrics: ["Role-Specific", "Zero Fluff", "Curated Docs"]
  },
  {
    id: "SYS_03",
    title: "Vulnerability Telemetry",
    description: "Brutal reality checks on your skill tree. Track your recovery arc as you patch gaps in your system design, DSA, and practical knowledge.",
    icon: ShieldAlert,
    metrics: ["Visual Tracking", "N8N Synced", "Skill Mapping"]
  }
];

export const ARCHITECTURE_LAYERS = [
  { name: "Frontend Interface", tech: "Next.js + React", icon: Layers },
  { name: "Automation Layer", tech: "N8N Workflows", icon: Cpu },
  { name: "Data Persistence", tech: "Prisma + Postgres", icon: Database },
];


