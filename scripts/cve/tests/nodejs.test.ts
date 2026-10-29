import assert from "node:assert/strict";
import test from "node:test";
import { collectNodeAdvisories, normalizeNodeAdvisory } from "../collectors/nodejs.ts";
import { applyWatchlist } from "../watchlist.ts";
import { readFileSync } from "node:fs";
import type { Watchlist } from "../types.ts";

test("Node.js reports match the runtime, retain source ranges and keep distinct CVEs separate", () => {
  const records = normalizeNodeAdvisory({
    cve: ["CVE-2026-12345", "CVE-2026-12346"],
    description: "Runtime issue", severity: "high",
    vulnerable: ">=20.0.0 <20.1.0", patched: ">=20.1.0",
  }, "123.json", "https://raw.githubusercontent.com/nodejs/security-wg/main/vuln/core/123.json");
  assert.equal(records.length, 2);
  assert.deepEqual(records[0].aliases, ["CVE-2026-12345"]);
  assert.equal(records[0].publishedAt, undefined);
  assert.deepEqual(records[0].affected[0].fixedVersions, [">=20.1.0"]);
  const watchlist = JSON.parse(readFileSync(new URL("../../../config/watchlist.example.json", import.meta.url), "utf8")) as Watchlist;
  assert.equal(applyWatchlist(records, watchlist).matches.length, 2);
});

test("Node.js collector reads individual files, ignores the index and never forwards credentials to raw URLs", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; authorization: string | null }> = [];
  globalThis.fetch = async (url, options) => {
    const address = String(url);
    calls.push({ url: address, authorization: new Headers(options?.headers).get("Authorization") });
    return Response.json(address.includes("/contents/") ? [
      { name: "1.json", type: "file", download_url: "https://raw.githubusercontent.com/nodejs/security-wg/main/vuln/core/1.json" },
      { name: "index.json", type: "file", download_url: "https://raw.githubusercontent.com/nodejs/security-wg/main/vuln/core/index.json" },
    ] : { cve: ["CVE-2026-12345"], severity: "high" });
  };
  try {
    assert.equal((await collectNodeAdvisories("test-token")).length, 1);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].authorization, "Bearer test-token");
    assert.equal(calls[1].authorization, null);
    assert.equal(calls.some((call) => call.url.endsWith("/index.json")), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
