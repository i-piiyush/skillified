import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma";

const ai = new GoogleGenAI({});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TARGET_COUNT = 10;
const BATCH_SIZE = 10;

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
  stack: string[],          // ← string[]
  role: string,
  difficulty: "easy" | "medium" | "hard",
  neededCount: number,
  existingQuestions: Array<{ text: string; code?: string | null }>,
): string => {
  const stackLabel = stack.join(", ");  // ← join for prompt display

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
- Test mastery and real-world problem-solving`,
  };

  const level = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;

  return `You are a technical interviewer for ${domain} (${stackLabel}) creating questions for a ${role} position.

Generate EXACTLY ${neededCount} ${difficulty.toUpperCase()} questions. DO NOT STOP EARLY.
${existingContext}

${difficultyGuidance[difficulty]}

QUESTION TYPES (split evenly):
- MCQ: 4 short plain-text options, exactly 1 correct. Distribute correct answer across A/B/C/D.
- OUTPUT: "What does this code output?" — correctAnswer is ONLY the exact output value.

RULES:
- MCQ options: short plain strings only. NO arrays, NO JSON inside options.
- OUTPUT options: must be empty array [].
- OUTPUT correctAnswer: scalar only — "42", "undefined", "true", "TypeError". NO long arrays.
- skillId: kebab-case topic e.g. "js-closures", "react-hooks", "node-event-loop"

CODE FIELD RULES (critical to avoid JSON errors):
- If question needs code: write it as a plain string with literal newlines escaped as \\n
- Escape any double quotes inside code as \\"
- Keep code snippets SHORT (under 10 lines) to avoid truncation
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
      "options": ["wrong answer", "wrong answer", "wrong answer", "correct answer"],
      "correctAnswer": "correct answer"
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

async function callGemini(prompt: string, neededNow: number): Promise<any[]> {
  const MAX_RETRIES = 4;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                minItems: neededNow,
                maxItems: neededNow,
                items: {
                  type: "object",
                  properties: {
                    skillId:       { type: "string" },
                    type:          { type: "string", enum: ["mcq", "output"] },
                    level:         { type: "number" },
                    text:          { type: "string" },
                    code:          { type: "string" },
                    options:       { type: "array", items: { type: "string" } },
                    correctAnswer: { type: "string" },
                  },
                  required: ["skillId", "type", "level", "text", "code", "correctAnswer", "options"],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      const text = result.text;
      if (!text) throw new Error("Empty response from Gemini");

      const clean = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      const parsed = JSON.parse(clean);
      return parsed.questions ?? [];

    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (is429) {
        const wait = 10_000 * Math.pow(2, attempt - 1);
        console.warn(`⏳ Rate limited (attempt ${attempt}/${MAX_RETRIES}). Waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }

      console.error(`❌ Attempt ${attempt} failed: ${err?.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(3000);
        continue;
      }

      return [];
    }
  }

  return [];
}

export const fetchTest = async (
  domain: string,
  stack: string[],          // ← string[]
  role: string,
  onProgress?: (saved: number, total: number) => void,
) => {
  type PrismaQuestion = {
    domain: string;
    stack: string[];          // ← string[]
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
      const neededNow = Math.min(BATCH_SIZE, remaining);

      console.log(`  → Requesting batch of ${neededNow} (${levelCount}/${levelTarget} done)`);

      const prompt = generateTestPrompt(
        domain,
        stack,          // ← pass array directly, no stack[]
        role,
        label,
        neededNow,
        allQuestions,
      );

      const batch = await callGemini(prompt, neededNow);

      if (batch.length === 0) {
        emptyBatchStreak++;
        console.warn(`  ⚠️ Empty batch (streak: ${emptyBatchStreak})`);
        if (emptyBatchStreak >= 3) {
          console.error(`  ❌ 3 empty batches in a row for [${label}] — moving on`);
          break;
        }
        await sleep(5000);
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
          stack,          // ← string[] passed directly, Prisma handles it
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
        await sleep(7000);
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
- Each stack should be a short, recognizable label like "MERN", "Next.js + PostgreSQL", "Kali Linux + Python"
- Return only stack names/labels, no explanations or descriptions
- Each stack should be practical and commonly used in industry

RESPONSE FORMAT (STRICT JSON):
{
  "stack": ["Stack 1", "Stack 2", "Stack 3", ...]
}

Now suggest relevant stacks for: "${domain}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            stack: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 6,
            },
          },
          required: ["stack"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.log("error generating stack... ", err);
    return { stack: [] };
  }
};