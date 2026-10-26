import { mergeVulnerabilityRecords } from "./merge.ts";
import type { Vulnerability } from "./types.ts";

type Entity = {
  aliases: Set<string>;
  records: Map<string, Vulnerability>;
};

/**
 * Per-run in-memory advisory database. Identifiers are unique across entities;
 * one entity retains separate records from each provider for enrichment.
 * No server, native module or persistent storage is required.
 */
export class VulnerabilityDatabase {
  private readonly byIdentifier = new Map<string, Entity>();
  private readonly entities = new Set<Entity>();
  private received = 0;

  get size(): number { return this.entities.size; }

  upsert(advisory: Vulnerability): void {
    const identifiers = [...new Set([advisory.id, ...advisory.aliases].map(normalizeIdentifier))];
    if (!identifiers[0]) throw new Error("An advisory must have a non-empty identifier.");
    const aliases = identifiers.filter(Boolean);
    const existing = [...new Set(aliases.flatMap((id) => {
      const entity = this.byIdentifier.get(id);
      return entity ? [entity] : [];
    }))].sort((a, b) => b.aliases.size - a.aliases.size);
    const target: Entity = existing[0] ?? { aliases: new Set(), records: new Map() };
    this.entities.add(target);

    // Union smaller groups into the largest; a bridge record can join several
    // previously separate CVE/GHSA/OSV entities in any ingestion order.
    for (const entity of existing.slice(1)) {
      for (const alias of entity.aliases) {
        target.aliases.add(alias);
        this.byIdentifier.set(alias, target);
      }
      for (const [key, record] of entity.records) keepLatest(target.records, key, record);
      this.entities.delete(entity);
    }
    for (const alias of aliases) {
      target.aliases.add(alias);
      this.byIdentifier.set(alias, target);
    }
    // Defensive copies prevent caller mutations from corrupting the index.
    const record = structuredClone(advisory);
    record.id = normalizeIdentifier(record.id);
    record.aliases = aliases;
    keepLatest(target.records, recordKey(record), record);
    this.received += 1;
  }

  upsertMany(advisories: Iterable<Vulnerability>): void {
    for (const advisory of advisories) this.upsert(advisory);
  }

  get(identifier: string): Vulnerability | undefined {
    const entity = this.byIdentifier.get(normalizeIdentifier(identifier));
    return entity ? snapshot(entity) : undefined;
  }

  has(identifier: string): boolean {
    return this.byIdentifier.has(normalizeIdentifier(identifier));
  }

  all(): Vulnerability[] {
    return [...this.entities].map(snapshot).sort((a, b) => a.id.localeCompare(b.id));
  }

  stats() {
    return {
      received: this.received,
      uniqueVulnerabilities: this.size,
      sourceRecords: [...this.entities].reduce((total, entity) => total + entity.records.size, 0),
      duplicateObservations: this.received - this.size,
    };
  }
}

function normalizeIdentifier(identifier: string) { return identifier.trim().toUpperCase(); }

function recordKey(record: Vulnerability) {
  const sources = [...new Set(record.references.map((reference) => reference.source))].sort();
  return JSON.stringify([record.id, sources]);
}

function keepLatest(records: Map<string, Vulnerability>, key: string, incoming: Vulnerability) {
  const current = records.get(key);
  // Repeated monthly MSRC records (or late-arriving results) cannot roll back an update.
  if (!current || timestamp(incoming) >= timestamp(current)) records.set(key, incoming);
}

function timestamp(record: Vulnerability) {
  const value = Date.parse(record.modifiedAt ?? record.publishedAt ?? "");
  return Number.isNaN(value) ? 0 : value;
}

function snapshot(entity: Entity): Vulnerability {
  const records = [...entity.records.values()].sort((a, b) =>
    timestamp(b) - timestamp(a) || recordKey(a).localeCompare(recordKey(b)));
  const merged = mergeVulnerabilityRecords(records);
  const aliases = [...entity.aliases].sort().map((id) =>
    id.startsWith("GHSA-") ? `GHSA-${id.slice(5).toLowerCase()}` : id);
  // Prefer a stable CVE, then GHSA, then a provider ID regardless of arrival order.
  merged.id = aliases.find((id) => id.startsWith("CVE-")) ??
    aliases.find((id) => id.startsWith("GHSA-")) ?? aliases[0];
  merged.aliases = aliases;
  return structuredClone(merged);
}
