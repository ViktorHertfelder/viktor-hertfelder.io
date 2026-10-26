import { fetchJson } from "../http.ts";
import type { Vulnerability } from "../types.ts";

type KevCatalog = {
  vulnerabilities: Array<{
    cveID: string;
    vendorProject: string;
    product: string;
    vulnerabilityName: string;
    shortDescription: string;
    dateAdded: string;
    dueDate: string;
    requiredAction: string;
    knownRansomwareCampaignUse: string;
    notes?: string;
  }>;
};

const KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

export async function collectCisaKev(): Promise<Vulnerability[]> {
  const { data } = await fetchJson<KevCatalog>(KEV_URL, {
    headers: { "User-Agent": "hertfelder-cve-monitor" },
  });

  return data.vulnerabilities.map((item) => ({
    id: item.cveID,
    aliases: [item.cveID],
    title: item.vulnerabilityName,
    description: item.shortDescription,
    affected: [{
      vendor: item.vendorProject,
      product: item.product,
      affectedVersions: [],
      fixedVersions: [],
    }],
    severity: "unknown",
    publishedAt: item.dateAdded,
    modifiedAt: item.dateAdded,
    exploitation: {
      knownExploited: true,
      ransomwareUse: item.knownRansomwareCampaignUse,
      requiredAction: item.requiredAction,
      dueDate: item.dueDate,
    },
    references: [
      { source: "cisa-kev", url: KEV_URL },
      ...(item.notes?.match(/https?:\/\/\S+/g) ?? []).map((url) => ({ source: "cisa-kev", url })),
    ],
  }));
}
