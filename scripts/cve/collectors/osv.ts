import { fetchJson } from "../http.ts";
import type { Severity, Vulnerability, Watchlist } from "../types.ts";

export type OsvAdvisory = {
  id: string;
  aliases?: string[];
  summary?: string;
  details?: string;
  published?: string;
  modified?: string;
  withdrawn?: string;
  database_specific?: { severity?: string };
  references?: Array<{ url: string }>;
  affected?: Array<{
    package: { ecosystem: string; name: string; purl?: string };
    versions?: string[];
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string; last_affected?: string; limit?: string }>;
    }>;
  }>;
};

export async function collectOsv(watchlist: Watchlist): Promise<Vulnerability[]> {
  const packages = new Map<string, { ecosystem: string; name: string }>();
  for (const entry of watchlist.entries) {
    if (entry.enabled === false || entry.matcher.type !== "package") continue;
    // GitHub calls this ecosystem "Packagist"; OSV uses "Packagist" as well.
    const { ecosystem, name } = entry.matcher;
    packages.set(`${ecosystem}:${name}`, { ecosystem, name });
  }
  const result: Vulnerability[] = [];
  const queue = [...packages.values()];
  // Small batches bound concurrent requests, including for larger private watchlists.
  for (let index = 0; index < queue.length; index += 3) {
    const batch = await Promise.all(queue.slice(index, index + 3).map(queryPackage));
    result.push(...batch.flat());
  }
  return result;
}

async function queryPackage(pkg: { ecosystem: string; name: string }): Promise<Vulnerability[]> {
  const items: Vulnerability[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 100; page += 1) {
    const { data } = await fetchJson<{ vulns?: OsvAdvisory[]; next_page_token?: string }>(
      "https://api.osv.dev/v1/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Query the package, not installed versions; no local version is transmitted.
        body: JSON.stringify({ package: pkg, ...(pageToken ? { page_token: pageToken } : {}) }),
      },
    );
    for (const advisory of data.vulns ?? []) {
      if (!advisory.withdrawn) items.push(normalizeOsv(advisory));
    }
    pageToken = data.next_page_token;
    if (!pageToken) return items;
  }
  throw new Error("OSV pagination safety limit reached; results are incomplete.");
}

export function normalizeOsv(advisory: OsvAdvisory): Vulnerability {
  const aliases = [...new Set([advisory.id, ...(advisory.aliases ?? [])])];
  const rawSeverity = advisory.database_specific?.severity?.toLowerCase();
  const severity: Severity = rawSeverity === "medium" ? "moderate" :
    ["low", "moderate", "high", "critical"].includes(rawSeverity ?? "") ? rawSeverity as Severity : "unknown";
  return {
    id: aliases.find((alias) => alias.startsWith("CVE-")) ?? advisory.id,
    aliases,
    title: advisory.summary ?? advisory.id,
    description: advisory.details ?? advisory.summary ?? "",
    affected: (advisory.affected ?? []).map((item) => ({
      ecosystem: item.package.ecosystem,
      packageName: item.package.name,
      purl: item.package.purl,
      affectedVersions: [
        ...(item.versions ?? []),
        ...(item.ranges ?? []).map((range) => `${range.type}: ${range.events.map((event) => {
          if (event.introduced !== undefined) return event.introduced === "0" ? "introduced: all prior versions" : `introduced: ${event.introduced}`;
          if (event.fixed) return `fixed (exclusive): ${event.fixed}`;
          if (event.last_affected) return `last affected (inclusive): ${event.last_affected}`;
          return `limit (exclusive): ${event.limit}`;
        }).join("; ")}`),
      ],
      // Git commit hashes are not release versions.
      fixedVersions: (item.ranges ?? []).filter((range) => range.type !== "GIT")
        .flatMap((range) => range.events.flatMap((event) => event.fixed ? [event.fixed] : [])),
    })),
    severity,
    publishedAt: advisory.published,
    modifiedAt: advisory.modified,
    exploitation: { knownExploited: false },
    references: [
      { source: "osv", url: `https://osv.dev/vulnerability/${encodeURIComponent(advisory.id)}` },
      ...(advisory.references ?? []).map((reference) => ({ source: "osv", url: reference.url })),
    ],
  };
}
