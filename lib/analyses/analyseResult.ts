import { Role, ROLE_CRITERIA } from "./roleCriteria";

export const analyseResult = (
  percentage: number,
  role: Role,
  weakTopics: string[],
) => {
  const criteria = ROLE_CRITERIA[role];
  const gap = criteria.minPercentage - percentage;

  let roleReadiness: "ready" | "borderline" | "not_ready";
  let verdict: string;
  let estimatedWeeks: number;

  if (percentage >= criteria.minPercentage) {
    roleReadiness = "ready";
    verdict = `You meet the bar for ${criteria.label}!`;
    estimatedWeeks = 0;
  } 

  else if (gap <= 15) {
    roleReadiness = "borderline";
    verdict = `You're close to ${criteria.label} level — ${gap}% gap to close`;
    estimatedWeeks = Math.ceil(gap / 5); // rough: ~5% per week of focused study
  } 

  else {
    roleReadiness = "not_ready";
    verdict = `Keep building — you need ${gap}% more to hit ${criteria.label} level`;
    estimatedWeeks = Math.ceil(gap / 5);
  }

  return {
    roleReadiness,
    verdict,
    estimatedWeeks,
    weakTopics, 
    percentage,
    targetPercentage: criteria.minPercentage,
  };
};
