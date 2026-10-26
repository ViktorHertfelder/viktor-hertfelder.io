export type Severity = "unknown" | "low" | "moderate" | "high" | "critical";

export type AffectedComponent = {
  ecosystem?: string;
  packageName?: string;
  purl?: string;
  vendor?: string;
  product?: string;
  affectedVersions: string[];
  fixedVersions: string[];
};

export type SourceReference = {
  source: "github" | "cisa-kev" | string;
  url: string;
};

export type Vulnerability = {
  id: string;
  aliases: string[];
  title: string;
  description: string;
  affected: AffectedComponent[];
  cvssScore?: number;
  severity: Severity;
  publishedAt?: string;
  modifiedAt?: string;
  exploitation: {
    knownExploited: boolean;
    ransomwareUse?: string;
    requiredAction?: string;
    dueDate?: string;
  };
  references: SourceReference[];
};

export type MatchReason = {
  watchlistId: string;
  category: string;
  technology: string;
  installedVersion?: string;
  versionStatus: "not-specified" | "possibly-affected" | "unknown";
};

export type RelevantVulnerability = Vulnerability & {
  matches: MatchReason[];
  riskScore: number;
};

export type PackageMatcher = {
  type: "package";
  ecosystem: string;
  name: string;
};

export type ProductMatcher = {
  type: "product";
  vendor?: string;
  product: string;
  aliases?: Array<{ vendor?: string; product: string }>;
};

export type UnsupportedMatcher = {
  type: "unsupported";
  description: string;
};

export type WatchlistEntry = {
  id: string;
  category: string;
  enabled?: boolean;
  matcher: PackageMatcher | ProductMatcher | UnsupportedMatcher;
  installedVersion?: string;
  minimumSeverity?: Severity;
  coverageNote?: string;
  include?: { advisoryIds?: string[] };
  exclude?: { advisoryIds?: string[] };
};

export type Watchlist = {
  entries: WatchlistEntry[];
};

export type DeliveryRecord = {
  fingerprint: string;
  deliveredAt: string;
};

export type MonitoringState = {
  version: 1;
  delivered: Record<string, DeliveryRecord>;
  lastSuccessfulRun?: string;
};

export type PublicSecurityData = {
  generatedAt: string;
  sourceStatus: Record<string, { ok: boolean; message?: string }>;
  warnings: string[];
  vulnerabilities: Array<Omit<RelevantVulnerability, "matches"> & {
    matches: Array<Pick<MatchReason, "category" | "technology" | "versionStatus">>;
  }>;
};
