import { FeatureCard, RoadmapCard } from "@/types/landing";

export const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
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