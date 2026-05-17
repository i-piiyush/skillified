export type QuestionType = "mcq" | "output";

export type Question = {
  id: string;
  text: string;
  code: string | null;
  type: QuestionType;
  options: string[];    
  skillId: string;
  level: 0 | 1 | 2;
};