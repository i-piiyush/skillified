import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Simple hash to detect duplicate questions
const hashQuestion = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

export const fetchTest = async (
  domain: string,
  targetCount = 50
) => {
  const allQuestions= [];
  const seenHashes = new Set<string>();
  let attempts = 0;
  const maxAttempts = 4; // avoid infinite loop

  while (allQuestions.length < targetCount && attempts < maxAttempts) {
    const needed = targetCount - allQuestions.length;
    attempts++;

    console.log(`Attempt ${attempts}: generating ${needed} questions...`);

    // Pass already-generated question texts so Gemini avoids repeating them
    const existingTexts =
      allQuestions.length > 0
        ? `\nAlready generated questions (DO NOT repeat these topics):\n${allQuestions
            .map((q, i) => `${i + 1}. ${q.text}`)
            .join("\n")}`
        : "";

    const prompt = `Generate exactly ${needed} unique test questions for domain: "${domain}".

Rules:
- Mix: roughly 60% 'mcq' (conceptual) and 40% 'output' (predict the code output).
- Each question must test a DIFFERENT specific skill.
- For 'mcq': exactly 4 options, correctAnswer must exactly match one option.
- For 'output': options must be null, correctAnswer is exact output.
- No repeated concepts, patterns, or phrasing.
${existingTexts}

Return JSON array of ${needed} question objects with: id (uuid v4), domain, skillId, type, text, options, correctAnswer.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    domain: { type: "string" },
                    skillId: { type: "string" },
                    type: { type: "string", enum: ["mcq", "output"] },
                    text: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      nullable: true,
                    },
                    correctAnswer: { type: "string" },
                  },
                  required: [
                    "id", "domain", "skillId", "type", "text", "correctAnswer",
                  ],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      const batch = parsed.questions ?? [];

      for (const q of batch) {
        const hash = hashQuestion(q.text);

        // Deduplicate by question text hash
        if (!seenHashes.has(hash)) {
          seenHashes.add(hash);
          allQuestions.push({
            ...q,
            id: uuidv4(), // don't trust Gemini for UUIDs either
            domain,
            options: q.type === "output" ? null : q.options,
          });
        } else {
          console.log(`Duplicate skipped: "${q.text.slice(0, 60)}..."`);
        }

        if (allQuestions.length >= targetCount) break;
      }
    } catch (err) {
      console.error(`Attempt ${attempts} failed:`, err);
    }
  }

  if (allQuestions.length < targetCount) {
    console.warn(
      `Only generated ${allQuestions.length}/${targetCount} unique questions after ${maxAttempts} attempts`
    );
  }

  return allQuestions;
};