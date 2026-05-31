type WeakTopic = {
  createdAt: string;
  id: string;
  topic: string;
  userId: string;
  whyYouNeedToStudyThis: string;
};

export type UserProfile = {
  id: string;
  name: string;
  domain: string;
  role: string;
  level: number;
  latestScore: number;
  roleReadiness: "not_ready" | "ready" | " borderline";
  stack: string[];
  weakTopicNames: string[];
  weakTopics: WeakTopic[];
};
