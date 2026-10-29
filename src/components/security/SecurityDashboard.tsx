"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { advisoryActivityTime, isInTimeRange, isSnapshotStale, parseAdvisoryDate, type TimeRange } from "@/lib/security-recency";

type Severity = "unknown" | "low" | "moderate" | "high" | "critical";
type SecurityItem = {
  id: string;
  aliases: string[];
  title: string;
  description: string;
  severity: Severity;
  cvssScore?: number;
  publishedAt?: string;
  modifiedAt?: string;
  exploitation: { knownExploited: boolean };
  affected: Array<{ affectedVersions: string[]; fixedVersions: string[] }>;
  references: Array<{ source: string; url: string }>;
  matches: Array<{ category: string; technology: string; versionStatus: string }>;
  riskScore: number;
};
type SecurityData = {
  generatedAt: string;
  sourceStatus: Record<string, { ok: boolean; message?: string }>;
  warnings: string[];
  vulnerabilities: SecurityItem[];
};

const severities: Array<Severity | "all"> = ["all", "critical", "high", "moderate", "low", "unknown"];

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [technology, setTechnology] = useState("");
  const [source, setSource] = useState("");
  const [exploitedOnly, setExploitedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [now, setNow] = useState(() => Date.now());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const refresh = () => {
      setNow(Date.now());
      return fetch("/security-data.json", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Monitoring data unavailable");
        return response.json() as Promise<SecurityData>;
      })
      .then((snapshot) => { if (active) { setData(snapshot); setFailed(false); setNow(Date.now()); } })
      .catch(() => { if (active) setFailed(true); });
    };
    void refresh();
    const interval = setInterval(() => { if (!document.hidden) void refresh(); }, 5 * 60_000);
    const onVisibility = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { active = false; controller.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", onVisibility); };
  }, [reloadKey]);

  const technologyGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const item of data?.vulnerabilities ?? []) {
      for (const match of item.matches) {
        if (!groups.has(match.category)) groups.set(match.category, new Set());
        groups.get(match.category)!.add(match.technology);
      }
    }
    return [...groups].sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.vulnerabilities ?? []).filter((item) => {
      const searchable = [
        item.id,
        item.title,
        item.description,
        ...item.aliases,
        ...item.matches.flatMap((match) => [match.category, match.technology]),
      ].join(" ").toLowerCase();
      return isInTimeRange(item, timeRange, now) &&
        (!query || searchable.includes(query)) &&
        (severity === "all" || item.severity === severity) &&
        (!technology || item.matches.some((match) => match.technology === technology)) &&
        (!source || item.references.some((reference) => reference.source === source)) &&
        (!exploitedOnly || item.exploitation.knownExploited);
    }).sort((a, b) => advisoryActivityTime(b) - advisoryActivityTime(a) || b.riskScore - a.riskScore);
  }, [data, exploitedOnly, search, severity, technology, source, timeRange, now]);

  return (
    <main className="relative min-h-screen bg-[#0F1115] text-white">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <nav className="mb-20 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">VH<span className="text-blue-500">.</span></Link>
          <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">← Portfolio</Link>
        </nav>

        <header className="mb-12 max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">Personal security monitor</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Relevant vulnerabilities, without the noise.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            Advisories matched against your technology watchlist. A technology match requires an applicability check for your installed version and configuration.
          </p>
          {data && <p className="mt-4 text-sm text-zinc-400">Data collected {formatDate(data.generatedAt, true)} · Europe/Berlin</p>}
          <p className="mt-2 text-xs leading-5 text-zinc-500">Default: published or updated in the last 24 hours, newest first. Older advisories remain available in the archive. Data is collected daily around 07:00 Europe/Berlin.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/ViktorHertfelder/viktor-hertfelder.io/actions/workflows/deploy.yml"
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby="crawl-instructions"
              className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >CVEs jetzt sammeln ↗</a>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:border-blue-400/50">Daten neu laden</button>
          </div>
          <p id="crawl-instructions" className="mt-3 max-w-2xl text-xs leading-5 text-zinc-400">Öffnet GitHub Actions: Dort mit deinem Repository-Zugriff „Run workflow“ auf Branch „main“ starten. Die Voreinstellungen sammeln und veröffentlichen ohne E-Mail. Nach erfolgreichem Deployment hier die Daten neu laden. Das Neuladen allein startet keinen Collector.</p>
          {data && isSnapshotStale(data.generatedAt, now) && <p role="alert" className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">The data snapshot is over 36 hours old. The daily update is overdue; an empty recent view does not confirm that there are no new vulnerabilities.</p>}
          {data && <div aria-label="Data sources" className="mt-4 flex flex-wrap gap-2">
            {Object.entries(data.sourceStatus).map(([name, status]) => (
              <span key={name} className={`rounded-full border px-3 py-1 text-xs ${status.ok ? "border-white/10 text-zinc-400" : "border-amber-500/30 text-amber-300"}`}>
                {sourceLabel(name)} · {status.ok ? "available" : "unavailable"}
              </span>
            ))}
          </div>}
        </header>

        <section aria-label="Filters" className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setVisibleCount(25); }}
            placeholder="Search CVE, technology or title"
            aria-label="Search vulnerabilities"
            className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-blue-500/70"
          />
          <select
            value={timeRange}
            onChange={(event) => { setTimeRange(event.target.value as TimeRange); setVisibleCount(25); }}
            aria-label="Filter by time period"
            className="min-w-0 rounded-xl border border-white/10 bg-[#151820] px-4 py-3 text-sm outline-none focus:border-blue-500/70"
          >
            <option value="24h">New or updated · last 24 hours</option>
            <option value="today">New or updated · today (Berlin)</option>
            <option value="7d">New or updated · last 7 days</option>
            <option value="all">All dates · archive</option>
          </select>
          <select
            value={technology}
            onChange={(event) => { setTechnology(event.target.value); setVisibleCount(25); }}
            aria-label="Filter by technology"
            className="min-w-0 rounded-xl border border-white/10 bg-[#151820] px-4 py-3 text-sm outline-none focus:border-blue-500/70"
          >
            <option value="">All technologies</option>
            {technologyGroups.map(([category, technologies]) => (
              <optgroup key={category} label={category}>
                {[...technologies].sort().map((name) => <option key={name} value={name}>{name}</option>)}
              </optgroup>
            ))}
          </select>
          <select
            value={severity}
            onChange={(event) => { setSeverity(event.target.value as Severity | "all"); setVisibleCount(25); }}
            aria-label="Filter by severity"
            className="rounded-xl border border-white/10 bg-[#151820] px-4 py-3 text-sm outline-none focus:border-blue-500/70"
          >
            {severities.map((value) => <option value={value} key={value}>{value === "all" ? "All severities" : value}</option>)}
          </select>
          <select
            value={source}
            onChange={(event) => { setSource(event.target.value); setVisibleCount(25); }}
            aria-label="Filter by source"
            className="min-w-0 rounded-xl border border-white/10 bg-[#151820] px-4 py-3 text-sm outline-none focus:border-blue-500/70"
          >
            <option value="">All sources</option>
            {Object.keys(data?.sourceStatus ?? {}).map((name) => <option key={name} value={name}>{sourceLabel(name)}</option>)}
          </select>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300">
            <input type="checkbox" checked={exploitedOnly} onChange={(event) => { setExploitedOnly(event.target.checked); setVisibleCount(25); }} className="accent-blue-500" />
            Known exploited
          </label>
          <button type="button" onClick={() => { setSearch(""); setTechnology(""); setSource(""); setSeverity("all"); setTimeRange("24h"); setExploitedOnly(false); setVisibleCount(25); }} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 transition hover:text-white">Reset filters</button>
        </section>
        {data && <p role="status" className="mb-6 text-sm text-zinc-500">{filtered.length} of {data.vulnerabilities.length} advisories · technologies with matching advisories are listed</p>}

        {failed && <StatusMessage>{data ? "Data refresh failed. The displayed snapshot may be outdated." : "Monitoring data could not be loaded. The rest of the website remains available."}</StatusMessage>}
        {!data && !failed && <StatusMessage>Loading monitoring data…</StatusMessage>}
        {data && filtered.length === 0 && <StatusMessage>No advisories match the selected period and filters in this snapshot. Select “All dates · archive” to view older advisories.</StatusMessage>}

        <div className="grid gap-4">
          {filtered.slice(0, visibleCount).map((item) => <AdvisoryCard item={item} key={item.id} />)}
        </div>
        {filtered.length > visibleCount && <button type="button" onClick={() => setVisibleCount((count) => count + 25)} className="mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:border-blue-400/50">Show 25 more</button>}

        <p className="mt-10 text-xs leading-5 text-zinc-600">
          Advisory absence is not proof that a technology is unaffected. Installed-version evaluation may require manual verification when a source range cannot be interpreted safely.
        </p>
      </div>
    </main>
  );
}

function AdvisoryCard({ item }: { item: SecurityItem }) {
  const affected = [...new Set(item.affected.flatMap((component) => component.affectedVersions))];
  const fixed = [...new Set(item.affected.flatMap((component) => component.fixedVersions))];
  return (
    <article className="rounded-2xl border border-white/10 bg-[#151820]/80 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={item.severity} />
            {item.cvssScore !== undefined && <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300">CVSS {item.cvssScore}</span>}
            {item.exploitation.knownExploited && <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-300">Known exploited</span>}
          </div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h2>
          <p className="mt-2 font-mono text-xs text-blue-400">{item.id}</p>
        </div>
        <div className="shrink-0 text-left text-xs text-zinc-500 sm:text-right">
          <div>Published {formatDate(item.publishedAt)}</div>
          {item.modifiedAt && <div className="mt-1">Updated {formatDate(item.modifiedAt, true)}</div>}
          <div className="mt-1">Risk score {item.riskScore}</div>
        </div>
      </div>
      <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-400">{item.description}</p>
      <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 text-sm md:grid-cols-3">
        <Detail label="Technology" value={[...new Set(item.matches.map((match) => match.technology))].join(", ")} />
        <Detail label="Affected versions" value={affected.join(", ") || "Not specified"} />
        <Detail label="Fixed versions" value={fixed.join(", ") || "Not available"} />
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        {[...new Map(item.references.map((reference) => [reference.url, reference])).values()].slice(0, 3).map((reference) => (
          <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 transition hover:text-blue-300">
            {reference.source} ↗
          </a>
        ))}
      </div>
    </article>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors = { critical: "bg-red-500/20 text-red-300", high: "bg-orange-500/20 text-orange-300", moderate: "bg-amber-500/20 text-amber-300", low: "bg-blue-500/20 text-blue-300", unknown: "bg-zinc-500/20 text-zinc-300" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${colors[severity]}`}>{severity}</span>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="mb-1 text-xs uppercase tracking-wider text-zinc-600">{label}</dt>
    <dd className="break-words text-zinc-300">
      {value.length > 180 ? <details>
        <summary className="cursor-pointer text-zinc-400 hover:text-white">{value.slice(0, 140)}… <span className="text-blue-400">Show full list</span></summary>
        <p className="mt-3 leading-6">{value}</p>
      </details> : value}
    </dd>
  </div>;
}
function StatusMessage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-zinc-400">{children}</div>;
}
function formatDate(value?: string, withTime = false) {
  if (!value || value.startsWith("1970-")) return "not yet";
  const date = parseAdvisoryDate(value);
  if (!Number.isFinite(date)) return "unknown";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}) }).format(new Date(date));
}

function sourceLabel(source: string) {
  return ({ github: "GitHub Advisories", "cisa-kev": "CISA KEV", osv: "OSV", msrc: "Microsoft MSRC", nodejs: "Node.js Security WG" } as Record<string, string>)[source] ?? source;
}
