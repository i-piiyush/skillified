export type Question = {
  question: string,
  options: string[],
  jsonKey: string
};

export type LLMQuestion = {
  text?: string;
  options?: string[];
  correctAnswer?: string;
  level?: number;
  skillId?: string;
};