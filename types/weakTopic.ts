type TopResource = {
  type: string;
  title: string;
  url: string;
  source: string;
  whyChosen: string;
};

export type WeakTopic = {
  success: boolean;
  topic: string;
  difficulty: string;
  whyYouNeedToStudyThis: string;
  topResource: TopResource;
};
