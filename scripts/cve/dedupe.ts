import { VulnerabilityDatabase } from "./database.ts";
import type { Vulnerability } from "./types.ts";

/** Compatibility helper; all identity handling lives in the in-memory database. */
export function deduplicateVulnerabilities(items: Vulnerability[]): Vulnerability[] {
  const database = new VulnerabilityDatabase();
  database.upsertMany(items);
  return database.all();
}
