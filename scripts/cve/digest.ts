import type { RelevantVulnerability } from "./types.ts";

export function buildPlainTextDigest(items: RelevantVulnerability[], generatedAt: string): string {
  const exploited = items.filter((item) => item.exploitation.knownExploited).length;
  const important = items.filter((item) => item.severity === "critical" || item.severity === "high").length;
  const lines = [
    "Personal CVE Monitor",
    `Generated: ${generatedAt}`,
    `${items.length} new or materially updated advisories · ${important} high/critical · ${exploited} known exploited`,
    "",
  ];

  items.forEach((item, index) => {
    const technologies = [...new Set(item.matches.map((match) => match.technology))].join(", ");
    const affected = item.affected.flatMap((component) => component.affectedVersions).join(", ") || "not specified by source";
    const fixed = item.affected.flatMap((component) => component.fixedVersions).join(", ") || "not available";
    lines.push(
      `${index + 1}. ${item.id} — ${item.title}`,
      `   Risk: ${item.severity.toUpperCase()}${item.cvssScore === undefined ? "" : ` · CVSS ${item.cvssScore}`} · score ${item.riskScore}`,
      `   Technology: ${technologies}`,
      `   Published: ${item.publishedAt ?? "unknown"}`,
      `   Known exploited: ${item.exploitation.knownExploited ? "YES" : "no evidence in configured sources"}`,
      `   Affected: ${affected}`,
      `   Fixed: ${fixed}`,
      `   Action: ${recommendedAction(item)}`,
      ...item.references.slice(0, 3).map((reference) => `   Source: ${reference.url}`),
      "",
    );
  });

  lines.push("Absence from this digest does not prove that a technology is unaffected.");
  return lines.join("\n");
}

function recommendedAction(item: RelevantVulnerability) {
  if (item.exploitation.requiredAction) return item.exploitation.requiredAction;
  const fixes = item.affected.flatMap((component) => component.fixedVersions);
  if (fixes.length > 0) return `Upgrade to a fixed version (${[...new Set(fixes)].join(", ")}) after testing.`;
  return "Review the linked vendor guidance and assess exposure; no supported fixed version was provided.";
}
