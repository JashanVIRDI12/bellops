// Writes lib/sitemap-dates.json: for each page in the sitemap, the date of
// the last commit that changed what it shows (its page file and the local
// modules it imports, minus the site-wide header, footer and analytics).
//
// Runs before every build (package.json "prebuild"). Where there's no git
// history (Vercel builds the uploaded files), it keeps the committed file.
//
//   node scripts/sitemap-dates.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const out = path.join(root, "lib/sitemap-dates.json");

/* Site-wide chrome: a change here isn't a change to any one page. */
const CHROME = [
  "components/nav/",
  "components/analytics/",
  "components/site/SiteFooter.tsx",
  "components/site/SiteMotion.tsx",
  "components/site/useStudioMotion.ts",
  "components/experience/ContactDock.tsx",
  "components/experience/CookieNotice.tsx",
  "components/three/utils/",
  "lib/analytics/",
  "lib/track.ts",
  "lib/sitemap-dates.json",
];

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

try {
  git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  console.log(
    "sitemap-dates: no git history here; keeping lib/sitemap-dates.json",
  );
  process.exit(0);
}

/** A local import to a file on disk, or null for packages. */
function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ])
    if (existsSync(candidate) && !candidate.endsWith("/")) {
      try {
        readFileSync(candidate);
        return candidate;
      } catch {}
    }
  return null;
}

/** The page file and every local module it imports, transitively. */
function sources(entry) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    const relative = path.relative(root, file);
    if (CHROME.some((prefix) => relative.startsWith(prefix))) return;
    seen.add(file);
    if (!/\.(tsx?|mjs|js)$/.test(file)) return;
    const text = readFileSync(file, "utf8");
    for (const [, spec] of text.matchAll(
      /(?:from|import)\s*\(?\s*"([^"]+)"/g,
    )) {
      const resolved = resolveImport(file, spec);
      if (resolved) visit(resolved);
    }
  };
  visit(entry);
  return [...seen].map((file) => path.relative(root, file));
}

/** The date of the last commit that touched any of `files`. */
const lastChange = (files) =>
  git(["log", "-1", "--format=%cs", "--", ...files]);

/** The sitemap's pages and their page files. */
const pages = [["/", "app/page.tsx"]];
const siteDir = path.join(root, "app/(site)");
for (const name of readdirSync(siteDir)) {
  const file = path.join(siteDir, name, "page.tsx");
  if (!name.startsWith("[") && existsSync(file))
    pages.push([`/${name}`, path.relative(root, file)]);
}
// Case studies share one page file; their data is in lib/work.ts.
const workText = readFileSync(path.join(root, "lib/work.ts"), "utf8");
for (const [, slug] of workText.matchAll(/slug: "([^"]+)"/g))
  pages.push([`/work/${slug}`, "app/(site)/work/[slug]/page.tsx"]);

const dates = {};
for (const [route, file] of pages)
  dates[route] = lastChange(sources(path.join(root, file)));

const next = `${JSON.stringify(dates, null, 2)}\n`;
const previous = existsSync(out) ? readFileSync(out, "utf8") : "";
if (next !== previous) {
  writeFileSync(out, next);
  console.log("sitemap-dates: updated lib/sitemap-dates.json");
} else console.log("sitemap-dates: up to date");
