import type {
  MatchReason,
  RelevantVulnerability,
  Severity,
  Vulnerability,
  Watchlist,
  WatchlistEntry,
} from "./types.ts";
import { rankVulnerability } from "./risk.ts";

const severityRank: Record<Severity, number> = {
  unknown: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export function applyWatchlist(
  vulnerabilities: Vulnerability[],
  watchlist: Watchlist,
): { matches: RelevantVulnerability[]; warnings: string[] } {
  const warnings: string[] = [];
  const enabledEntries = watchlist.entries.filter((entry) => entry.enabled !== false);

  for (const entry of enabledEntries) {
    if (entry.matcher.type === "unsupported") {
      warnings.push(`Watchlist entry "${entry.id}" is unsupported: ${entry.matcher.description}`);
    }
  }

  const matches = vulnerabilities.flatMap((vulnerability) => {
    const reasons = enabledEntries.flatMap((entry) => matchEntry(vulnerability, entry));
    if (reasons.length === 0) return [];
    const relevant = { ...vulnerability, matches: reasons, riskScore: 0 };
    relevant.riskScore = rankVulnerability(relevant);
    return [relevant];
  });

  return { matches: matches.sort((a, b) => b.riskScore - a.riskScore), warnings };
}

function matchEntry(vulnerability: Vulnerability, entry: WatchlistEntry): MatchReason[] {
  if (entry.matcher.type === "unsupported") return [];
  const matcher = entry.matcher;
  const identifiers = new Set([vulnerability.id, ...vulnerability.aliases].map(normalize));
  if (entry.exclude?.advisoryIds?.some((id) => identifiers.has(normalize(id)))) return [];

  const explicitlyIncluded = entry.include?.advisoryIds?.some((id) => identifiers.has(normalize(id)));
  const minimumSeverity = entry.minimumSeverity ?? "moderate";
  if (!explicitlyIncluded && severityRank[vulnerability.severity] < severityRank[minimumSeverity] &&
      !vulnerability.exploitation.knownExploited) return [];

  const components = vulnerability.affected.filter((affected) => {
    if (matcher.type === "package") {
      return normalize(affected.ecosystem) === normalize(matcher.ecosystem) &&
        normalize(affected.packageName) === normalize(matcher.name);
    }
    return [matcher, ...(matcher.aliases ?? [])].some((identifier) =>
      normalize(affected.product) === normalize(identifier.product) &&
      (!identifier.vendor || normalize(affected.vendor) === normalize(identifier.vendor)),
    );
  });

  if (components.length === 0 && !explicitlyIncluded) return [];
  const technology = matcher.type === "package"
    ? `${matcher.ecosystem}:${matcher.name}`
    : [matcher.vendor, matcher.product].filter(Boolean).join("/");

  return [{
    watchlistId: entry.id,
    category: entry.category,
    technology,
    installedVersion: entry.installedVersion,
    // Source ranges are deliberately not guessed without an ecosystem-aware range parser.
    versionStatus: entry.installedVersion ? "unknown" : "not-specified",
  }];
}

function normalize(value?: string) {
  return (value ?? "").trim().toLocaleLowerCase("en-US");
}
