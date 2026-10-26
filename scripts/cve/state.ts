import { createHash } from "node:crypto";
import type { MonitoringState, RelevantVulnerability } from "./types.ts";

export const emptyState = (): MonitoringState => ({ version: 1, delivered: {} });

export function advisoryFingerprint(item: RelevantVulnerability): string {
  const material = JSON.stringify({
    severity: item.severity,
    cvssScore: item.cvssScore,
    modifiedAt: item.modifiedAt,
    affected: item.affected,
    exploitation: item.exploitation,
  });
  return createHash("sha256").update(material).digest("hex").slice(0, 20);
}

export function selectDigestItems(
  items: RelevantVulnerability[],
  state: MonitoringState,
  initialLimit = 12,
): RelevantVulnerability[] {
  const isInitialRun = Object.keys(state.delivered).length === 0;
  const changed = items.filter((item) =>
    state.delivered[item.id]?.fingerprint !== advisoryFingerprint(item),
  );
  return isInitialRun ? changed.slice(0, initialLimit) : changed;
}

export function markDelivered(
  state: MonitoringState,
  items: RelevantVulnerability[],
  deliveredAt = new Date().toISOString(),
): MonitoringState {
  const delivered = { ...state.delivered };
  for (const item of items) {
    delivered[item.id] = { fingerprint: advisoryFingerprint(item), deliveredAt };
  }
  return { version: 1, delivered, lastSuccessfulRun: deliveredAt };
}
