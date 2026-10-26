import assert from "node:assert/strict";
import test from "node:test";
import { collectOsv, normalizeOsv } from "../collectors/osv.ts";
import { collectMsrc, normalizeMsrc } from "../collectors/msrc.ts";
import { deduplicateVulnerabilities } from "../dedupe.ts";

test("OSV follows pagination, skips withdrawn records and queries package identities without installed versions", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Record<string, unknown>[] = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    requests.push(body);
    return Response.json(requests.length === 1 ? {
      vulns: [{ id: "GHSA-first", database_specific: { severity: "HIGH" } }],
      next_page_token: "second",
    } : {
      vulns: [{ id: "GHSA-withdrawn", withdrawn: "2026-01-01" }, { id: "GHSA-second" }],
    });
  };
  try {
    const result = await collectOsv({ entries: [{
      id: "next", category: "Web", installedVersion: "16.2.7",
      matcher: { type: "package", ecosystem: "npm", name: "next" },
    }] });
    assert.equal(result.length, 2);
    assert.deepEqual(requests[0], { package: { ecosystem: "npm", name: "next" } });
    assert.equal(requests[1].page_token, "second");
    assert.equal(result[0].severity, "high");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OSV aliases join otherwise separate CVE and GHSA groups; Git fixes are not release versions", () => {
  const cve = normalizeOsv({ id: "CVE-2026-1234" });
  const ghsa = normalizeOsv({ id: "GHSA-test-test-test" });
  const bridge = normalizeOsv({
    id: "OSV-bridge", aliases: [cve.id, ghsa.id],
    affected: [{
      package: { ecosystem: "npm", name: "example" },
      ranges: [
        { type: "SEMVER", events: [{ introduced: "0" }, { fixed: "2.0.0" }] },
        { type: "GIT", events: [{ introduced: "abc" }, { fixed: "def" }] },
      ],
    }],
  });
  assert.deepEqual(bridge.affected[0].fixedVersions, ["2.0.0"]);
  const result = deduplicateVulnerabilities([cve, ghsa, bridge]);
  assert.equal(result.length, 1);
  assert.ok(result[0].aliases.includes(ghsa.id));
  assert.ok(result[0].references.some((reference) => reference.source === "osv"));
});

test("MSRC uses known-affected product IDs and assigns fixed builds to their actual products", () => {
  const result = normalizeMsrc({
    ProductTree: { FullProductName: [
      { ProductID: "win", Value: "Windows 11 Version 24H2 for x64-based Systems" },
      { ProductID: "word", Value: "Microsoft Word 2024" },
      { ProductID: "exchange", Value: "Microsoft Exchange Server 2019" },
    ] },
    Vulnerability: [{
      CVE: "CVE-2026-12345", Title: { Value: "Example vendor issue" },
      Notes: [{ Type: 2, Value: "<p>Vendor &amp; product description</p>" }],
      ProductStatuses: [{ Type: 3, ProductID: ["win", "word"] }, { Type: 1, ProductID: ["exchange"] }],
      CVSSScoreSets: [{ BaseScore: 8.1, ProductID: ["win"] }],
      Threats: [{ Type: 1, Description: { Value: "Publicly Disclosed:Yes;Exploited:Yes" } }],
      Remediations: [
        { Type: 2, ProductID: ["win"], FixedBuild: "10.0.1", URL: "https://example.test/kb" },
        { Type: 2, ProductID: ["word"], FixedBuild: "https://example.test/office-updates" },
        { Type: 2, ProductID: ["exchange"], FixedBuild: "15.2.1" },
      ],
      RevisionHistory: [{ Date: "2026-10-13T07:00:00Z" }, { Date: "2026-10-20T07:00:00Z" }],
    }],
  });
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].affected.map((component) => component.product), ["Windows 11", "Word"]);
  assert.deepEqual(result[0].affected[0].fixedVersions, ["10.0.1"]);
  assert.deepEqual(result[0].affected[1].fixedVersions, []);
  assert.ok(result[0].references.some((reference) => reference.url === "https://example.test/office-updates"));
  assert.equal(result[0].cvssScore, 8.1);
  assert.equal(result[0].exploitation.knownExploited, true);
  assert.equal(result[0].description, "Vendor & product description");
  assert.equal(result[0].modifiedAt, "2026-10-20T07:00:00Z");
});

test("MSRC falls back to the prior three reports before a new monthly report exists", async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    return requests.length === 1 ? new Response("", { status: 404 }) :
      Response.json({ ProductTree: { FullProductName: [] }, Vulnerability: [] });
  };
  try {
    await collectMsrc(new Date("2026-10-01T12:00:00Z"));
    assert.deepEqual(requests.map((url) => url.split("/").at(-1)), ["2026-Oct", "2026-Sep", "2026-Aug", "2026-Jul"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("deduplication preserves each source's attribution for shared reference URLs", () => {
  const item = normalizeOsv({ id: "GHSA-test" });
  const github = { ...item, references: item.references.map((reference) => ({ ...reference, source: "github" })) };
  const [merged] = deduplicateVulnerabilities([github, item]);
  assert.deepEqual(merged.references.map((reference) => reference.source).sort(), ["github", "osv"]);
});
