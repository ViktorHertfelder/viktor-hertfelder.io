import assert from "node:assert/strict";
import test from "node:test";
import { VulnerabilityDatabase } from "../database.ts";
import type { Vulnerability } from "../types.ts";

function record(id: string, source: string, overrides: Partial<Vulnerability> = {}): Vulnerability {
  return {
    id, aliases: [id], title: "Example advisory", description: "Source description",
    severity: "high", affected: [], exploitation: { knownExploited: false },
    modifiedAt: "2026-10-01T00:00:00Z",
    references: [{ source, url: `https://example.test/${source}/${id}` }],
    ...overrides,
  };
}

test("identifier lookup is case-insensitive and merges cross-source records without dropping enrichment", () => {
  const db = new VulnerabilityDatabase();
  db.upsert(record("CVE-2026-1234", "github", {
    affected: [{ ecosystem: "npm", packageName: "example", affectedVersions: ["<2.0.0"], fixedVersions: ["2.0.0"] }],
  }));
  db.upsert(record(" cve-2026-1234 ", "cisa-kev", {
    exploitation: { knownExploited: true }, severity: "unknown",
  }));
  assert.equal(db.size, 1);
  const merged = db.get("cve-2026-1234")!;
  assert.equal(merged.id, "CVE-2026-1234");
  assert.equal(merged.severity, "high");
  assert.equal(merged.exploitation.knownExploited, true);
  assert.deepEqual(merged.affected[0].fixedVersions, ["2.0.0"]);
  assert.equal(merged.references.length, 2);
});

test("bridge advisories union all aliases and keep unrelated vulnerabilities separate", () => {
  const inputs = [
    record("CVE-2026-1234", "cisa-kev"),
    record("GHSA-AAAA-BBBB-CCCC", "github"),
    record("OSV-EXAMPLE", "osv", { aliases: ["CVE-2026-1234", "GHSA-AAAA-BBBB-CCCC"] }),
    record("CVE-2026-9999", "github"),
  ];
  const forward = new VulnerabilityDatabase();
  const reverse = new VulnerabilityDatabase();
  forward.upsertMany(inputs);
  reverse.upsertMany([...inputs].reverse());
  assert.equal(forward.size, 2);
  assert.deepEqual(forward.all(), reverse.all());
  for (const alias of ["CVE-2026-1234", "GHSA-AAAA-BBBB-CCCC", "OSV-EXAMPLE"]) {
    assert.equal(forward.get(alias)?.id, "CVE-2026-1234");
  }
  assert.equal(forward.get("missing"), undefined);
});

test("upsert replaces an older source record, rejects stale rollbacks and retains other sources", () => {
  const db = new VulnerabilityDatabase();
  db.upsert(record("CVE-2026-1234", "msrc", { title: "Old title" }));
  db.upsert(record("CVE-2026-1234", "cisa-kev", { exploitation: { knownExploited: true } }));
  db.upsert(record("CVE-2026-1234", "msrc", {
    title: "Current title", modifiedAt: "2026-10-20T00:00:00Z",
    affected: [{ vendor: "Microsoft", product: "Windows", affectedVersions: ["Windows 11"], fixedVersions: ["10.0.1"] }],
  }));
  db.upsert(record("CVE-2026-1234", "msrc", { title: "Stale title" }));
  const merged = db.get("CVE-2026-1234")!;
  assert.equal(merged.title, "Current title");
  assert.equal(merged.exploitation.knownExploited, true);
  assert.deepEqual(db.stats(), { received: 4, uniqueVulnerabilities: 1, sourceRecords: 2, duplicateObservations: 3 });
});

test("input and query-result mutations cannot corrupt stored identities or source data", () => {
  const db = new VulnerabilityDatabase();
  const input = record("CVE-2026-1234", "github");
  db.upsert(input);
  input.title = "Changed outside";
  input.aliases.push("CVE-2026-9999");
  const output = db.get(input.id)!;
  output.title = "Changed result";
  output.references.length = 0;
  assert.equal(db.get(input.id)?.title, "Example advisory");
  assert.equal(db.get(input.id)?.references.length, 1);
  assert.equal(db.has("CVE-2026-9999"), false);
});

test("large ingestion keeps a single entity per identifier across repeated observations", () => {
  const db = new VulnerabilityDatabase();
  for (let index = 0; index < 10_000; index += 1) {
    db.upsert(record(`CVE-2026-${1000 + index % 1000}`, "github"));
  }
  assert.equal(db.size, 1000);
  assert.equal(db.stats().sourceRecords, 1000);
  assert.equal(db.get("CVE-2026-1999")?.id, "CVE-2026-1999");
  assert.throws(() => db.upsert(record("  ", "github")), /non-empty identifier/);
});
