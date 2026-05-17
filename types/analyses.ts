export type AnswerWithSkill = {
  isCorrect: boolean;
  difficulty: number;
  skillId: string;
};

export type RoleReadiness = "ready" | "borderline" | "not_ready";

export type AnalysisResult = {
  roleReadiness: RoleReadiness;
  verdict: string;
  estimatedWeeks: number;
  weakTopics: string[];
  percentage: number;
  targetPercentage: number;
};