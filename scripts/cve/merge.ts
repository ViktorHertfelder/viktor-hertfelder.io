import type { AffectedComponent, Vulnerability } from "./types.ts";

export function mergeVulnerabilityRecords(group: Vulnerability[]): Vulnerability {
  const preferred = [...group].sort((a, b) => completeness(b) - completeness(a))[0];
  const cve = group.flatMap((item) => [item.id, ...item.aliases]).find((id) => /^CVE-/i.test(id));
  return {
    ...preferred,
    id: cve ?? preferred.id,
    aliases: unique(group.flatMap((item) => [item.id, ...item.aliases])),
    affected: mergeAffected(group.flatMap((item) => item.affected)),
    cvssScore: Math.max(...group.map((item) => item.cvssScore ?? -1)) >= 0
      ? Math.max(...group.map((item) => item.cvssScore ?? -1))
      : undefined,
    severity: highestSeverity(group.map((item) => item.severity)),
    publishedAt: earliest(group.map((item) => item.publishedAt)),
    modifiedAt: latest(group.map((item) => item.modifiedAt)),
    exploitation: {
      knownExploited: group.some((item) => item.exploitation.knownExploited),
      ransomwareUse: group.find((item) => item.exploitation.ransomwareUse)?.exploitation.ransomwareUse,
      requiredAction: group.find((item) => item.exploitation.requiredAction)?.exploitation.requiredAction,
      dueDate: earliest(group.map((item) => item.exploitation.dueDate)),
    },
    references: uniqueBy(group.flatMap((item) => item.references), (reference) => `${reference.source}|${reference.url}`),
  };
}

function mergeAffected(items: AffectedComponent[]) {
  return uniqueBy(items, (item) =>
    [item.ecosystem, item.packageName, item.vendor, item.product].map(normalize).join("|"),
  ).map((base) => {
    const matching = items.filter((item) =>
      [item.ecosystem, item.packageName, item.vendor, item.product].map(normalize).join("|") ===
      [base.ecosystem, base.packageName, base.vendor, base.product].map(normalize).join("|"));
    return {
      ...base,
      affectedVersions: unique(matching.flatMap((item) => item.affectedVersions)),
      fixedVersions: unique(matching.flatMap((item) => item.fixedVersions)),
    };
  });
}

const severityOrder = ["unknown", "low", "moderate", "high", "critical"] as const;
function highestSeverity(values: Vulnerability["severity"][]) {
  return values.sort((a, b) => severityOrder.indexOf(b) - severityOrder.indexOf(a))[0];
}
function completeness(item: Vulnerability) {
  return item.description.length + item.affected.length * 100 + (item.cvssScore === undefined ? 0 : 500);
}
function normalize(value?: string) { return (value ?? "").trim().toLowerCase(); }
function unique<T>(items: T[]) { return [...new Set(items)]; }
function uniqueBy<T>(items: T[], key: (item: T) => string) {
  return [...new Map(items.map((item) => [key(item), item])).values()];
}
function earliest(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value)).sort()[0];
}
function latest(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value)).sort().at(-1);
}
