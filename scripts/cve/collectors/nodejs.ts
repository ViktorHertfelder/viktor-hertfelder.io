import { fetchJson } from "../http.ts";
import type { Severity, Vulnerability } from "../types.ts";

export type NodeCoreAdvisory = {
  cve?: string[];
  ref?: string;
  vulnerable?: string;
  patched?: string;
  description?: string;
  overview?: string;
  severity?: string;
  published_at?: string;
  updated_at?: string;
};

type DirectoryEntry = { name: string; type: string; download_url: string | null };
const directoryUrl = "https://api.github.com/repos/nodejs/security-wg/contents/vuln/core?ref=main";
const rawPrefix = "https://raw.githubusercontent.com/nodejs/security-wg/main/vuln/core/";

export async function collectNodeAdvisories(token?: string): Promise<Vulnerability[]> {
  const { data: directory } = await fetchJson<DirectoryEntry[]>(directoryUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "hertfelder-cve-monitor",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  // GitHub's contents endpoint is capped at 1,000 entries; never silently accept a truncated listing.
  if (!Array.isArray(directory) || directory.length >= 1000) throw new Error("Node.js core advisory listing is invalid or potentially truncated.");
  const files = directory.filter((file) => file.type === "file" && /^\d+\.json$/.test(file.name));
  if (files.length === 0) throw new Error("Node.js core advisory listing is empty.");
  const result: Vulnerability[] = [];
  // Read individual reports; upstream's generated index can lag behind report files.
  for (let offset = 0; offset < files.length; offset += 8) {
    const records = await Promise.all(files.slice(offset, offset + 8).map(async (file) => {
      if (!file.download_url?.startsWith(rawPrefix)) throw new Error("Unexpected Node.js report download URL.");
      // The GitHub credential is deliberately not forwarded to the raw-download host.
      const { data } = await fetchJson<NodeCoreAdvisory>(file.download_url);
      return normalizeNodeAdvisory(data, file.name, file.download_url);
    }));
    result.push(...records.flat());
  }
  return result;
}

export function normalizeNodeAdvisory(advisory: NodeCoreAdvisory, filename: string, sourceUrl: string): Vulnerability[] {
  const cves = [...new Set((advisory.cve ?? []).map((id) => id.trim().toUpperCase())
    .filter((id) => /^CVE-\d{4}-\d{4,}$/.test(id)))];
  const ids = cves.length ? cves : [`NODEJS-${filename.replace(/\.json$/, "")}`];
  const rawSeverity = advisory.severity?.toLowerCase();
  const severity: Severity = rawSeverity === "medium" ? "moderate" :
    ["low", "moderate", "high", "critical"].includes(rawSeverity ?? "") ? rawSeverity as Severity : "unknown";
  // Some report files cover multiple distinct CVEs. A shared file is a reference,
  // not evidence that those CVEs are aliases of each other.
  return ids.map((id) => ({
    id, aliases: [id],
    title: advisory.description ?? id,
    description: advisory.overview ?? advisory.description ?? "",
    affected: [{
      vendor: "Node.js", product: "Node.js",
      affectedVersions: advisory.vulnerable ? [advisory.vulnerable] : [],
      fixedVersions: advisory.patched && !["none", "n/a"].includes(advisory.patched.toLowerCase()) ? [advisory.patched] : [],
    }],
    severity,
    // Do not manufacture publication/modification dates from crawl time.
    publishedAt: advisory.published_at,
    modifiedAt: advisory.updated_at,
    exploitation: { knownExploited: false },
    references: [
      { source: "nodejs", url: sourceUrl },
      ...(advisory.ref?.startsWith("https://") ? [{ source: "nodejs", url: advisory.ref }] : []),
    ],
  }));
}
