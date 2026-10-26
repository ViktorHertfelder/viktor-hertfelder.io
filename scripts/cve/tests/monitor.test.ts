import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { deduplicateVulnerabilities } from "../dedupe.ts";
import { applyWatchlist } from "../watchlist.ts";
import { rankVulnerability } from "../risk.ts";
import { advisoryFingerprint, emptyState, markDelivered, selectDigestItems } from "../state.ts";
import type { RelevantVulnerability, Vulnerability, Watchlist } from "../types.ts";

function vulnerability(overrides: Partial<Vulnerability> = {}): Vulnerability {
  return {
    id: "CVE-2026-0001",
    aliases: ["CVE-2026-0001", "GHSA-AAAA-BBBB-CCCC"],
    title: "Example issue",
    description: "Example description",
    affected: [{ ecosystem: "npm", packageName: "next", affectedVersions: ["< 16.2.8"], fixedVersions: ["16.2.8"] }],
    cvssScore: 9.8,
    severity: "critical",
    publishedAt: "2026-01-01T00:00:00Z",
    modifiedAt: "2026-01-01T00:00:00Z",
    exploitation: { knownExploited: false },
    references: [{ source: "github", url: "https://example.test/advisory" }],
    ...overrides,
  };
}

const watchlist: Watchlist = { entries: [{
  id: "next", category: "React / Next.js / Vue",
  matcher: { type: "package", ecosystem: "npm", name: "next" }, minimumSeverity: "high",
}] };

test("deduplicates CVE and GHSA records and retains KEV status", () => {
  const github = vulnerability();
  const cisa = vulnerability({
    id: "CVE-2026-0001", aliases: ["CVE-2026-0001"], cvssScore: undefined, severity: "unknown",
    affected: [{ vendor: "Example", product: "Next", affectedVersions: [], fixedVersions: [] }],
    exploitation: { knownExploited: true, requiredAction: "Patch now" },
    references: [{ source: "cisa-kev", url: "https://example.test/kev" }],
  });
  const result = deduplicateVulnerabilities([github, cisa]);
  assert.equal(result.length, 1);
  assert.equal(result[0].exploitation.knownExploited, true);
  assert.equal(result[0].references.length, 2);
});

test("matches structured package coordinates and respects exclusions", () => {
  assert.equal(applyWatchlist([vulnerability()], watchlist).matches.length, 1);
  const excluded: Watchlist = { entries: [{ ...watchlist.entries[0], exclude: { advisoryIds: ["GHSA-AAAA-BBBB-CCCC"] } }] };
  assert.equal(applyWatchlist([vulnerability()], excluded).matches.length, 0);
});

test("ranks known exploitation above an otherwise identical advisory", () => {
  const base = { ...vulnerability(), matches: [], riskScore: 0 } as RelevantVulnerability;
  const exploited = { ...base, exploitation: { knownExploited: true } };
  assert.ok(rankVulnerability(exploited) > rankVulnerability(base));
});

test("digest state emits new and materially updated advisories only", () => {
  const item = { ...vulnerability(), matches: [], riskScore: 90 } as RelevantVulnerability;
  const initial = emptyState();
  assert.deepEqual(selectDigestItems([item], initial), [item]);
  const delivered = markDelivered(initial, [item], "2026-01-02T00:00:00Z");
  assert.equal(selectDigestItems([item], delivered).length, 0);
  const updated = { ...item, severity: "high" as const };
  assert.notEqual(advisoryFingerprint(item), advisoryFingerprint(updated));
  assert.deepEqual(selectDigestItems([updated], delivered), [updated]);
});

test("matches explicit product aliases, rejects other vendors and keeps KEV with unknown severity", () => {
  const productList: Watchlist = { entries: [{
    id: "exchange", category: "Microsoft",
    matcher: {
      type: "product", vendor: "Microsoft", product: "Exchange Server",
      aliases: [{ vendor: "Microsoft", product: "Exchange" }],
    },
    minimumSeverity: "high",
  }] };
  const kev = vulnerability({
    severity: "unknown", cvssScore: undefined,
    affected: [{ vendor: "Microsoft", product: "Exchange", affectedVersions: [], fixedVersions: [] }],
    exploitation: { knownExploited: true },
  });
  assert.equal(applyWatchlist([kev], productList).matches.length, 1);
  const otherVendor = { ...kev, affected: [{ ...kev.affected[0], vendor: "Other" }] };
  assert.equal(applyWatchlist([otherVendor], productList).matches.length, 0);
  const descriptionOnly = { ...kev, affected: [], description: "Microsoft Exchange Server" };
  assert.equal(applyWatchlist([descriptionOnly], productList).matches.length, 0);
});

test("expanded watchlist matches combined Apple entries and flags unsupported JavaScript coverage", () => {
  const expanded = JSON.parse(readFileSync(new URL("../../../config/watchlist.example.json", import.meta.url), "utf8")) as Watchlist;
  const apple = vulnerability({
    affected: [{ vendor: "Apple", product: "iOS, iPadOS, and macOS", affectedVersions: [], fixedVersions: [] }],
    exploitation: { knownExploited: true },
  });
  const result = applyWatchlist([apple], expanded);
  assert.deepEqual(result.matches[0].matches.map((match) => match.watchlistId).sort(), ["apple-ios", "apple-macos"]);
  assert.ok(result.warnings.some((warning) => warning.includes("javascript-general")));
  assert.ok(result.warnings.some((warning) => warning.includes("github-service")));
});
