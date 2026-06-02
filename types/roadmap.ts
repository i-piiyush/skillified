export type Roadmap = {
  estimatedMonths: number;

  practicalWeight: number;
  dsaWeight: number;
  systemDesignWeight: number;

  practicalTopics: PracticalTopic[];

  dsaTopics: DsaTopic[] | null;

  systemDesignTopics: SystemDesignTopic[] | null;
};

export type PracticalTopic = {
  name: string;
  depth: number;
  focusedHours: number;

  focus: string[];
  avoid: string[];
  projects: string[];
};

export type DsaTopic = {
  name: string;
  depth: number;
  focusedHours: number;

  totalQuestion: {
    easy: number;
    medium: number;
  };
};

export type SystemDesignTopic = {
  name: string;
  depth: number;
  focusedHours: number;

  focus: string[];
  avoid: string[];
};
