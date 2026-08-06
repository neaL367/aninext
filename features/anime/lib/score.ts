export function scoreColor(score?: number) {
  if (!score) return "text-score-low";
  if (score >= 75) return "text-score-high";
  if (score >= 50) return "text-score-mid";
  return "text-score-low";
}
