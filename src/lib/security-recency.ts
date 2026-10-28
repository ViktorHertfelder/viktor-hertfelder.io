export type AdvisoryDates = { publishedAt?: string; modifiedAt?: string };
export type TimeRange = "24h" | "today" | "7d" | "all";

export function parseAdvisoryDate(value?: string): number {
  if (!value) return Number.NaN;
  // MSRC CVRF timestamps without an offset are UTC, independent of the visitor's timezone.
  const normalized = value.includes("T") && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? `${value}Z` : value;
  return Date.parse(normalized);
}

export function advisoryActivityTime(advisory: AdvisoryDates): number {
  const dates = [parseAdvisoryDate(advisory.publishedAt), parseAdvisoryDate(advisory.modifiedAt)].filter(Number.isFinite);
  return dates.length ? Math.max(...dates) : 0;
}

export function isInTimeRange(advisory: AdvisoryDates, range: TimeRange, now: number): boolean {
  if (range === "all") return true;
  const activity = advisoryActivityTime(advisory);
  if (!activity || activity > now) return false;
  if (range === "today") return berlinDay(activity) === berlinDay(now);
  return activity >= now - (range === "24h" ? 24 : 7 * 24) * 3_600_000;
}

export function isSnapshotStale(generatedAt: string, now: number): boolean {
  const generated = parseAdvisoryDate(generatedAt);
  return !Number.isFinite(generated) || now - generated > 36 * 3_600_000;
}

function berlinDay(timestamp: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(timestamp);
}
