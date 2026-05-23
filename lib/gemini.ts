import Groq from "groq-sdk";
import { prisma } from "./prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TARGET_COUNT = 50;

const BATCH_SIZE = {
  easy: 10,
  medium: 8,
  hard: 4,
} as const;

const LEVEL_DISTRIBUTION = [
  { level: 0, label: "easy" as const, weight: 0.34 },
  { level: 1, label: "medium" as const, weight: 0.33 },
  { level: 2, label: "hard" as const, weight: 0.33 },
];

const hashQuestion = (text: string, code?: string | null) => {
  const base = code ? code : text;
  return base.toLowerCase().replace(/\s+/g, " ").trim();
};

const DOMAIN_STACKS: Record<string, string[]> = {
  "Web Development": [
    "mongodb + express js + react js + node js",
    "postgresql + next js + node js",
    "postgresql + express js + angular + node js",
    "mysql + laravel + vue js",
    "mongodb + next js + node js",
    "python + django + postgresql",
  ],
  "Mobile Development": [
    "react native + expo + firebase",
    "flutter + dart + firebase",
    "swift + xcode + core data",
    "kotlin + android studio + firebase",
    "react native + expo + supabase",
  ],
  "Data Science": [
    "python + pandas + numpy + scikit-learn",
    "python + pandas + numpy + matplotlib",
    "python + sql + tableau",
    "r + tidyverse + ggplot2",
    "python + spark + hadoop",
  ],
  "Machine Learning": [
    "python + pytorch + hugging face",
    "python + tensorflow + keras",
    "python + scikit-learn + mlflow",
    "python + pytorch + fast ai",
    "python + xgboost + scikit-learn",
  ],
  DevOps: [
    "docker + kubernetes + jenkins",
    "aws + terraform + ansible",
    "github actions + docker + aws",
    "gitlab ci + docker + kubernetes",
    "azure devops + terraform + docker",
  ],
  Cybersecurity: [
    "python + kali linux + metasploit",
    "python + wireshark + burp suite",
    "python + nmap + nessus",
    "bash + kali linux + open vas",
  ],
  Blockchain: [
    "solidity + ethereum + hardhat",
    "solidity + ethereum + foundry",
    "rust + solana + anchor",
    "typescript + ethers js + next js",
  ],
  "Game Development": [
    "unity + c sharp",
    "unreal engine + c++",
    "godot + gdscript",
    "pygame + python",
    "phaser js + typescript",
  ],
  "Cloud Computing": [
    "aws + terraform + docker + kubernetes",
    "google cloud + kubernetes + terraform",
    "azure + bicep + docker + kubernetes",
    "aws + serverless framework + lambda",
  ],
  "System Design": [
    "golang + postgresql + redis + kafka",
    "java + spring boot + postgresql + kafka",
    "rust + postgresql + redis",
    "node js + postgresql + redis + rabbitmq",
    "python + fast api + postgresql + celery",
  ],
};

export const fetchStack = (domain: string): { stack: string[] } => {
  const stacks = DOMAIN_STACKS[domain];

  if (stacks) {
    return { stack: stacks };
  }

  // partial match fallback e.g. "web dev" → "Web Development"
  const partialMatch = Object.keys(DOMAIN_STACKS).find(
    (key) =>
      key.toLowerCase().includes(domain.toLowerCase()) ||
      domain.toLowerCase().includes(key.toLowerCase()),
  );

  if (partialMatch) {
    return { stack: DOMAIN_STACKS[partialMatch] };
  }

  console.warn(`Domain "${domain}" not found in DOMAIN_STACKS`);
  return { stack: [] };
};

const ROLE_DEPTH = {
  Internship: {
    focus: "fundamental syntax, basic concepts, simple debugging",
    mcq: "definitions, basic usage, common beginner mistakes, reading simple code",
    output: "simple expressions, basic type behavior, straightforward control flow",
    forbidden: "system design, architectural decisions, performance optimization, distributed systems",
    benchmark: "questions a CS sophomore should answer after reading the official docs once",
    depthRule: "Ask WHAT — definitions, basic usage, syntax",
    depthBad: "What does useState do?",
    depthGood: "What is the correct way to initialize state with a value that requires expensive computation?",
  },
  SDE1: {
    focus: "practical implementation, common patterns, debugging real code",
    mcq: "how core language features work, common pitfalls, standard library behavior, API contracts",
    output: "execution order, scope behavior, common gotchas in the language",
    forbidden: "theoretical CS papers, system design at scale, kernel-level or compiler internals",
    benchmark: "questions asked in junior developer phone screens at mid-tier product companies",
    depthRule: "Ask HOW — implementation details, why things behave a certain way, not just what they are",
    depthBad: "What does the event loop do?",
    depthGood: "Why does setTimeout(fn, 0) not guarantee immediate execution even when the call stack is empty?",
  },
  SDE2: {
    focus: "production edge cases, performance tradeoffs, system interactions, security",
    mcq: "memory management, concurrency issues, race conditions, scaling decisions, security vulnerabilities",
    output: "complex execution order, language-specific runtime behavior, subtle spec-level gotchas",
    forbidden: "hello world examples, basic syntax, simple definitions a junior knows",
    benchmark: "questions that appear in onsite rounds at product-based startups",
    depthRule: "Ask WHY + WHAT IF — edge cases, production consequences, tradeoffs between approaches",
    depthBad: "What is a memory leak?",
    depthGood: "A React component subscribes to a WebSocket in useEffect. Under what specific conditions does this cause a memory leak that survives component unmount?",
  },
  SDE3: {
    focus: "runtime internals, architectural tradeoffs, MAANG-level depth, cross-system reasoning",
    mcq: "runtime engine behavior, memory model internals, distributed systems tradeoffs, compiler/interpreter decisions, performance at scale",
    output: "subtle spec-level language behavior, runtime optimization effects, memory allocation patterns",
    forbidden: "ABSOLUTE BAN: anything a junior could answer, basic API questions, simple syntax, definitions — if a bootcamp graduate knows the answer it is DISQUALIFIED",
    benchmark: "questions that FAIL senior engineers in MAANG onsite rounds — ones that make 5+ year engineers pause and think hard",
    depthRule: "Ask HOW DOES IT ACTUALLY WORK INSIDE — engine internals, spec-level behavior, architectural consequences",
    depthBad: "How does useState work under the hood?",
    depthGood: "React 18 batches setState calls inside setTimeout automatically. Explain the scheduler priority lane mechanism that enables this and why it breaks useSyncExternalStore in concurrent mode.",
  },
} as const;

type RoleKey = keyof typeof ROLE_DEPTH;

const normalizeRole = (role: string): RoleKey => {
  const r = role.toLowerCase().trim();
  if (r === "internship") return "Internship";
  if (r === "sde1" || r === "sde-1") return "SDE1";
  if (r === "sde2" || r === "sde-2") return "SDE2";
  if (r === "sde3" || r === "sde-3") return "SDE3";
  return "SDE1";
};

const DIFFICULTY_BY_ROLE = {
  easy: {
    Internship: "Single concept, no tricks — basic syntax and definitions",
    SDE1:       "How core features behave at runtime — not just what they are",
    SDE2:       "Real implementation knowledge — requires hands-on experience to answer",
    SDE3:       "Concepts juniors think they know but senior engineers have precise mental models of — deceptively simple surface, deep correct answer",
  },
  medium: {
    Internship: "Two concepts combined — simple real-world scenario",
    SDE1:       "Requires understanding execution model, scope, or async behavior",
    SDE2:       "Production edge cases — unexpected behavior under load or at scale",
    SDE3:       "Stumps mid-level engineers — requires accurate model of runtime internals",
  },
  hard: {
    Internship: "Tricky but fair — edge case a prepared intern knows after studying",
    SDE1:       "Questions junior devs consistently get wrong — prototype chain, event loop, closures",
    SDE2:       "Startup onsite level — performance, security, architectural tradeoffs",
    SDE3:       "MAANG onsite level — the question that ends interviews. If a senior dev can answer without hesitation it is TOO EASY",
  },
} as const;

const DOMAIN_CONTEXT: Record<string, string> = {
  "web development":    "browser runtime, HTTP internals, DOM APIs, frontend framework internals, REST/GraphQL behavior",
  "mobile development": "app lifecycle internals, memory constraints, UI thread blocking, platform API behavior, offline-first patterns",
  "data science":       "data pipeline edge cases, model behavior under distribution shift, statistical gotchas, library internals",
  "machine learning":   "training dynamics, gradient flow, model architecture tradeoffs, inference optimization, numerical stability",
  "devops":             "container runtime behavior, networking internals, CI/CD failure modes, infrastructure-as-code edge cases",
  "cybersecurity":      "attack vectors, cryptographic protocol behavior, secure coding patterns, vulnerability root causes",
  "blockchain":         "consensus mechanism tradeoffs, smart contract execution model, gas optimization, cryptographic primitive behavior",
  "game development":   "render loop internals, physics simulation edge cases, memory pooling, determinism in multiplayer",
  "cloud computing":    "distributed system failure modes, CAP theorem in practice, service limit behavior, eventual consistency edge cases",
  "system design":      "scalability bottlenecks, database internals, caching invalidation, consistency model tradeoffs",
};



const generateTestPrompt = (
  domain: string,
  stack: string[],
  role: string,
  difficulty: "easy" | "medium" | "hard",
  neededCount: number,
  existingQuestions: Array<{ text: string; code?: string | null }>,
): string => {
  const stackLabel = stack.join(", ");
  const roleKey = normalizeRole(role);
  const questionTypeSplit = roleKey === "SDE3" || roleKey === "SDE2"
  ? "70% MCQ, 30% OUTPUT"
  : "50% MCQ, 50% OUTPUT";
  const roleProfile = ROLE_DEPTH[roleKey];
  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;

  const domainKey = domain.toLowerCase().trim();
  const domainContext = DOMAIN_CONTEXT[domainKey]
    ?? `core internals, runtime behavior, production patterns in ${domain}`;

  const thisLevelInstruction = DIFFICULTY_BY_ROLE[difficulty][roleKey];

  const existingContext = existingQuestions.length > 0
    ? `ALREADY GENERATED — do NOT repeat or rephrase:\n${existingQuestions
        .slice(-8)
        .map((q, i) => `${i + 1}. "${q.text.slice(0, 55)}"`)
        .join("\n")}`
    : "";

  return `You are a brutal technical interviewer at a MAANG company screening ${role} candidates for ${domain} using ${stackLabel}.

ROLE: ${roleKey} | DIFFICULTY: ${difficulty.toUpperCase()} | DOMAIN: ${domain}

═══ ROLE PROFILE ═══
Focus: ${roleProfile.focus}
MCQ topics: ${roleProfile.mcq}
Output topics: ${roleProfile.output}
FORBIDDEN: ${roleProfile.forbidden}
Benchmark: ${roleProfile.benchmark}

═══ DEPTH RULE — NON-NEGOTIABLE ═══
${roleProfile.depthRule}

❌ THIS IS TOO SHALLOW (instant disqualify): "${roleProfile.depthBad}"
✅ THIS IS THE MINIMUM BAR: "${roleProfile.depthGood}"

Every question MUST be closer to ✅ than ❌.
Ask yourself: "Would a ${roleKey} candidate already know this without thinking?"
If YES → discard and write a harder one.

═══ THIS BATCH ═══
${thisLevelInstruction}
Stack-specific: target ${stackLabel} internals — not generic programming.
Domain layer: ${domainContext}

${existingContext}

═══ QUESTION TYPES ═══
QUESTION TYPES (${questionTypeSplit}):
MCQ: scenario-based, requires deep mental model
OUTPUT: ONLY pure JavaScript/language execution — NO JSX, 
        NO server startup code, NO file system operations,
        NO external dependencies
        ONLY: closures, prototype chain, event loop microtask ordering,
        type coercion, async/await execution order


═══ QUALITY GATES (check every question) ═══
□ Would a ${roleKey} interviewer at Google/Meta actually ask this?
□ Is it specific to ${stackLabel} — not a generic CS question?
□ Correct answer is unambiguous — only one defensible answer?
□ MCQ wrong options are plausible — someone who almost knows could pick them?
□ OUTPUT answer is a single typeable value?
□ Unique — not a rephrasing of existing questions?
□ ${roleKey === "SDE3" ? "Would a 5-year senior engineer need to think before answering? If NO → too easy → discard." : `Matches ${roleKey} depth — not too junior, not too senior?`}

CODE: \\n for newlines, \\" for quotes, max 12 lines, "" if no code
skillId: kebab-case slug e.g. "v8-hidden-classes", "react-fiber-reconciler", "mongo-write-concern", "node-libuv-threadpool"

BANNED QUESTION STARTERS (instant disqualify):
✗ "What is the purpose of..."
✗ "What does X do?"
✗ "What is X?"
✗ "Which method..."
✗ "What is the value of..." (for trivial code)
✗ "What is the maximum number of..."

REQUIRED QUESTION PATTERNS (use these):
✓ "Given [specific scenario], what happens when..."
✓ "Why does [specific behavior] occur when..."
✓ "A production system exhibits [symptom]. What is the root cause..."
✓ "What is the output of [non-obvious code that requires mental model]..."
✓ "[Two approaches] — under what conditions does [A] outperform [B] and why..."
✓ "Your team notices [production issue]. Trace the exact execution path..."

JSON only, no markdown:
{"questions":[{"skillId":"slug","type":"mcq","level":${level},"text":"?","code":"","options":["plausible wrong","plausible wrong","plausible wrong","correct"],"correctAnswer":"correct"},{"skillId":"slug","type":"output","level":${level},"text":"What is the output?","code":"runnable code here","options":[],"correctAnswer":"value"}]}

Generate EXACTLY ${neededCount} questions now. Apply all quality gates. If a question fails any gate — replace it before outputting.`;
};

async function callLLM(prompt: string, neededNow: number): Promise<any[]> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a technical question generator. Always respond with valid JSON only. No markdown, no backticks, no explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const usage = response.usage;

      const promptTokens = usage?.prompt_tokens || 0;
      const completionTokens = usage?.completion_tokens || 0;
      const totalTokens = usage?.total_tokens || 0;

      // 3. Log it or Save it to your Database (Prisma/PostgreSQL)
      console.log(
        `[Groq Log] Prompt: ${promptTokens} | Completion: ${completionTokens} | Total: ${totalTokens}`,
      );

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      return parsed.questions ?? [];
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes("rate_limit");

      if (is429) {
        const wait = 5000 * Math.pow(2, attempt - 1);
        console.warn(
          `⏳ Rate limited (attempt ${attempt}). Waiting ${wait / 1000}s...`,
        );
        await sleep(wait);
        continue;
      }

      console.error(`❌ Attempt ${attempt} failed: ${err?.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(1000);
        continue;
      }

      return [];
    }
  }

  return [];
}

export const fetchTest = async (
  domain: string,
  stack: string[],
  role: string,
  onProgress?: (saved: number, total: number) => void,
) => {
  type PrismaQuestion = {
    domain: string;
    stack: string[];
    role: string;
    skillId: string;
    type: "mcq" | "output";
    text: string;
    code: string | null;
    options: string[];
    correctAnswer: string;
    level: number;
  };

  const allQuestions: PrismaQuestion[] = [];
  const seenHashes = new Set<string>();

  for (const { level, label, weight } of LEVEL_DISTRIBUTION) {
    const levelTarget = Math.max(1, Math.round(TARGET_COUNT * weight));
    let levelCount = 0;
    let emptyBatchStreak = 0;

    console.log(
      `\n📚 [${label.toUpperCase()}] Target: ${levelTarget} questions`,
    );

    while (levelCount < levelTarget) {
      const remaining = levelTarget - levelCount;
      const batchSize = BATCH_SIZE[label];
      const neededNow = Math.min(batchSize, remaining);

      console.log(
        `  → Requesting batch of ${neededNow} (${levelCount}/${levelTarget} done)`,
      );

      const prompt = generateTestPrompt(
        domain,
        stack,
        role,
        label,
        neededNow,
        allQuestions,
      );

      const batch = await callLLM(prompt, neededNow);

      if (batch.length === 0) {
        emptyBatchStreak++;
        console.warn(`  ⚠️ Empty batch (streak: ${emptyBatchStreak})`);
        if (emptyBatchStreak >= 3) {
          console.error(
            `  ❌ 3 empty batches in a row for [${label}] — moving on`,
          );
          break;
        }
        await sleep(1000);
        continue;
      }

      emptyBatchStreak = 0;

      const validBatch: PrismaQuestion[] = [];

      for (const q of batch) {
        if (levelCount >= levelTarget) break;
        if (!q.text || !q.correctAnswer || !q.type) continue;

        const hash = hashQuestion(q.text, q.code);
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);

        validBatch.push({
          domain,
          stack,
          role,
          skillId: q.skillId || "general",
          type: q.type,
          text: q.text,
          code: q.code && q.code.trim() !== "" ? q.code : null,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer,
          level,
        });

        levelCount++;
      }

      if (validBatch.length > 0) {
        await prisma.question.createMany({
          data: validBatch,
          skipDuplicates: true,
        });
        allQuestions.push(...validBatch);
        onProgress?.(allQuestions.length, TARGET_COUNT);
        console.log(
          `  ✓ Saved ${validBatch.length} → Total: ${allQuestions.length}/${TARGET_COUNT}`,
        );
      }

      if (levelCount < levelTarget) {
        await sleep(1000);
      }
    }
  }

  console.log(`\n✅ Done. Generated ${allQuestions.length} questions total.`);
  return allQuestions;
};
