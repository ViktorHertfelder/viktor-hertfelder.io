# hertfelder.io

Static Next.js portfolio deployed to GitHub Pages. The repository also contains a personal CVE monitor that collects GitHub Security Advisories, CISA Known Exploited Vulnerabilities, OSV, Microsoft MSRC and Node.js Security WG core reports, matches them against a structured watchlist, publishes sanitized data at `/security/`, and optionally sends a daily plain-text digest through Resend.

## Local development

```bash
npm run dev
npm run test:cve
npm run lint
npm run build
```

The static export is written to `out/`.

## CVE monitor

The public example watchlist is in `config/watchlist.example.json`. Production should use a repository secret named `CVE_WATCHLIST_JSON` containing the same JSON shape. Matchers are structured package coordinates (`ecosystem` + `name`) or product identifiers (`vendor` + `product`); unsupported generic matchers produce visible warnings and never silently match by free text. Installed versions are accepted, but are conservatively marked `unknown` until an ecosystem-aware range evaluator is available.

The default list includes Windows (intended for Windows 11 review), Office and its
applications, Exchange Server, SharePoint, GitLab CE/EE, GitHub Enterprise Server,
selected GitHub Actions toolkit packages, PHP/PHP-FPM, Composer, npm CLI,
TypeScript, Node.js, Android/Pixel, iOS/iPadOS, macOS/OS X, Chrome/Chromium and Edge,
in addition to the original web/backend stack.

The expanded default has 98 entries, including concrete coordinates for the Java,
Kotlin, JavaScript/TypeScript and PHP stack represented in `src/data/projects.ts`.
It includes Spring Web/MVC/WebFlux/Security, Jackson, Vaadin, Jsoup, Kotlin
stdlib/coroutines/serialization, Compose, Tomcat/Jetty/Netty, Express/Fastify/NestJS,
JDBC and Node database drivers, H2, MariaDB, Redis, Liquibase, Maven/Gradle,
Elasticsearch/Kibana/Logstash, and the testing tools used in those projects.
Product-only targets remain limited to the available product sources; matching
an entry does not mean every vendor security release is covered.

Product matchers can declare an `aliases` array of exact `{vendor, product}`
identifiers. These are matched against structured source fields, never against
advisory prose. CISA uses several names for the same product and combines some
Apple products; broad matches require manual applicability checks. Windows
entries may also concern other Windows releases. `coverageNote` documents these
limits per entry. Product matching covers CISA's **known exploited**
catalog plus the latest three monthly Microsoft MSRC reports for Microsoft products.
It does not cover every CVE or vendor security release. An identifier with no current
catalog entry is a configured target, not evidence of safety or complete coverage.

The `npm` entry monitors the CLI package, not the whole npm registry. JavaScript
as a language and GitHub.com service incidents are explicitly unsupported;
concrete runtime/browser/package entries provide partial coverage. Updating this
example changes the local default only: an existing `CVE_WATCHLIST_JSON` secret
must be updated separately to use the expanded list in Actions.

Run a local collection without email:

```bash
npm run cve:dry-run
```

This accesses the five public sources and rewrites `public/security-data.json`.
Source failures are isolated and displayed in the page's source status. If every
source fails, the command exits before replacing existing data. Advisory absence
is never treated as proof that a technology is unaffected.

### In-memory database and GitHub Pages

The collector uses `VulnerabilityDatabase` (`scripts/cve/database.ts`) as a
per-run TypeScript in-memory database. A Map indexes every normalized CVE, GHSA
and OSV identifier. `upsert`/`upsertMany` ingest source records; `get`/`has` look
up either a canonical ID or an alias; `all` returns one merged vulnerability per
identity. Alias bridges join existing groups. Newer records replace older
records from the same source while other providers' enrichment is retained.
Statistics report raw observations, unique vulnerabilities and duplicate observations.

The database runs only in Node.js during local collection or GitHub Actions.
It is rebuilt each run and exported as sanitized `public/security-data.json`.
GitHub Pages serves the resulting static files; no server, API route, SQL service,
native database module or new dependency is used. Cross-run email delivery
history still requires the separate private state repository described below.

### Sources and filters

- **GitHub Advisories:** up to 1,000 most recently updated global advisories.
- **CISA KEV:** the full catalog of known exploited vulnerabilities.
- **OSV:** all available advisories for enabled structured package entries,
  with pagination and withdrawn records excluded. Package names/ecosystems are
  sent to OSV; installed versions are not. Some OSV data mirrors GitHub; aliases
  merge these records instead of counting them twice.
- **Microsoft MSRC:** the latest three released monthly CVRF reports. Known-affected
  product IDs are resolved through Microsoft's product tree. Windows and Office
  product families are normalized from structured product fields. Product names
  retain their edition/version descriptions; fixed builds and vendor update links
  are used when provided. Older revisions outside this window are not collected.
- **Node.js Security WG:** individual numeric JSON reports from the official
  `nodejs/security-wg/vuln/core` directory, not its potentially stale generated
  index. Runtime product identifiers match the Node.js watchlist entry. Distinct
  CVEs in one report remain separate records. Undated reports remain undated and
  are visible through the archive rather than being misrepresented as new today.

OSV and MSRC require no additional API keys. NVD and FIRST EPSS are not integrated.
OSV numeric CVSS vectors are not calculated locally; severity labels are used when
provided, otherwise severity stays unknown until enriched by another source.

On `/security/`, combine technology, severity, source, text search and known-
exploited filters. Technology options are grouped by category and show only
technologies with matching advisories, not the entire watchlist. Source badges
show whether collection succeeded. Results are displayed in batches of 25.

The default period is **published or updated in the last 24 hours**, sorted by
the most recent source publication/modification timestamp. Other options are
today in Europe/Berlin, the last seven days, and the full archive. An old advisory
can appear in the recent view if its source reports a recent update; publication,
modification and snapshot-collection dates are displayed separately.
The page refreshes its JSON without cache every five minutes while visible and
when returning to the tab. This does not rerun collection. Snapshots older than
36 hours show an overdue-update warning rather than suggesting complete freshness.

### On-demand collection from the public page

The **CVEs jetzt sammeln** button opens the repository's existing deploy workflow
on GitHub. Sign in with a GitHub account that has repository write access, choose
**Run workflow**, keep branch **main** and the default unchecked inputs, and run
it. This collects new data and deploys the updated static site without sending
email or printing a private digest. The separate **Daten neu laden** button only
reloads the published JSON; it never starts a collection.

GitHub Pages has no authenticated server-side endpoint for dispatching workflows.
Consequently the public page contains no dispatch token or credentials and cannot
start a privileged workflow by itself. Authentication and the final dispatch
remain on GitHub. No paid backend or new hosting service is introduced.

### Required GitHub Actions secrets

- `CVE_WATCHLIST_JSON`: private production watchlist JSON. If omitted, the checked-in example is used and its scope is public.
- `RESEND_API_KEY`: Resend API key.
- `CVE_EMAIL_FROM`: verified Resend sender, for example `CVE Monitor <security@example.com>`.
- `CVE_EMAIL_TO`: digest recipient.
- `CVE_STATE_REPOSITORY`: private repository in `owner/repository` form used only for delivery state.
- `CVE_STATE_TOKEN`: fine-grained GitHub token limited to Contents read/write on that private repository.

This repository is public. Private watchlist details, installed versions, email addresses, credentials, and delivery state must not be committed. The workflow keeps the production watchlist in Actions Secrets and delivery state in a separate private repository. Public JSON contains only the matched category/technology needed by the page; entry IDs and installed versions are removed. A secret Gist is intentionally not used because it is unlisted rather than access-controlled.

### Private state setup

1. Create a private repository for monitoring state; the workflow creates `hertfelder-cve-monitor-state.json` on first successful send.
2. Create a fine-grained token limited to Contents read/write for that repository, then add its value and `owner/repository` as the secrets above.
3. Add the Resend sender/recipient secrets and production watchlist.
4. Run the workflow manually with `dry_run` enabled. Inspect the log and `/security` build before enabling `send_email`.
5. Run once with `send_email` enabled. The first digest is capped at 12 entries (25 only when `initial_backfill` is selected).

The workflow schedules collection at 07:00 with GitHub's native
`timezone: Europe/Berlin` support, including daylight-saving changes. There is
no runner-clock gate: a delayed scheduled run must still collect and deploy.
GitHub Actions schedules can be delayed or dropped under load; 07:00 is the
scheduled time, not an exact delivery guarantee. Scheduled runs collect, send,
build, and deploy. Pushes collect and deploy without sending. Manual runs default
to collection/deployment without email; enable `dry_run` explicitly only when a
digest preview in the workflow log is appropriate.

Missing email/state secrets disable email with an Actions warning while collection
and deployment continue. Collector failures also produce a warning and do not
block the static build; the checked-in public snapshot remains the fallback if
all collectors fail before generating fresh data.

### Manual smoke test

1. Run `npm run test:cve`.
2. Run `npm run cve:dry-run` with an optional `CVE_WATCHLIST_JSON` environment value.
3. Confirm output explicitly identifies missing fixed/affected-version data and includes direct source URLs.
4. Run `npm run dev`, open `/security/`, select a technology (e.g. Microsoft/Windows), then a source and severity. Confirm that the result count and cards change. Combine with text search and “Known exploited”, then reset filters. Use “Show 25 more” to load additional results.
5. Temporarily rename `public/security-data.json`, reload `/security/`, and confirm a non-fatal data error while `/` still works; then restore the file.
6. Run `npm run build` and confirm `out/security/index.html` and `out/security-data.json` exist.

### Current limitations

- GitHub, CISA KEV, OSV, Microsoft MSRC and Node.js core reports are integrated. NVD and FIRST EPSS can be added later.
- GitHub collection is capped at the 1,000 most recently updated global advisories per run to bound runtime and API use.
- CISA product matching requires normalized vendor/product identifiers; package matching requires ecosystem/name. There is deliberately no fallback free-text matcher.
- Installed-version ranges are not guessed across ecosystems; entries remain relevant with an explicit `unknown` version status for manual review.
- Resend submission confirms API acceptance, not final mailbox delivery.
