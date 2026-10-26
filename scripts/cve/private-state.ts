import type { MonitoringState } from "./types.ts";
import { emptyState } from "./state.ts";

type RepositoryFile = { content: string; sha: string };
const filename = "hertfelder-cve-monitor-state.json";

export async function loadPrivateState(repository?: string, token?: string): Promise<MonitoringState> {
  if (!repository || !token) return emptyState();
  const response = await fetch(fileUrl(repository), { headers: headers(token) });
  if (response.status === 404) return emptyState();
  if (!response.ok) throw new Error(`Unable to load private state: HTTP ${response.status}`);
  const file = await response.json() as RepositoryFile;
  return JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as MonitoringState;
}

export async function savePrivateState(state: MonitoringState, repository?: string, token?: string) {
  if (!repository || !token) return false;
  const current = await fetch(fileUrl(repository), { headers: headers(token) });
  if (!current.ok && current.status !== 404) {
    throw new Error(`Unable to read private state before update: HTTP ${current.status}`);
  }
  const sha = current.ok ? ((await current.json()) as RepositoryFile).sha : undefined;
  const response = await fetch(fileUrl(repository), {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update CVE monitor delivery state",
      content: Buffer.from(`${JSON.stringify(state, null, 2)}\n`).toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Unable to save private state: HTTP ${response.status}`);
  return true;
}

function fileUrl(repository: string) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    throw new Error("CVE_STATE_REPOSITORY must use the owner/repository format.");
  }
  return `https://api.github.com/repos/${repository}/contents/${filename}`;
}

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "hertfelder-cve-monitor",
  };
}
