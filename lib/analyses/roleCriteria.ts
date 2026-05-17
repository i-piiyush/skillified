export const ROLE_CRITERIA = {
  "Internship": {
    minPercentage: 40,
    label: "Internship",
    description: "Entry level, foundational concepts expected"
  },
  "SDE1": {
    minPercentage: 55,
    label: "SDE 1",
    description: "Junior developer, can work independently on features"
  },
  "SDE2": {
    minPercentage: 70,
    label: "SDE 2",
    description: "Mid level, leads features, strong fundamentals"
  },
  "SDE3": {
    minPercentage: 85,
    label: "SDE 3",
    description: "Senior, system design + deep expertise expected"
  },
} as const;

export type Role = keyof typeof ROLE_CRITERIA;