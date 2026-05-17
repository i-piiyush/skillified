import { AnswerWithSkill } from "@/types/analyses";
export const getWeakTopics = (answers: AnswerWithSkill[]): string[] => {
  const skillMap: Record<
    string,
    { correct: number; wrong: number; wrongWeight: number }
  > = {};
  for (const answer of answers) {
    if (!skillMap[answer.skillId]) {
      skillMap[answer.skillId] = { correct: 0, wrong: 0, wrongWeight: 0 };
    }
    if (answer.isCorrect) {
      skillMap[answer.skillId].correct++;
    } else {
      skillMap[answer.skillId].wrong++;
      skillMap[answer.skillId].wrongWeight += answer.difficulty + 1;
    }
    
  }
  const weakTopics: string[] = [];
  for (const [skillId, stats] of Object.entries(skillMap)) {
    const total = stats.correct + stats.wrong;
    const wrongRate = stats.wrong / total;

    if (wrongRate > 0.5 || stats.wrongWeight >= 3) {
      weakTopics.push(skillId);
    }
  }

  return weakTopics.sort(
    (a, b) => skillMap[b].wrongWeight - skillMap[a].wrongWeight,
  );
};
