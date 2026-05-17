import Groq from "groq-sdk";
import { prisma } from "./prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TARGET_COUNT = 50;

const BATCH_SIZE = {
  easy:   10,
  medium: 8,
  hard:   4,
} as const;

const LEVEL_DISTRIBUTION = [
  { level: 0, label: "easy" as const,   weight: 0.34 },
  { level: 1, label: "medium" as const, weight: 0.33 },
  { level: 2, label: "hard" as const,   weight: 0.33 },
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
  "DevOps": [
    "docker + kubernetes + jenkins",
    "aws + terraform + ansible",
    "github actions + docker + aws",
    "gitlab ci + docker + kubernetes",
    "azure devops + terraform + docker",
  ],
  "Cybersecurity": [
    "python + kali linux + metasploit",
    "python + wireshark + burp suite",
    "python + nmap + nessus",
    "bash + kali linux + open vas",
  ],
  "Blockchain": [
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

const generateTestPrompt = (
  domain: string,
  stack: string[],
  role: string,
  difficulty: "easy" | "medium" | "hard",
  neededCount: number,
  existingQuestions: Array<{ text: string; code?: string | null }>,
): string => {
  const stackLabel = stack.join(", ");

  const existingContext =
    existingQuestions.length > 0
      ? `
ALREADY GENERATED (do NOT repeat or rephrase these):
${existingQuestions
  .slice(-10)
  .map((q, i) => `${i + 1}. "${q.text.slice(0, 60)}"`)
  .join("\n")}`
      : "";

  const difficultyGuidance = {
    easy: `
EASY LEVEL:
- Fundamental concepts, basic syntax, definitions
- Single concept per question, no edge cases
- Test foundational understanding`,
    medium: `
MEDIUM LEVEL:
- Combine 2-3 concepts, real-world scenarios
- Require understanding of interactions & trade-offs
- Test application and integration of concepts`,
    hard: `
HARD LEVEL:
- Edge cases, optimization, architectural decisions
- Production-level scenarios, debugging questions
- Test mastery and real-world problem-solving
- Keep code snippets under 15 lines — test concept depth not code length`,
  };

  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;

  return `You are a technical interviewer for ${domain} (${stackLabel}) creating questions for a ${role} position.

Generate EXACTLY ${neededCount} ${difficulty.toUpperCase()} questions. DO NOT STOP EARLY.
${existingContext}

${difficultyGuidance[difficulty]}

QUESTION TYPES (split evenly):
- MCQ: 4 short plain-text options, exactly 1 correct.
- OUTPUT: ONLY "What does this code print/return?" where answer is one word or value a user can type exactly.

MCQ RULES (CRITICAL):
- "options" array must contain full text of each option — NEVER letters like "A", "B", "C", "D"
- "correctAnswer" MUST be the exact full text of one of the 4 options, copied character-for-character
- NEVER use "A", "B", "C", "D" as correctAnswer — always the full option text
- Correct: options: ["15", "undefined", "NaN", "ReferenceError"], correctAnswer: "NaN"
- Wrong:   options: ["15", "undefined", "NaN", "ReferenceError"], correctAnswer: "C"

OUTPUT RULES (CRITICAL):
- correctAnswer must be a SINGLE word or value — NO newlines, NO \n, NO multi-line
- If output spans multiple lines → make it MCQ instead
- Only use output type for: "42", "true", "NaN", "TypeError", "undefined", "hello"
- Code MUST be self-contained and directly executable
- Scenario/conceptual questions → always MCQ, never output
- When in doubt → MC

SKILL ID: kebab-case e.g. "js-closures", "react-hooks", "node-event-loop"



RESPONSE — valid JSON only, no markdown, no backticks:
{
  "questions": [
    {
      "skillId": "topic-slug",
      "type": "mcq",
      "level": ${level},
      "text": "Question text here",
      "code": "",
      "options": ["wrong", "wrong", "wrong", "correct"],
      "correctAnswer": "correct"
    },
    {
      "skillId": "topic-slug",
      "type": "output",
      "level": ${level},
      "text": "What is the output of this code?",
      "code": "console.log(1 + '2');",
      "options": [],
      "correctAnswer": "12"
    }
  ]
}

Generate EXACTLY ${neededCount} questions now:`;
};

async function callLLM(
  prompt: string,
  neededNow: number,
): Promise<any[]> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a technical question generator. Always respond with valid JSON only. No markdown, no backticks, no explanation.",
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

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      return parsed.questions ?? [];

    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes("rate_limit");

      if (is429) {
        const wait = 5000 * Math.pow(2, attempt - 1);
        console.warn(`⏳ Rate limited (attempt ${attempt}). Waiting ${wait / 1000}s...`);
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

