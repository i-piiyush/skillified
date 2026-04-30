import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";

const ai = new GoogleGenAI({});

const hashQuestion = (text: string, code?: string | null) => {
  const base = code ? code : text;
  return base.toLowerCase().replace(/\s+/g, " ").trim();
};

// How to split 50 questions: 17 easy, 17 medium, 16 hard
const LEVEL_DISTRIBUTION = [
  { level: 0, label: "easy", weight: 0.34 }, // ~17/50
  { level: 1, label: "medium", weight: 0.34 }, // ~17/50
  { level: 2, label: "hard", weight: 0.32 }, // ~16/50
];

/**
 * Generates an optimized prompt for test question generation
 * Includes explicit difficulty guidance, format specs, and quality criteria
 */
const generateTestPrompt = (
  domain: string,
  stack: string,
  difficulty: "easy" | "medium" | "hard",
  neededCount: number,
  existingQuestions?: Array<{ text: string; code?: string }>,
): string => {
  const existingContext =
    existingQuestions && existingQuestions.length > 0
      ? `
ALREADY GENERATED QUESTIONS (avoid these):
${existingQuestions
  .slice(0, 10) // Show only recent 10 to save tokens
  .map(
    (q, i) =>
      `${i + 1}. "${q.text.slice(0, 50)}..."${q.code ? ` [with code]` : ""}`,
  )
  .join("\n")}

CRITICAL: Do not regenerate or rephrase these. Create entirely new questions.`
      : "";

  const difficultyGuidance: Record<string, string> = {
    easy: `
EASY LEVEL REQUIREMENTS:
- Fundamental concepts, basic syntax, definitions
- Single concept per question
- No edge cases or tricky logic
- Example: "What does the keyword 'async' do in JavaScript?"
- Include recognition/recall questions (fill-the-blank, definition matching)
- Accuracy: Test foundational understanding, not problem-solving`,
    medium: `
MEDIUM LEVEL REQUIREMENTS:
- Combine 2-3 concepts, real-world scenarios
- Require understanding of interactions & trade-offs
- Real code patterns from the stack
- Example: "How do you handle async errors in ${stack}?"
- Include scenario-based questions
- Accuracy: Test application and integration of concepts`,
    hard: `
HARD LEVEL REQUIREMENTS:
- Edge cases, optimization, architectural decisions
- Require deep domain knowledge + problem-solving
- Production-level scenarios
- Example: "Given [complex scenario], optimize for [constraint]"
- Include debugging & code-reading questions
- May have subtle "gotcha" correct answers
- Accuracy: Test mastery, optimization mindset, real-world debugging`,
  };

  return `You are an expert technical test creator for ${domain} development using ${stack}.

TASK: Generate EXACTLY ${neededCount} unique, non-repetitive ${difficulty.toUpperCase()} level questions. DO NOT STOP EARLY.

DOMAIN: ${domain}
TECH STACK: ${stack}
DIFFICULTY LEVEL: ${difficulty}
QUESTION COUNT NEEDED: ${neededCount}
${existingContext}

═══════════════════════════════════════════════════════════════════════════

${difficultyGuidance[difficulty]}

═══════════════════════════════════════════════════════════════════════════

QUALITY STANDARDS:
✓ Each question tests a DIFFERENT concept or scenario
✓ No two questions should have the same core question being asked
✓ Questions are specific to ${stack} when applicable
✓ Answers are definitively correct (not opinion-based)
✓ Language is clear, professional, and unambiguous
✓ Code examples (if included) follow ${stack} best practices
✓ MCQ options are plausible but clearly distinguishable

QUESTION COMPOSITION:
- 50% MCQ (Multiple Choice Questions) - with 4 options each, only 1 correct. Conceptual questions MUST be MCQs.
- 50% OUTPUT (Strictly code execution output) - expecting an exact literal value only.

MCQ GUIDELINES:
- Option A: Most common wrong answer (plausible mistake)
- Option B: Second most common wrong answer
- Option C: Less plausible but sounds technical
- Option D: Correct answer OR distributed across A-D for variety
- Avoid: "All of above", "None of above", "A and B"

OUTPUT QUESTION GUIDELINES (STRICTLY ENFORCED):
- MUST be literal code output questions. Ask: "What will this code print/return?" or "What is the exact output?"
- The \`correctAnswer\` MUST be ONLY the exact literal output (e.g., "phew", "42", "undefined", "[1, 2, 3]").
- STRICTLY NO explanations, NO sentences, NO context. Just the exact output string.
- If the code throws an error, the \`correctAnswer\` should be the exact error name (e.g., "TypeError").

DIVERSITY TARGETS:
- Cover different subsystems/modules of ${domain}
- Mix question types: pure knowledge, scenario-based, debugging, optimization
- Vary code snippet lengths (some short snippets, some with context)

STACK-SPECIFIC CONTEXT:
- Reference ${stack} conventions, libraries, patterns
- Include common ${stack} pitfalls and best practices
- Use realistic ${stack} code scenarios

═══════════════════════════════════════════════════════════════════════════

RESPONSE FORMAT (STRICT JSON):
{
  "questions": [
    {
      "id": "auto-generated-uuid",
      "type": "mcq" or "output",
      "level": ${difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2},
      "text": "Clear, specific question text",
      "code": "code snippet if applicable, null otherwise",
      "options": ["Option A", "Option B", "Option C", "Option D"] or null for output,
      "correctAnswer": "The exact correct answer (literal phrase/value for 'output' type)"
    }
  ]
}

- All string values (especially the "code" field) MUST properly escape all double quotes (\") and newlines (\n).
- NEVER use raw multi-line strings for the "code" field. It must be a single-line string with \n characters.

CRITICAL CHECKLIST BEFORE RESPONDING:
□ Total questions generated MUST BE EXACTLY = ${neededCount}. Do not truncate the list!
□ Each question is unique (different concept/scenario)
□ JSON is valid and parseable
□ correctAnswer for 'output' type contains NO explanations, ONLY the exact output
□ Code examples (if any) are syntactically valid

NOW GENERATE EXACTLY ${neededCount} QUESTIONS:`;
};

export const fetchTest = async (
  domain: string,
  targetCount = 50,
  stack: string,
) => {
  const allQuestions: any[] = [];
  const seenHashes = new Set<string>();

  for (const { level, label, weight } of LEVEL_DISTRIBUTION) {
    const levelTarget = Math.max(1, Math.round(targetCount * weight));
    let levelQuestionsCount = 0;
    let attempts = 0;
    const maxAttempts = 5; // Increased attempts just in case it drops one or two duplicates

    if (allQuestions.length >= targetCount) break;

    while (levelQuestionsCount < levelTarget && attempts < maxAttempts) {
      attempts++;
      const neededNow = levelTarget - levelQuestionsCount;

      const prompt = generateTestPrompt(
        domain,
        stack,
        label as "easy" | "medium" | "hard",
        neededNow,
        allQuestions,
      );
      // Helper function to pause execution
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      try {
        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            maxOutputTokens: 8192, // Ensure it doesn't cut off early due to token limits
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  minItems: neededNow, // STRICT SCHEMA CONSTRAINT
                  maxItems: neededNow, // STRICT SCHEMA CONSTRAINT
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      domain: { type: "string" },
                      skillId: { type: "string" },
                      type: { type: "string", enum: ["mcq", "output"] },
                      level: { type: "number" },
                      text: { type: "string" },
                      code: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correctAnswer: { type: "string" },
                    },
                    required: ["type", "level", "text", "correctAnswer"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        });

        const responseText = result.text;
        if (!responseText) throw new Error("Empty response");
        let parsed;
        try {
          parsed = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ JSON Parse Failed!");
          console.error("Raw LLM Output that caused the crash:", responseText);
          throw parseError; // Re-throw to trigger the retry loop
        }

        const batch = parsed.questions ?? [];

        for (const q of batch) {
          if (allQuestions.length >= targetCount) break;
          if (levelQuestionsCount >= levelTarget) break; // Prevent overfilling if neededNow was calculated

          const hash = hashQuestion(q.text, q.code);
          if (!seenHashes.has(hash)) {
            seenHashes.add(hash);
            allQuestions.push({
              ...q,
              id: uuidv4(),
              domain,
              level: level,
            });
            levelQuestionsCount++;
          }
        }

        await sleep(2000)
      } catch (err) {
        console.error(`Level ${label} attempt ${attempts} failed:`, err);
      }
    }
  }

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
      model: "gemini-3-flash-preview",
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
