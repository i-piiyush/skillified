
export type TopicType = "PRACTICAL" | "DSA" | "SYSTEM_DESIGN";

export interface RoadmapTopic {
  id: string;
  type: TopicType;
  name: string;
  depth: number;
  focusedHours: number;
  focus: string[];
  avoid: string[];
  projects: string[];
  easyQuestions: number | null;
  mediumQuestions: number | null;
}

export interface Roadmap {
  id: string;
  estimatedMonths: number;
  practicalWeight: number;
  dsaWeight: number;
  systemDesignWeight: number;
  topics: RoadmapTopic[];
}
