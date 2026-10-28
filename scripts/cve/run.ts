import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { collectGitHubAdvisories } from "./collectors/github.ts";
import { collectCisaKev } from "./collectors/cisa.ts";
import { collectOsv } from "./collectors/osv.ts";
import { collectMsrc } from "./collectors/msrc.ts";
import { VulnerabilityDatabase } from "./database.ts";
import { applyWatchlist } from "./watchlist.ts";
import { buildPlainTextDigest } from "./digest.ts";
import { loadPrivateState, savePrivateState } from "./private-state.ts";
import { markDelivered, selectDigestItems } from "./state.ts";
import { sendWithResend } from "./email.ts";
import type { PublicSecurityData, Watchlist } from "./types.ts";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const shouldSend = args.has("--send") && !dryRun;
const initialLimit = args.has("--backfill") ? 25 : 12;

if (shouldSend && (!process.env.CVE_STATE_REPOSITORY || !process.env.CVE_STATE_TOKEN)) {
  throw new Error("Sending requires CVE_STATE_REPOSITORY and CVE_STATE_TOKEN to prevent duplicate notifications.");
}

const watchlist = await loadWatchlist();
const sources = [
  { name: "github", collect: () => collectGitHubAdvisories(process.env.GITHUB_TOKEN) },
  { name: "cisa-kev", collect: () => collectCisaKev() },
  { name: "osv", collect: () => collectOsv(watchlist) },
  { name: "msrc", collect: () => collectMsrc() },
];
const collectors = await Promise.allSettled(sources.map((source) => source.collect()));
const sourceStatus: PublicSecurityData["sourceStatus"] = {};
const database = new VulnerabilityDatabase();

collectors.forEach((result, index) => {
  const source = sources[index].name;
  if (result.status === "fulfilled") {
    sourceStatus[source] = { ok: true };
    database.upsertMany(result.value);
    console.log(`${source}: ${result.value.length} advisories collected.`);
  } else {
    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    // Provider errors can contain private query values. Publish only a generic status.
    sourceStatus[source] = { ok: false, message: "Collection failed; coverage is incomplete." };
    console.error(`${source} collector failed: ${message}`);
  }
});

if (database.size === 0) {
  throw new Error("All collectors failed; preserving the previously generated public data.");
}

const normalized = database.all();
const { matches, warnings } = applyWatchlist(normalized, watchlist);
const generatedAt = new Date().toISOString();
const publicData: PublicSecurityData = {
  generatedAt,
  sourceStatus,
  warnings,
  vulnerabilities: matches.map((item) => ({
    ...item,
    matches: item.matches.map(({ category, technology, versionStatus }) => ({
      category,
      technology,
      versionStatus,
    })),
  })),
};
await writeFile(resolve("public/security-data.json"), `${JSON.stringify(publicData, null, 2)}\n`);

const state = await loadPrivateState(process.env.CVE_STATE_REPOSITORY, process.env.CVE_STATE_TOKEN);
const digestItems = selectDigestItems(matches, state, initialLimit);
const digest = buildPlainTextDigest(digestItems, generatedAt);

if (dryRun) {
  console.log(digest);
} else if (shouldSend && digestItems.length > 0) {
  const result = await sendWithResend(
    `[CVE Monitor] ${digestItems.length} new or updated advisories`,
    digest,
  );
  console.log(`Resend accepted digest ${result.id}`);
  const updatedState = markDelivered(state, digestItems, generatedAt);
  await savePrivateState(updatedState, process.env.CVE_STATE_REPOSITORY, process.env.CVE_STATE_TOKEN);
} else {
  console.log(shouldSend ? "No new or materially updated advisories." : "Collection complete; email disabled.");
}

const stats = database.stats();
console.log(`Collected ${stats.received}, unique ${stats.uniqueVulnerabilities}, duplicate observations ${stats.duplicateObservations}, relevant ${matches.length}.`);

async function loadWatchlist(): Promise<Watchlist> {
  if (process.env.CVE_WATCHLIST_JSON) {
    return JSON.parse(process.env.CVE_WATCHLIST_JSON) as Watchlist;
  }
  const content = await readFile(resolve("config/watchlist.example.json"), "utf8");
  console.warn("CVE_WATCHLIST_JSON is unset; using the public example watchlist.");
  return JSON.parse(content) as Watchlist;
}
