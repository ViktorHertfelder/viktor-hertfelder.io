import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { advisoryActivityTime, isInTimeRange, isSnapshotStale, parseAdvisoryDate } from "../../../src/lib/security-recency.ts";

test("recent view includes new advisories and updates to older ones, excluding old and future records", () => {
  const now = Date.parse("2026-10-28T10:00:00Z");
  assert.equal(isInTimeRange({ publishedAt: "2026-10-28T08:00:00Z" }, "24h", now), true);
  assert.equal(isInTimeRange({ publishedAt: "2024-01-01", modifiedAt: "2026-10-27T20:00:00Z" }, "24h", now), true);
  assert.equal(isInTimeRange({ publishedAt: "2026-10-20", modifiedAt: "2026-10-23" }, "24h", now), false);
  assert.equal(isInTimeRange({ modifiedAt: "2026-10-29T00:00:00Z" }, "24h", now), false);
  assert.equal(isInTimeRange({}, "24h", now), false);
  assert.equal(isInTimeRange({ publishedAt: "invalid" }, "all", now), true);
  assert.equal(advisoryActivityTime({ publishedAt: "2026-10-28", modifiedAt: "2026-10-27" }), Date.parse("2026-10-28T00:00:00Z"));
});

test("today uses the Berlin calendar day in winter and summer, not the visitor's local timezone", () => {
  const winter = Date.parse("2026-10-28T10:00:00Z");
  assert.equal(isInTimeRange({ modifiedAt: "2026-10-27T23:30:00Z" }, "today", winter), true);
  assert.equal(isInTimeRange({ modifiedAt: "2026-10-27T22:30:00Z" }, "today", winter), false);
  const summer = Date.parse("2026-07-15T10:00:00Z");
  assert.equal(isInTimeRange({ modifiedAt: "2026-07-14T22:30:00Z" }, "today", summer), true);
  assert.equal(isInTimeRange({ modifiedAt: "2026-07-14T21:30:00Z" }, "today", summer), false);
});

test("timestamps without an offset are treated as UTC and stale snapshots are flagged", () => {
  assert.equal(parseAdvisoryDate("2026-10-28T07:00:00"), Date.parse("2026-10-28T07:00:00Z"));
  const now = Date.parse("2026-10-28T10:00:00Z");
  assert.equal(isSnapshotStale("2026-10-26T06:39:16Z", now), true);
  assert.equal(isSnapshotStale("2026-10-28T07:00:00Z", now), false);
  assert.equal(isSnapshotStale("invalid", now), true);
});

test("daily workflow is timezone-aware and does not discard jobs that start after 07:00", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/deploy.yml", import.meta.url), "utf8");
  assert.ok(workflow.includes('cron: "0 7 * * *"'));
  assert.ok(workflow.includes('timezone: "Europe/Berlin"'));
  assert.equal(workflow.includes("schedule_gate"), false);
  assert.equal(workflow.includes("date +%H"), false);
});
