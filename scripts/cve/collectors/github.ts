import { fetchJson } from "../http.ts";
import type { Severity, Vulnerability } from "../types.ts";

type GitHubAdvisory = {
  ghsa_id: string;
  cve_id: string | null;
  summary: string;
  description: string;
  severity: string;
  published_at: string;
  updated_at: string;
  html_url: string;
  cvss?: { score?: number };
  vulnerabilities?: Array<{
    package: { ecosystem: string; name: string };
    vulnerable_version_range: string;
    first_patched_version: string | { identifier: string } | null;
  }>;
  references?: Array<string | { url: string }>;
};

export async function collectGitHubAdvisories(token?: string): Promise<Vulnerability[]> {
  const advisories: Vulnerability[] = [];
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "hertfelder-cve-monitor",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let page = 1; page <= 10; page += 1) {
    const url = `https://api.github.com/advisories?per_page=100&page=${page}&sort=updated&direction=desc`;
    const { data } = await fetchJson<GitHubAdvisory[]>(url, { headers });
    advisories.push(...data.map(normalizeGitHubAdvisory));
    if (data.length < 100) break;
  }

  return advisories;
}

function normalizeGitHubAdvisory(advisory: GitHubAdvisory): Vulnerability {
  const aliases = [advisory.ghsa_id, advisory.cve_id].filter((id): id is string => Boolean(id));
  return {
    id: advisory.cve_id ?? advisory.ghsa_id,
    aliases,
    title: advisory.summary,
    description: advisory.description,
    affected: (advisory.vulnerabilities ?? []).map((item) => ({
      ecosystem: item.package.ecosystem,
      packageName: item.package.name,
      affectedVersions: item.vulnerable_version_range ? [item.vulnerable_version_range] : [],
      fixedVersions: patchedVersion(item.first_patched_version)
        ? [patchedVersion(item.first_patched_version)!]
        : [],
    })),
    cvssScore: advisory.cvss?.score,
    severity: normalizeSeverity(advisory.severity),
    publishedAt: advisory.published_at,
    modifiedAt: advisory.updated_at,
    exploitation: { knownExploited: false },
    references: unique([
      advisory.html_url,
      ...(advisory.references ?? []).map((reference) =>
        typeof reference === "string" ? reference : reference.url),
    ].filter((url): url is string => Boolean(url))).map((url) => ({ source: "github", url })),
  };
}

function patchedVersion(value: string | { identifier: string } | null) {
  return typeof value === "string" ? value : value?.identifier;
}

function normalizeSeverity(value: string): Severity {
  return value === "medium" ? "moderate" :
    (["low", "moderate", "high", "critical"].includes(value) ? value as Severity : "unknown");
}

function unique(values: string[]) {
  return [...new Set(values)];
}
