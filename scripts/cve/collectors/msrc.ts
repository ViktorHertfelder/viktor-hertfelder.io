import { fetchJson, HttpError } from "../http.ts";
import type { Severity, Vulnerability } from "../types.ts";

type Product = { ProductID: string; Value: string; CPE?: string };
type TextValue = { Value?: string };
type MsrcVulnerability = {
  CVE: string;
  Title?: TextValue;
  Notes?: Array<{ Title?: string; Type: number; Value?: string }>;
  ProductStatuses?: Array<{ Type: number; ProductID: string[] }>;
  Threats?: Array<{ Type: number; Description?: TextValue; ProductID?: string[] }>;
  CVSSScoreSets?: Array<{ BaseScore?: number; ProductID?: string[] }>;
  Remediations?: Array<{ Type: number; ProductID?: string[]; FixedBuild?: string; URL?: string }>;
  RevisionHistory?: Array<{ Date: string }>;
};
export type MsrcDocument = {
  ProductTree?: { FullProductName?: Product[] };
  Vulnerability?: MsrcVulnerability[];
};

export async function collectMsrc(now = new Date()): Promise<Vulnerability[]> {
  const result: Vulnerability[] = [];
  let reports = 0;
  // Three monthly reports. Before the current month's release, use the previous three.
  for (let offset = 0; offset < 4 && reports < 3; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date);
    const id = `${date.getUTCFullYear()}-${month}`;
    let data: MsrcDocument;
    try {
      ({ data } = await fetchJson<MsrcDocument>(
        `https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/${id}`,
        { headers: { Accept: "application/json" } },
        2,
        60_000,
      ));
    } catch (error) {
      if (offset === 0 && error instanceof HttpError && error.status === 404) continue;
      throw error;
    }
    if (!Array.isArray(data.Vulnerability) || !Array.isArray(data.ProductTree?.FullProductName)) {
      throw new Error("Microsoft MSRC returned an invalid monthly report.");
    }
    result.push(...normalizeMsrc(data));
    reports += 1;
  }
  return result;
}

export function normalizeMsrc(document: MsrcDocument): Vulnerability[] {
  const products = new Map((document.ProductTree?.FullProductName ?? []).map((item) => [item.ProductID, item]));
  return (document.Vulnerability ?? []).flatMap((item) => {
    // CVRF Type 3 is Known Affected. Never infer affected products from a title or "not affected" list.
    const affectedIds = new Set((item.ProductStatuses ?? []).filter((status) => status.Type === 3)
      .flatMap((status) => status.ProductID));
    const affected = [...affectedIds].flatMap((id) => {
      const product = products.get(id);
      if (!product) return [];
      const family = microsoftProductFamily(product);
      if (!family) return [];
      return [{
        vendor: "Microsoft",
        product: family,
        affectedVersions: [product.Value],
        fixedVersions: [...new Set((item.Remediations ?? [])
          .filter((remediation) => remediation.Type === 2 && remediation.ProductID?.includes(id))
          // MSRC sometimes puts a vendor guidance URL in FixedBuild, not a version.
          .flatMap((remediation) => remediation.FixedBuild && /^\d+(?:\.\d+)+(?:[-+][\w.-]+)?$/.test(remediation.FixedBuild)
            ? [remediation.FixedBuild] : []))],
      }];
    });
    if (affected.length === 0) return [];
    const scores = (item.CVSSScoreSets ?? [])
      .filter((score) => !score.ProductID?.length || score.ProductID.some((id) => affectedIds.has(id)))
      .flatMap((score) => typeof score.BaseScore === "number" && score.BaseScore >= 0 && score.BaseScore <= 10 ? [score.BaseScore] : []);
    const cvssScore = scores.length ? Math.max(...scores) : undefined;
    const severity = microsoftSeverity(item, cvssScore);
    const dates = (item.RevisionHistory ?? []).map((revision) => revision.Date).filter(Boolean).sort();
    return [{
      id: item.CVE,
      aliases: [item.CVE],
      title: item.Title?.Value ?? item.CVE,
      description: plainText((item.Notes ?? []).find((note) => note.Type === 2)?.Value ?? ""),
      affected,
      cvssScore,
      severity,
      publishedAt: dates[0],
      modifiedAt: dates.at(-1),
      exploitation: {
        knownExploited: (item.Threats ?? []).some((threat) =>
          threat.Type === 1 && /(?:^|;)\s*Exploited:\s*Yes(?:;|$)/i.test(threat.Description?.Value ?? "")),
      },
      references: [
        { source: "msrc", url: `https://msrc.microsoft.com/update-guide/vulnerability/${encodeURIComponent(item.CVE)}` },
        ...[...new Set((item.Remediations ?? []).filter((remediation) =>
          !remediation.ProductID?.length || remediation.ProductID.some((id) => affectedIds.has(id)))
          .flatMap((remediation) => [remediation.URL, remediation.FixedBuild]
            .filter((url): url is string => Boolean(url?.startsWith("https://")))))]
          .map((url) => ({ source: "msrc", url })),
      ],
    }];
  });
}

// Canonicalize structured Microsoft product/CPE fields, not vulnerability prose.
function microsoftProductFamily(product: Product): string | undefined {
  const name = product.Value.replace(/^Microsoft\s+/i, "");
  if (/^Windows 11\b/i.test(name)) return "Windows 11";
  if (/^Windows\b/i.test(name)) return "Windows";
  if (/^Exchange Server\b/i.test(name)) return "Exchange Server";
  if (/^SharePoint(?: Enterprise)? Server\b/i.test(name)) return "SharePoint";
  if (/^Edge\b/i.test(name)) return "Edge";
  for (const app of ["Word", "Excel", "PowerPoint", "Outlook", "Access", "OneNote", "Publisher", "Project", "Visio", "Teams"]) {
    if (new RegExp(`^(?:Office )?${app}\\b`, "i").test(name)) return app;
  }
  if (/^(?:Office\b|365 Apps\b)/i.test(name)) return "Office";
  // Preserve other explicit CPE product names for custom watchlists.
  const cpe = product.CPE?.split(":");
  return cpe?.[3] === "microsoft" ? cpe[4] : undefined;
}

function microsoftSeverity(item: MsrcVulnerability, score?: number): Severity {
  if (score !== undefined) return score >= 9 ? "critical" : score >= 7 ? "high" : score >= 4 ? "moderate" : "low";
  const labels = (item.Threats ?? []).filter((threat) => threat.Type === 3).map((threat) => threat.Description?.Value?.toLowerCase());
  if (labels.includes("critical")) return "critical";
  if (labels.includes("important")) return "high";
  if (labels.includes("moderate")) return "moderate";
  if (labels.includes("low")) return "low";
  return "unknown";
}

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}
