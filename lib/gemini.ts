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
- MCQ: 4 short plain-text options, exactly 1 correct. Distribute correct answer across A/B/C/D.
- OUTPUT: ONLY "What does this code print/return?" where answer is a single scalar a user can type exactly.

STRICT OUTPUT RULES:
- Code MUST be self-contained and directly executable
- correctAnswer MUST be exactly what console.log/return prints — e.g. "42", "true", "null", "TypeError"
- If answer requires more than 10 characters to type → make it MCQ instead
- Scenario questions ("what happens if X fails") → always MCQ
- Conceptual questions ("what is the expected state") → always MCQ
- When in doubt → MCQ

SKILL ID: kebab-case e.g. "js-closures", "react-hooks", "node-event-loop"

CODE FIELD RULES:
- Escape newlines as \\n, escape double quotes as \\"
- Keep code under 15 lines to avoid truncation
- If no code needed: use empty string ""

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

export const fetchStack = async (domain: string) => {
  try {
    const prompt = `You are a technology advisor for developers learning new domains.

TASK: Suggest the most popular and relevant tech stacks for "${domain}" in ${new Date().getFullYear()}.

GUIDELINES:
- Return as many as genuinely exist (minimum 1, maximum 6)
- Do NOT force 6 if fewer are relevant — quality over quantity
- If the domain has fewer distinct stacks (like Cyber Security), return only the real ones
- Each stack should be practical and commonly used in industry

STRICT FORMAT RULES (critical):
- Always use full technology names — NO abbreviations or acronyms
- NEVER use: MERN, MEAN, LAMP, JAM, MEVN, or any other acronym
- Always use lowercase
- Separate technologies with " + "
- Examples of correct format:
  ✓ "mongodb + express js + react js + node js"
  ✓ "mongodb + next js + node js"
  ✓ "postgresql + express js + angular + node js"
  ✓ "python + django + postgresql"
  ✓ "python + fast api + mongodb"

Respond with valid JSON only:
{ "stack": ["stack 1", "stack 2", ...] }

Now suggest relevant stacks for: "${domain}"`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a technology advisor. Always respond with valid JSON only. No markdown, no backticks. Always use full lowercase technology names separated by ' + '. Never use acronyms like MERN, MEAN, LAMP.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response");

    const parsed = JSON.parse(text);

    // Safety net — normalize on our side too in case model slips
    const normalized = parsed.stack.map((s: string) =>
      s.toLowerCase().trim()
    );

    return { stack: normalized };
  } catch (err) {
    console.log("error generating stack... ", err);
    return { stack: [] };
  }
};