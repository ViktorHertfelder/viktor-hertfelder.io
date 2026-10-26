import type { RelevantVulnerability } from "./types.ts";

const severityScore = { unknown: 5, low: 10, moderate: 30, high: 60, critical: 85 };

export function rankVulnerability(item: RelevantVulnerability): number {
  let score = severityScore[item.severity];
  if (item.cvssScore !== undefined) score = Math.max(score, Math.round(item.cvssScore * 9));
  if (item.exploitation.knownExploited) score += 35;
  if (item.exploitation.ransomwareUse?.toLowerCase() === "known") score += 10;
  if (item.affected.some((affected) => affected.fixedVersions.length === 0)) score += 3;
  if (item.publishedAt) {
    const ageDays = (Date.now() - Date.parse(item.publishedAt)) / 86_400_000;
    if (ageDays <= 7) score += 10;
    else if (ageDays <= 30) score += 5;
  }
  return score;
}
