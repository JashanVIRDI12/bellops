# Release report: Bellops, 29 Oct 2026

**Branch:** `release/2026-10-29`, branched from `mobile-live-3d` (the code that's live). Committed locally. **Nothing is pushed or deployed.** The release waits for Jashan's approval.

| Step | Commit | What |
|---|---|---|
| 1 | `c09be71` | R3 task 16: the unconfirmed "+20 more" after the client logos is hidden. Everything else in Rounds 1–3 and the A/B test was already done and is verified below |
| 2 | `ed82575` | GA4 on every page via `@next/third-parties`, with the ID from `NEXT_PUBLIC_GA_ID` |
| 3 | `886e2dd` | The five posts (all `draft: true`) and their images, RSS at `/rss.xml`, the speed study's Dataset, FAQ/CSV/banner details |
| 4 | `51f489f` | Loader: route progress bar and slow-page skeleton. The first-visit intro is built but switched off (it failed the plan's LCP rule) |
| 7 | this report | |

## Before you deploy (must do)

1. **Add `NEXT_PUBLIC_GA_ID=G-GC08E6VQ91` in Vercel**, for both Production and Preview. No GA variable existed anywhere (repo, `.env*`, or Vercel; `vercel env ls` shows only SUPABASE_SECRET_KEY, ADMIN_PASSWORD, SUPABASE_URL). `.vercelignore` keeps `.env.local` off Vercel, so **a deploy without this variable has no Google Analytics at all**. The build log would warn, but nothing would fail. I didn't add it myself, per your rules.
2. Keep the five posts as drafts until the content fixes in "Open items" are done.

## Open items for Jashan

**Content to fix before publishing a post.** I copied the MDX as-is, so all of these are still in the files and would be visible once a post is published:

- `3d-website-cost-india.mdx`:
  - Line 18 is a visible box: "**Draft:** `draft: true` pending Jashan's claim review… Do not publish until Jashan confirms".
  - Line 26 ("a small remote studio") and lines 152–153 ("Remote web design and digital marketing studio") don't use the agreed wording, "Delhi-based, working remotely across India".
  - The byline says Jashan Singh, but the frontmatter says `author: Bellops`, which makes the structured data credit the studio. Pick one.
  - Every price in the post matches the prices already on the site.
- `indian-d2c-website-speed-study.mdx`:
  - Line 73 shows "(wire GA4 event `blog_csv_download` on click — see CLAUDE_TASKS_BLOG.md)" to readers. The event itself is wired.
  - The section "### Dataset & JSON-LD notes for implementers" (line 282 onward) is visible and appears in the contents list.
  - The "Research byline: Jashan Singh" vs `author: Bellops` question applies here too.
  - Still needs your sign-off: brand list, scoring rule, right-of-reply, publish date. CrUX/field data is pending.
- The other three posts had no such notes.

**Decisions and data only you can supply:**

- Microsoft Clarity project ID (Clarity is skipped until then).
- Real case-study results and client quotes (the proof slot stays hidden).
- The real number of other clients, if you want "+N more" back (`moreClients` in `lib/clients.ts`).
- The "Ready in about 2 weeks" trust line under the hero buttons (R3 task 1).
- The studio's street address and city for the structured data (only the region, Delhi, is set).
- Whether to switch on the first-visit intro anyway (see Step 4).
- Whether GA should respect Global Privacy Control (see departure 6).
- Flip `draft: false` per post when you're ready. Live-site preview of a draft needs `DRAFT_PREVIEW_SECRET` set in Vercel Production. `?preview=1` alone doesn't open drafts on the live site, by design: they make claims about real brands.

**After approval (not done now):**

1. Push and deploy.
2. The Analytics Lead confirms GA4 DebugView (page_view, experiment_impression, dock_click, blog_csv_download), registers `variant` and `experiment_id` (event-scoped) and `ab_dock` (user-scoped) as custom dimensions, and marks `dock_click` as a key event.
3. Submit `https://www.bellops.in/sitemap.xml` in Search Console.
4. Let the A/B test run 2–3 weeks before judging it.
5. Once `/api/csp-report` is clean on production, switch the CSP to enforcing (R3 task 32).

**Test traffic to filter:** my GA checks against `next start` sent about 15 page views and a few test events (experiment_impression, dock_click, blog_csv_download) from localhost to the live GA4 property on 29 Oct. Lighthouse runs against localhost sent more page views. Filter `localhost` if it shows in reports.

## Where I departed from the plan, and why

1. **Branched from `mobile-live-3d`, not `main`.** Production is deployed from `mobile-live-3d`; `main` is 78 commits behind it (all the Round 3 work, the A/B test, the blog pipeline). Branching from `main` would have rolled the site back. There is no `origin/main` to pull from (the remote is the Cursor git remote).
2. **No `loading.tsx` files.** I added `app/loading.tsx` plus ones for /work and /3d-website-design, then removed them. With a loading boundary, React sends every prerendered page with its skeleton first and the real content in a hidden block that an inline script reveals a frame later. That breaks the loader spec's own rules: it delays the first real paint (LCP), and crawlers that don't run JavaScript see the whole page as hidden. The same skeleton is shown from the browser instead, only when a navigation is still pending after 400 ms (`components/site/RouteProgress.tsx`); the server HTML is unchanged.
3. **One edit to a delivered post.** `indian-d2c-website-speed-study.mdx` line 83 was an HTML comment (`<!-- … -->`), which doesn't compile as MDX and stopped the build. It is now the same note as an MDX comment (`{/* … */}`), still invisible. No other byte of the five posts was changed (posts are now in `.prettierignore` so `npm run format` can't rewrite them).
4. **Speed-study Dataset in code, not frontmatter.** The delivered post has no `dataset:` block, and the MDX had to stay as delivered, so the Dataset lives in `lib/mdx/post-datasets.mjs` keyed by slug. Every fact in it is from the post's text and the CSV's columns.
5. **Banner `priority`.** Next 16 deprecates `priority` on next/image; the banner uses its replacement (`loading="eager"` + `fetchPriority="high"`) with the plan's `sizes`. The speed study's first picture is its 2400×1260 hero infographic, not a 1600×900 banner, so it's sized from the file (forcing 1600×900 would distort it).
6. **GA4 behaviour changes** (side effects of the plan's `@next/third-parties` component):
   - It now loads for visitors whose browser sends Do Not Track or Global Privacy Control (the old tag skipped them, which may be why the owner couldn't see it). The site's own first-party analytics still respect DNT/GPC. If you want GA to respect GPC too, that's a small follow-up with Google consent mode.
   - gtag.js is preloaded in the page head and runs right after hydration, where R3 task 26 had it wait for load + idle. Cost: see Step 6.
   - Still off on `/admin` (no third-party script next to enquiries), and off in `next dev`.
7. **RSS link on every page.** The plan puts the feed in the root metadata's `alternates.types`; Next replaces a layout's `alternates` with any page's own, and 10 pages set their canonical there, so the feed link is added to those pages too (`feedTypes` in `lib/seo.ts`).

## Step 1: Rounds 1–3 and the A/B test

### CLAUDE_TASKS.md (Rounds 1–2)

"Verified" means I checked the code and the HTML served by `next start` on this branch. The commit is where it was done.

| # | Task | Status | Evidence |
|---|---|---|---|
| 1 | P0 domain: www everywhere | Done (verified) | `metadataBase`/`siteUrl` = https://www.bellops.in; home canonical and og:url `https://www.bellops.in/`; robots.txt as specified; sitemap all-www with no changefreq/priority; JSON-LD has no bare-domain URLs (6ee6adc) |
| 2 | Desktop 3D weight | Done (verified), one target missed on purpose | `dynamic(..., { ssr: false })` (Stage.tsx), mounts at idle after the first still (poster), skips at ≤4 cores and reduced motion, `frameloop` demand, dpr capped at 1.5. Models 2.34 MB → 1.15 MB (office) and 0.85 → 0.68 MB (laptop). **The office is still over the 1 MB target**: stronger compression thinned the plants and wiped the laptop's key legends, so it was rejected (b0153a2) |
| 3 | Mobile LCP / Speed Index | Done (verified) | `p.intro-description` is in the server HTML at full opacity (transform-only entrance); one priority still per page; correct `sizes` (2ed4288, d28f948, dc768eb) |
| 4 | Home on-page SEO | Done (verified) | Title "3D & Premium Website Design Agency in India \| Bellops"; H1 "Premium 3D Website Design Agency in India". Meta description is now the approved homepage-rewrite copy (task 34), which replaced this one. The old subheading was later removed (R3 task 1) |
| 5 | Schema | Done (verified); city blocked | WebSite node; Organization is `["Organization","ProfessionalService"]` with telephone +918586875703, logo, sameAs Instagram (now @bellops.in, R3 task 8). Address is region Delhi + country IN only. **Street address/city: [NEEDS JASHAN]** |
| 6 | Caching | Done (verified) | Year-long immutable cache only on content-hashed `/models` and `/projects` files; `images.minimumCacheTTL` 2678400 (9f42c05, 46c2f94, 7d59244) |
| 7 | JavaScript | Done (verified) | Modern browserslist; GSAP and its plugins imported one by one, lazily; forced reflow fixed; lighter icons (1841779, 58769af) |
| 8 | Routing | Done (verified) | /services, /blog, /work, /about, /contact all answer 200; unknown paths 404 |
| 9 | /3d-website-design | Done (verified) | Published with Jashan's answers filled in: prices, timelines, stack, terms (215ffe3) |
| 10 | Scaffold routes | Done (verified) | /premium-website-design and /landing-pages with the specified titles and H1s; /work plus case studies; blog posts arrive in this release |
| 11 | Internal links | Done (verified) | Hub-and-spoke links, nav and footer to every service page, /work and /blog (a4628f7, 856aed9) |
| 12 | Loader | Done (verified) | The old "Opening the studio" loader is gone; hero text and CTAs are in the server HTML; the 3D loads behind a still (2ed4288) |
| 13 | Mobile sticky WhatsApp | Done (verified) | Now the A/B dock (see AB_TEST_DOCK.md below) |
| 14 | Hero CTAs | Done (verified) | Replaced by the approved homepage-rewrite CTAs (task 34): "Get a quote for your website" / "Chat on WhatsApp" / "See our work" |
| 15 | Form | Done (verified) | Message optional; New website / Redesign / Ads chips; `generate_lead` only after a successful submit (a55c70d) |
| 16 | Service-card WhatsApp | Done (verified) | Per-service prefilled message (now the R3 task 3 quote wording) |
| 17 | Service prices | Done (verified) | "From ₹X" on every card. ₹50,000 and ₹20,000 are Jashan's; the rest were set at his request from 2026 agency rate guides (ae61c86) |
| 18 | Proof strip | Partly done; quotes blocked | Logo strip live; the quote slot stays hidden. **Quotes and results: [NEEDS JASHAN]** |
| 19 | GA4 + Clarity | GA4 implemented now (step 2); Clarity blocked | **Clarity project ID: [NEEDS JASHAN]** |
| 20 | lib/track.ts | Done (verified), extended now | Same signature as sendGAEvent; events now queue until gtag exists (step 2) |
| 21 | Event names | Done (verified) | whatsapp_click {location, button, variant}, generate_lead {form, variant}, cta_click {cta, location}, contact_click {method, variant} |
| 22 | Breadcrumbs | Done (verified) | Visible crumbs plus BreadcrumbList on every inner page (b3bb30b) |
| 23 | Hub and spoke | Done (verified) | "Related work" and a contact CTA on each service page; the footer lists every hub |
| 24 | More scaffolds | Done (verified) | All 10 routes exist with metadata. They join the sitemap only once their copy is in (R3 task 24) |
| 25 | /blog/[slug] | Done (verified) | MDX, Article schema, link to its hub |
| 26 | Security headers | Done (verified) | HSTS, nosniff, SAMEORIGIN, referrer and permissions policies; CSP report-only; `poweredByHeader: false` |
| 27 | Render-blocking CSS | Done (verified); `optimizeCss` not used on purpose | In Next 16 `optimizeCss` only runs in the Pages Router, so it would do nothing here. 3D and Lenis CSS are out of the root layout (9426b72) |
| 28 | Images | Done (verified) | 112px logo with matching `sizes`; one priority image; AVIF/WebP |
| 29 | Fonts | Done (verified) | next/font, `display: swap`, latin subset, no @import or Google Fonts `<link>` |
| 30 | 404 | Done (verified) | Main-page links, WhatsApp CTA, a single `noindex` |
| 31 | Schema templates | Done (verified) | Service, CreativeWork, BreadcrumbList, BlogPosting, all pointing at `#organization` |
| 32 | Accessibility | Done (verified) | Reduced motion disables Lenis and GSAP intros; canvas `aria-hidden`; visible `:focus-visible` everywhere (745d16c) |
| 33 | Monitoring | Done (verified) | `<SpeedInsights/>` and a weekly Lighthouse CI workflow with LCP < 2.5 s and < 1.5 MB budgets |
| 34 | Homepage copy | Done (verified) | Approved rewrite applied with FAQPage JSON-LD matching the page word for word (1ff5ace) |

### CLAUDE_TASKS_R3.md (Round 3)

| # | Task | Status | Evidence |
|---|---|---|---|
| 1 | Hero: one headline, no duplicate | Done (verified); trust line blocked | The H1 text is in the HTML once; the second layer draws its copy from a data attribute (3c9b374). **"From ₹50,000 · Ready in about 2 weeks · …" waits on the timeline: [NEEDS JASHAN]** |
| 2 | Logos link to case studies | Done (verified) | 90717c0 |
| 3 | Per-service WhatsApp | Done (verified) | `whatsapp-service-{slug}` tracking; quote wording (26bd7fe) |
| 4 | Mobile dock pill | Replaced by AB_TEST_DOCK.md | See below |
| 5 | One location phrase | Done (verified) | "Delhi-based, working remotely across India"; /about title "About Bellops: Delhi-Based Web Design Studio" (14f015a) |
| 6 | Case-study template | Done (verified) | Empty sections stay hidden (3fdcf3d) |
| 7 | Proof strip slot | Done (verified) | Hidden until quotes exist (58d0a6e) |
| 8 | Instagram @bellops.in | Done (verified) | The only Instagram URL is `instagram.com/bellops.in/`; no `bellops.ai` anywhere |
| 9 | Pricing FAQ | Done (verified) | 4629739 |
| 10 | Typo "than expected" | Done (verified) | 0b87511 |
| 11 | "Landing pages" in the form | Done (verified) | Present in "What do you need?" on /contact |
| 12 | Nav link + home footer | Done (verified) | b29a305 |
| 13 | Chip overlap | Done (verified) | The chips are New website / Redesign / Ads; there's no "Website" chip |
| 14 | Consistency | Done (verified) | 9e08077 |
| 15 | Stronger H1s | Done (verified) | /work and case-study H1s from the review file (4736711) |
| 16 | "GrowGuides + 20 more" | **Implemented now** (c09be71) | The "+20 more" count is hidden until Jashan confirms a number (`moreClients` in lib/clients.ts); the strip ends with "See all our work". GrowGuides stays, by name |
| 17 | Beacon + every WhatsApp link tracked | Done (verified) | a600371 |
| 18 | Home title/H1, 3D H1 | Done (verified) | 37691c8 |
| 19 | Canonical + /index 301 | Done (verified) | `/index` → 301 → `/` |
| 20 | Footer hubs, no met.no | Done (verified) | 856aed9 |
| 21 | Shorter titles | Done (verified) | eb7b746; /about per Jashan's decision |
| 22 | /work ItemList | Done (verified) | c3796d9 |
| 23 | /blog route | Done (verified) | 2650e9c; this release adds the posts |
| 24 | Scaffolds, two-way links | Done (verified) | 7262e33 |
| 25 | Desktop 3D after first interaction | **Reverted at Jashan's request** | c8ea8bc: waiting for a first interaction opened the home page on a still photo. The 3D starts at the first idle moment again. `frameloop` demand, dpr 1.5 and the off-screen pause remain |
| 26 | GA lazyOnload | Superseded by step 2 | GA4 now loads through @next/third-parties (`afterInteractive` plus a preload), per the release plan. See the Lighthouse notes |
| 27 | intro-description full opacity | Done (verified) | No opacity on `.intro-description`; text is in the server HTML |
| 28 | Hashed-only immutable + 301s | Done (verified) | 46c2f94 |
| 29 | Image cache TTL | Done (verified) | 7d59244 |
| 30 | Code split + browserslist | Done (verified) | 58769af |
| 31 | 404 robots + real lastmod | Done (verified) | 8b416d3 |
| 32 | Enforce CSP | Blocked (later) | Stays report-only until production `/api/csp-report` is clean; needs live data |

### AB_TEST_DOCK.md (dock_pill_v1)

Done (verified), from 74f4e2c. Changed in step 2 so its events wait for gtag.

- 50/50 split with a sticky 90-day `ab_dock` cookie, merged into the existing `proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`).
- Both variants are built, using the site's WhatsApp icon and keeping the scroll hide/show behavior.
- The site-wide WhatsApp listener skips `[data-variant]`.
- `variant` is on whatsapp_click, contact_click and generate_lead.

## Steps 2–4: checklists

### Step 2: GA4 checks (`next start`, real Chrome, Pixel 7 emulation)

- [x] `googletagmanager.com/gtag/js?id=G-GC08E6VQ91` is in the HTML of `/`, `/contact`, `/blog`, a post, `/about` and the 404. It's absent on `/admin/login`, as intended.
- [x] gtag.js loads (200), and exactly one `page_view` reaches `/g/collect` on `/`, `/contact`, `/blog` and `/blog/indian-d2c-website-speed-study`.
- [x] `experiment_impression` fires once per page view. It carries `variant` and `experiment_id: dock_pill_v1`, with the `ab_dock` user property.
- [x] A dock tap sends one `dock_click`, and no `whatsapp_click`, so it isn't double counted. GA's own enhanced-measurement outbound `click` also appears.
- [x] The CSP (still report-only) already allows `www.googletagmanager.com` in script-src, and `*.google-analytics.com`, `*.analytics.google.com` and `*.googletagmanager.com` in connect-src/img-src.
- [x] A build without `NEXT_PUBLIC_GA_ID` prints a warning and succeeds, with no GA tag in the HTML.
- [ ] GA4 DebugView: for the Analytics Lead after deploy.

### AB_TEST_DOCK.md checks

- [x] Clearing the cookie (a fresh browser context each time) showed both variants (icon and pill) over 6 visits, and each visitor's cookie matched the dock they saw.
- [x] Events fire once each: impression once per view, dock_click once per tap.
- [ ] GA4 custom dimensions (`variant`, `experiment_id` event-scoped; `ab_dock` user-scoped) and dock_click as a key event: for the Analytics Lead after deploy.

### CLAUDE_TASKS_BLOG.md §7 (with `/rss.xml`)

- [x] `next build` succeeds. `/blog` and all five posts are statically generated, and drafts are gated (see below).
- [x] On a live-site build (`VERCEL_ENV=production`, without the preview secret), all five drafts and the template return 404, `?preview=1` included. None of them are in the sitemap, RSS or `/blog`, and `/blog` shows "Coming soon". With the secret, each opens with 200 and `noindex, nofollow` in both the meta tag and `X-Robots-Tag`.
- [x] Development or preview builds, or the live site with the preview secret: drafts are visible with `noindex, nofollow` (and `X-Robots-Tag` with the secret).
- [x] `/blog/indian-d2c-website-speed-study` renders the full 49-row ranking table, 6 images and the CSV link, which returns 200.
- [x] The CSV download is the cleaned medians file (51 lines: header plus 50 brands). Clicking it queues `blog_csv_download {post: "indian-d2c-website-speed-study", file: "bellops-d2c-mobile-speed-50.csv"}`. DebugView confirmation comes after deploy.
- [x] JSON-LD: BlogPosting/Article, BreadcrumbList and FAQPage on every post, plus Dataset on the speed study (validation below).
- [x] The `og:image` and `twitter:image` absolute URLs resolve (200) for all five posts.
- [x] Contents-list anchors: every TOC link has a matching heading id. They're plain `<a href="#id">` links, so keyboard accessible.
- [x] Nav (desktop and mobile menu) and footer show Blog (already in place).
- [x] `/rss.xml` is well-formed (`xmllint`) with zero items, since everything is a draft. `/blog/rss.xml` → 308 → `/rss.xml`.
- [x] The sitemap includes `/blog` and no posts.
- [x] Lighthouse mobile on `/blog` and one post: see Step 6.
- [x] No invented numbers in the UI around the posts. All prices in the cost post match the prices already on the site.
- [x] Internal links return 200: /3d-website-design, /premium-website-design, /seo-services, /contact, /landing-pages, /work, /website-care-plans, /work/{baba-luxury-cars, pushwebb, chase-healthcare-wellness}, /blog/indian-d2c-website-speed-study, /blog/3d-website-cost-india. The two blog links are 200 only where drafts show, since both are drafts.
- [x] External links have `target="_blank" rel="noopener noreferrer"` (78 on the five pages, 53 of them in the post text).

### CLAUDE_TASKS_LOADER.md checklist

- [x] **First visit: the intro shows once.** Tested while it was switched on. It showed with `pointer-events: none` and was gone by 1.7 s. It didn't replay on reload or on another page in the same tab (`bellops_intro_seen`). It never showed with reduced motion, for a Googlebot user agent, or on /admin. **It's now switched off** (Step 4 and Step 6). The component is kept, and turning it on is one line in `app/layout.tsx`.
- [x] **Reduced motion: nothing animates.** There's no intro, the route bar appears and disappears without moving, and the skeleton doesn't pulse.
- [x] **Navigating between pages shows the top bar, and it completes** (data-state idle → loading → done, ending at opacity 0).
- [x] **A slow page shows its skeleton.** With page data delayed 1.5 s, the skeleton appeared at 400 ms (the hero variant for /3d-website-design) and was gone when the page arrived.
- [x] **The pages' HTML is unchanged:** no skeleton and no hidden content blocks, the same as the baseline build.
- [x] **`npm run build` passes, with no hydration warnings** and no console errors in `next start`.
- [x] **3D and heavy sections already have placeholders.** The home page's 3D shows a still first. The public pages' other "3D" sections are flat images; the lazy 3D components with fallbacks appear only on /playground.
- [x] **No new fonts or files.** The intro reuses the header's wordmark (the same `sizes`, so the same download); the rest is CSS.
- [x] **Lighthouse before and after:** see Step 6.

## Step 5: build and static checks (final branch state)

- `npm run build`: passes (52 pages). The five posts are prerendered and `/rss.xml` is static.
- `npx tsc --noEmit`: clean. `npm run lint` (`eslint`): clean.
- Prettier: the changed files are clean. The only remaining warnings are pre-existing (untracked task notes and `scripts/capture-project.mjs`).
- Hydration: no warnings or console errors in `next start`, checked in Chrome on `/`, `/contact`, `/about`, `/work`, `/3d-website-design`, `/blog` and a post. The only console noise is pre-existing: Speed Insights' script 404s off Vercel, unused CSS preloads, and three.js's `THREE.Clock` deprecation.
- **JSON-LD:** validated offline against the schema.org vocabulary (every type, and every property on its type) and Google's required fields for Article, FAQPage, BreadcrumbList and Dataset. Pages checked: `/`, `/blog`, `/blog/indian-d2c-website-speed-study`, `/blog/3d-website-cost-india`, `/blog/core-web-vitals-soft-navigations-2026`. Result: no problems. (The linter does catch planted mistakes, so the clean result means something.) Google's Rich Results Test needs a public URL, so run it once a preview deployment exists.
- `curl -s localhost:3000/rss.xml | xmllint --noout -`: passes. The sitemap has no drafts.
- Files changed in the release (excluding `content/blog` and `public/blog`): `.env.example`, `.gitignore`, `.prettierignore`, `README.md`, `app/globals.css`, `app/layout.tsx`, `app/rss.xml/route.ts` (moved from `app/(site)/blog/rss.xml`), `app/(site)/{3d-website-design,about,blog,blog/[slug],contact,services,work,work/[slug]}/page.tsx`, `components/analytics/GoogleAnalytics.tsx`, `components/blog/PostImage.tsx`, `components/experience/{Chapters,ContactDock}.tsx`, `components/site/{DraftPage,PageSkeleton,RouteProgress,Splash}.tsx`, `lib/analytics/ga.ts`, `lib/blog-index.json`, `lib/clients.ts`, `lib/content.ts`, `lib/mdx/{post-datasets,post-outline}.mjs`, `lib/seo.ts`, `lib/services.ts`, `lib/sitemap-dates.json`, `lib/track.ts`, `mdx-components.tsx`, `next.config.ts`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `scripts/blog-index.mjs`. Added: five posts in `content/blog/` and 21 files in `public/blog/`.
- GA4 env var used: **`NEXT_PUBLIC_GA_ID`**, new, set to `G-GC08E6VQ91` in `.env.example` and `.env.local`. Not yet in Vercel.

## Lighthouse mobile (Step 0 and Step 6)

**Method:**
- Lighthouse 13.5.0, `--preset=perf --form-factor=mobile --screenEmulation.mobile`, headless Chrome.
- 3 runs per page; each number in the tables is the median of its 3 runs.
- "Local" means `next start` on this Mac.

### Before (Step 0, baseline: `mobile-live-3d` @ 9e0b5a9)

| Page | Local Perf | Local LCP | Local CLS | Local TBT | Prod Perf | Prod LCP | Prod CLS | Prod TBT |
|---|---|---|---|---|---|---|---|---|
| / | 95 | 1.74 s | 0 | 136 ms | 90 | 2.72 s | 0 | 139 ms |
| /3d-website-design | 98 | 1.88 s | 0.063 | 60 ms | 92 | 2.61 s | 0.084 | 80 ms |
| /premium-website-design | 96 | 2.68 s | 0.003 | 43 ms | 89 | 3.26 s | 0.003 | 90 ms |
| /work | 99 | 1.74 s | 0 | 34 ms | 94 | 2.43 s | 0 | 71 ms |
| /contact | 99 | 1.78 s | 0.011 | 32 ms | 94 | 2.49 s | 0.002 | 73 ms |

### After (Step 6): provisional

These were measured on this Mac after Steps 1–4, with the intro switched on, and include GA4.

| Page | Perf | LCP | CLS | TBT | Speed Index |
|---|---|---|---|---|---|
| / | 93 | 1.77 s | 0 | 160 ms | 4.86 s |
| /3d-website-design | 96 | 1.97 s | 0.063 | 107 ms | 2.91 s |
| /premium-website-design | 91 | 3.03 s | 0 | 146 ms | 2.98 s |
| /work | 97 | 1.88 s | 0 | 109 ms | 2.96 s |
| /contact | 97 | 1.94 s | 0.001 | 94 ms | 2.88 s |
| /blog | 98 | 1.76 s | 0 | 65 ms | 2.91 s |
| /blog/indian-d2c-website-speed-study?preview=1 | 97–98 (2 runs) | 1.87 s | 0 | 106 ms | 2.95 s |

**Intro on vs off.** Same build, intro switched off, same session:

| Page | LCP with intro | LCP without | Speed Index with intro | Speed Index without |
|---|---|---|---|---|
| / | 1.77 s | 1.73 s | 4.86 s | 3.84 s |
| /contact | 1.94 s | 1.91 s | 2.88 s | 1.86 s |
| /premium-website-design | 3.03 s | 2.89 s | 2.98 s | 2.00 s |

The intro costs about 1 s of Speed Index on every page. It also puts the home page's LCP above its 1.74 s baseline. The plan says to reduce the loader to the route bar in that case, so the intro is off in the release.

**Caveat on these numbers.** Lighthouse's CPU benchmark on this Mac fell from about 3,150 (all "before" runs) to about 1,350–1,900 ("after" runs). The Mac was running on battery at 11–12%, so macOS was throttling it. A slower CPU inflates TBT and LCP on its own, so the before/after differences above overstate the release's cost.

**Where the remaining cost comes from.** The "before" local runs had no GA at all (the old tag skipped localhost). The plan's `@next/third-parties` component preloads gtag.js (177 KB) in the page head at High priority. On /premium-website-design, whose LCP element is the hero text, that download overlaps the page's own critical requests (0.6 s to 3.8 s in the trace). That is the main reason for its LCP and TBT increase. The page's 5-point drop (96 → 91) is the only one over the plan's 3-point limit, and it was measured with the intro on and a throttled CPU.

**Pending: a fair before/after run.** The fair comparison is to build the baseline (`mobile-live-3d`) and this branch side by side and alternate their runs, with the Mac on mains power, so both builds see the same CPU. I didn't start it at 10% battery: it's about 30 minutes of full CPU load and could have shut the Mac down. It should replace the "After" table above before deploying, and it settles the /premium-website-design question.

If gtag.js's preload still costs more than 3 points there, the fix is small: render the same `@next/third-parties` component only after hydration, so there's no head preload. The tag still loads on every page right after hydration, but its address is no longer in the HTML. I haven't made that change because the plan asked for the component as documented.
