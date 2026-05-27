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

const hashQuestion = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
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

// ─── Domain Style Config ─────────────────────────────────────────────────────

const DOMAIN_STYLE: Record<
  string,
  {
    mode: "practical" | "theoretical";
    lens: string;
  }
> = {
  "web development": {
    mode: "practical",
    lens:
      "Focus on WHY decisions are made in real codebases — why async/await over raw promises, why SSR over CSR for a given use case, why a specific caching strategy. Never ask someone to explain what X is; ask when and why X beats the alternative.",
  },
  "mobile development": {
    mode: "practical",
    lens:
      "Focus on real app behaviour — why a pattern causes jank, when to choose a specific navigation strategy, how lifecycle events interact with state. Ask 'under what condition does this break' style questions.",
  },
  "devops": {
    mode: "practical",
    lens:
      "Focus on operational tradeoffs — why rolling deploys over blue/green for a given constraint, what failure mode a specific Kubernetes config introduces, why a CI step ordering causes flakiness. Real infrastructure decision-making.",
  },
  "blockchain": {
    mode: "practical",
    lens:
      "Focus on implementation consequences — why a reentrancy guard is placed where it is, what happens to gas cost when storage layout changes, why a specific consensus choice breaks a use case.",
  },
  "game development": {
    mode: "practical",
    lens:
      "Focus on runtime behaviour — why a physics update order causes drift, when object pooling hurts more than it helps, why a specific rendering call order causes flickering. Practical engine-level decisions.",
  },
  "cloud computing": {
    mode: "practical",
    lens:
      "Focus on failure modes and cost tradeoffs — why eventual consistency breaks a specific workflow, when to use SQS vs SNS vs EventBridge, what happens to a Lambda cold start under a specific VPC config.",
  },
  "data science": {
    mode: "theoretical",
    lens:
      "Focus on statistical and algorithmic concepts — why a model assumption is violated by a dataset property, what the bias-variance tradeoff implies for a given pipeline choice, when a metric is misleading. Conceptual depth over tool syntax.",
  },
  "machine learning": {
    mode: "theoretical",
    lens:
      "Focus on mathematical intuition and training dynamics — why a specific activation function causes vanishing gradients, what batch normalisation actually normalises and why the order relative to activation matters, why a loss landscape property makes an optimiser diverge. Ask WHY things work or break, not how to call a library.",
  },
  "cybersecurity": {
    mode: "theoretical",
    lens:
      "Focus on attack root causes and cryptographic fundamentals — why a specific HMAC construction is vulnerable, what property of RSA makes a padding oracle possible, why a CSP directive fails to block a specific XSS vector. Ask about underlying principles, not tool flags.",
  },
  "system design": {
    mode: "theoretical",
    lens:
      "Focus on distributed systems theory and tradeoffs — why a specific consistency model cannot guarantee a property under network partition, what the practical consequence of clock skew is for a given consensus algorithm, when a CRDT is the wrong choice. Conceptual precision over solution templates.",
  },
};

const DEFAULT_DOMAIN_STYLE = {
  mode: "practical" as const,
  lens: "Focus on real-world decision making — when and why X over Y, production tradeoffs, debugging real symptoms.",
};

// ─── Role Depth ───────────────────────────────────────────────────────────────

const ROLE_DEPTH = {
  Internship: {
    focus: "fundamental syntax, basic concepts, simple debugging",
    mcq: "definitions, basic usage, common beginner mistakes, reading simple code",
    forbidden:
      "system design, architectural decisions, performance optimization, distributed systems",
    benchmark:
      "questions a CS sophomore should answer after reading the official docs once",
    depthRule: "Ask WHAT — definitions, basic usage, syntax",
    depthBad: "What does useState do?",
    depthGood:
      "What is the correct way to initialize state with a value that requires expensive computation?",
  },
  SDE1: {
    focus: "practical implementation, common patterns, debugging real code",
    mcq: "how core language features work, common pitfalls, standard library behaviour, API contracts",
    forbidden:
      "theoretical CS papers, system design at scale, kernel-level or compiler internals",
    benchmark:
      "questions asked in junior developer phone screens at mid-tier product companies",
    depthRule:
      "Ask HOW — implementation details, why things behave a certain way, not just what they are",
    depthBad: "What does the event loop do?",
    depthGood:
      "Why does setTimeout(fn, 0) not guarantee immediate execution even when the call stack is empty?",
  },
  SDE2: {
    focus:
      "production edge cases, performance tradeoffs, system interactions, security",
    mcq: "memory management, concurrency issues, race conditions, scaling decisions, security vulnerabilities",
    forbidden:
      "hello world examples, basic syntax, simple definitions a junior knows",
    benchmark:
      "questions that appear in onsite rounds at product-based startups",
    depthRule:
      "Ask WHY + WHAT IF — edge cases, production consequences, tradeoffs between approaches",
    depthBad: "What is a memory leak?",
    depthGood:
      "A React component subscribes to a WebSocket in useEffect. Under what specific conditions does this cause a memory leak that survives component unmount?",
  },
  SDE3: {
    focus:
      "runtime internals, architectural tradeoffs, MAANG-level depth, cross-system reasoning",
    mcq: "runtime engine behaviour, memory model internals, distributed systems tradeoffs, compiler/interpreter decisions, performance at scale",
    forbidden:
      "ABSOLUTE BAN: anything a junior could answer, basic API questions, simple syntax, definitions — if a bootcamp graduate knows the answer it is DISQUALIFIED",
    benchmark:
      "questions that FAIL senior engineers in MAANG onsite rounds — ones that make 5+ year engineers pause and think hard",
    depthRule:
      "Ask HOW DOES IT ACTUALLY WORK INSIDE — engine internals, spec-level behaviour, architectural consequences",
    depthBad: "How does useState work under the hood?",
    depthGood:
      "React 18 batches setState calls inside setTimeout automatically. Explain the scheduler priority lane mechanism that enables this and why it breaks useSyncExternalStore in concurrent mode.",
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

// ─── Difficulty Labels ────────────────────────────────────────────────────────

const DIFFICULTY_BY_ROLE = {
  easy: {
    Internship: "Single concept, no tricks — basic syntax and definitions",
    SDE1: "How core features behave at runtime — not just what they are",
    SDE2: "Real implementation knowledge — requires hands-on experience to answer",
    SDE3: "Concepts juniors think they know but senior engineers have precise mental models of — deceptively simple surface, deep correct answer",
  },
  medium: {
    Internship: "Two concepts combined — simple real-world scenario",
    SDE1: "Requires understanding execution model, scope, or async behaviour",
    SDE2: "Production edge cases — unexpected behaviour under load or at scale",
    SDE3: "Stumps mid-level engineers — requires accurate model of runtime internals",
  },
  hard: {
    Internship:
      "Tricky but fair — edge case a prepared intern knows after studying",
    SDE1: "Questions junior devs consistently get wrong — prototype chain, event loop, closures",
    SDE2: "Startup onsite level — performance, security, architectural tradeoffs",
    SDE3: "MAANG onsite level — the question that ends interviews. If a senior dev can answer without hesitation it is TOO EASY",
  },
} as const;

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const generateTestPrompt = (
  domain: string,
  stack: string[],
  role: string,
  difficulty: "easy" | "medium" | "hard",
  neededCount: number,
  existingQuestions: Array<{ text: string }>,
): string => {
  const stackLabel = stack.join(", ");
  const roleKey = normalizeRole(role);
  const roleProfile = ROLE_DEPTH[roleKey];
  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;

  const domainKey = domain.toLowerCase().trim();
  const domainStyle =
    Object.entries(DOMAIN_STYLE).find(([key]) =>
      domainKey.includes(key) || key.includes(domainKey),
    )?.[1] ?? DEFAULT_DOMAIN_STYLE;

  const thisLevelInstruction = DIFFICULTY_BY_ROLE[difficulty][roleKey];

  const existingContext =
    existingQuestions.length > 0
      ? `ALREADY GENERATED — do NOT repeat or rephrase:\n${existingQuestions
          .slice(-8)
          .map((q, i) => `${i + 1}. "${q.text.slice(0, 60)}"`)
          .join("\n")}`
      : "";

  const stylePatterns =
    domainStyle.mode === "practical"
      ? `REQUIRED QUESTION PATTERNS — PRACTICAL MODE:
✓ "Why does [specific behaviour] occur when [specific condition] — and how does it differ from [alternative]?"
✓ "A team chooses [X] over [Y] for [specific use case]. What production problem does this introduce under [specific condition]?"
✓ "Given [real scenario], which approach avoids [specific failure mode] and why?"
✓ "Your system exhibits [symptom]. Trace the exact reason to a specific API/framework decision."
✓ "Under what conditions does [technology A] outperform [technology B] — and what breaks that advantage?"`
      : `REQUIRED QUESTION PATTERNS — THEORETICAL MODE:
✓ "Why does [mathematical/algorithmic property] cause [specific failure] in [specific scenario]?"
✓ "What assumption does [algorithm/model/protocol] make that is violated when [specific condition]?"
✓ "Two approaches: [A] and [B]. What theoretical property makes [A] correct for [constraint] and [B] correct for [other constraint]?"
✓ "What is the root cause — at the [mathematical/protocol/algorithmic] level — of [observed behaviour]?"
✓ "[Claim about a concept]. Under what precise conditions is this claim false?"`;

  const styleBannedPatterns =
    domainStyle.mode === "practical"
      ? `✗ "What is X?" — ask WHY or WHEN instead
✗ "Explain how X works" — ask what breaks when X is misused
✗ "What does X return?" — unless the answer requires deep mental model
✗ "Which library is used for X?" — trivia, not reasoning`
      : `✗ "How do you implement X in [library]?" — practical syntax, not theory
✗ "What function call does X?" — API trivia
✗ "Write code to do X" — this is MCQ, not coding
✗ "What is the default value of X?" — configuration trivia`;

  return `You are a brutal technical interviewer at a MAANG company screening ${role} candidates for ${domain} using ${stackLabel}.

ROLE: ${roleKey} | DIFFICULTY: ${difficulty.toUpperCase()} | DOMAIN: ${domain} | QUESTION STYLE: ${domainStyle.mode.toUpperCase()}

═══ ROLE PROFILE ═══
Focus: ${roleProfile.focus}
MCQ topics: ${roleProfile.mcq}
FORBIDDEN: ${roleProfile.forbidden}
Benchmark: ${roleProfile.benchmark}

═══ DEPTH RULE — NON-NEGOTIABLE ═══
${roleProfile.depthRule}

❌ TOO SHALLOW (instant disqualify): "${roleProfile.depthBad}"
✅ MINIMUM BAR: "${roleProfile.depthGood}"

Every question MUST be closer to ✅ than ❌.
Ask yourself: "Would a ${roleKey} candidate already know this without thinking?"
If YES → discard and write a harder one.

═══ DOMAIN STYLE DIRECTIVE ═══
${domainStyle.lens}

${stylePatterns}

BANNED IN THIS DOMAIN:
${styleBannedPatterns}

═══ THIS BATCH ═══
${thisLevelInstruction}
Stack-specific: target ${stackLabel} internals — not generic programming.

${existingContext}

═══ MCQ CONSTRUCTION RULES ═══
ALL questions are MCQ. Zero output/code-execution questions.

MCQ must follow ALL of these:
□ Question tests reasoning, not recall — the correct answer requires a mental model, not memorisation
□ All 4 options are plausible — someone who almost understands the topic should be tempted by at least 2 wrong options
□ Correct answer is unambiguous — only one defensible answer exists
□ Wrong options are specific misconceptions, not absurd distractors
□ No option should be obviously longer or more detailed than the others (a common correct-answer tell)
□ Do NOT use "All of the above" or "None of the above"
□ Options should be shuffled — correct answer must NOT always be the last option

BANNED QUESTION STARTERS:
✗ "What is the purpose of..."
✗ "What does X do?"
✗ "What is X?"
✗ "Which method is used to..."
✗ "What is the value of..." (for trivial/obvious code)
✗ "What is the maximum number of..."

═══ QUALITY GATES (apply to every question before output) ═══
□ Would a ${roleKey} interviewer at Google/Meta actually ask this?
□ Is it specific to ${stackLabel} — not a generic CS question any domain could ask?
□ Correct answer is unambiguous — only one defensible answer?
□ All wrong options are plausible enough to trap someone who partially understands?
□ Unique — not a rephrasing of any existing question?
□ ${roleKey === "SDE3" ? "Would a 5-year senior engineer need to think before answering? If NO → too easy → discard." : `Matches ${roleKey} depth — not too junior, not too senior?`}
□ Does the question match the ${domainStyle.mode.toUpperCase()} style directive above?

skillId: kebab-case slug e.g. "v8-hidden-classes", "react-fiber-reconciler", "grad-descent-convergence", "tls-handshake-rtt"

OUTPUT FORMAT — JSON only, no markdown:
{"questions":[{"skillId":"slug","level":${level},"text":"full question text","options":["option A","option B","option C","option D"],"correctAnswer":"exact text of correct option"}]}

Generate EXACTLY ${neededCount} questions now. Apply every quality gate. If a question fails any gate — replace it before outputting.`;
};

// ─── LLM Caller ──────────────────────────────────────────────────────────────

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

// ─── Main Export ──────────────────────────────────────────────────────────────

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
    text: string;
    options: string[];
    correctAnswer: string;
    level: number;
  };

  const allQuestions: PrismaQuestion[] = [];
  const seenHashes = new Set<string>();

  for (const { label, weight } of LEVEL_DISTRIBUTION) {
    const levelTarget = Math.max(1, Math.round(TARGET_COUNT * weight));
    let levelCount = 0;
    let emptyBatchStreak = 0;

    console.log(`\n📚 [${label.toUpperCase()}] Target: ${levelTarget} questions`);

    while (levelCount < levelTarget) {
      const remaining = levelTarget - levelCount;
      const batchSize = BATCH_SIZE[label];
      const neededNow = Math.min(batchSize, remaining);

      console.log(`  → Requesting batch of ${neededNow} (${levelCount}/${levelTarget} done)`);

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
          console.error(`  ❌ 3 empty batches in a row for [${label}] — moving on`);
          break;
        }
        await sleep(1000);
        continue;
      }

      emptyBatchStreak = 0;

      const validBatch: PrismaQuestion[] = [];

      for (const q of batch) {
        if (levelCount >= levelTarget) break;

        // ✅ FIX: only check for fields that actually exist in the response
        if (!q.text || !q.correctAnswer) continue;
        if (!Array.isArray(q.options) || q.options.length !== 4) continue;

        // ✅ FIX: hash only on text (no more q.code)
        const hash = hashQuestion(q.text);
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);

        validBatch.push({
          domain,
          stack,
          role,
          skillId: q.skillId || "general",
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          level: q.level ?? 0,
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
        console.log(`  ✓ Saved ${validBatch.length} → Total: ${allQuestions.length}/${TARGET_COUNT}`);
      }

      if (levelCount < levelTarget) {
        await sleep(1000);
      }
    }
  }

  console.log(`\n✅ Done. Generated ${allQuestions.length} questions total.`);
  return allQuestions;
};