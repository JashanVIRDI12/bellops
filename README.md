# Bellops

The Bellops site. The home page pairs an editorial studio story with a live 3D
backdrop, project presentations, and daylight and weather that follow the visitor.

## Design and motion

The shared design system is in `app/studio.css`. Home-page scenes live in
`components/experience/Chapters.tsx`; service and work pages reuse the same
photography, typography, device compositions, and footer.

`components/site/useStudioMotion.ts` owns the GSAP entrance timeline, scroll
reveals, photo and project parallax, manifesto, marquee, and magnetic buttons.
Animations are scoped and reverted on navigation, and disabled for reduced
motion. The live studio renderer rests while the editorial sections cover it.

## October updates

The package in `Downloads/website-fixes 2` has been adapted to the current site:

- Instagram links and structured data share `INSTAGRAM_URL` (`@bellops.in`).
- Contact and footer include the tracked Instagram DM “START” invitation.
- The privacy page and links are deferred at the owner's request.
- Meta Pixel is ready in `components/analytics/MetaPixel.tsx`. Leave
  `NEXT_PUBLIC_META_PIXEL_ID` empty until the real pixel and privacy notice are
  ready. It stays off on localhost, admin routes, and browsers requesting
  Do Not Track or Global Privacy Control. PageView follows route changes;
  Contact covers WhatsApp links across public pages; Lead fires once after a
  successful enquiry, without sending the form's personal fields to Meta.
  Conversions API is not enabled.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier
- `pnpm db:check` — checks the Supabase connection

## Folders

- `app/` — routes (App Router)
- `components/` — React components
- `lib/` — shared code
- `public/` — static files

## Branding and SEO

Typography pairs Space Grotesk headings with Manrope body text, served locally
through `next/font`. Service descriptions are in `lib/content.ts`.

The supplied silver and purple logo is used in the header, browser favicon,
Apple touch icon, install icons and the social sharing banner. Assets live in
`public/brand/`; Next.js serves the browser icons from `app/`.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the final
public origin before building. It defaults to `https://www.bellops.in` (the
bare domain redirects there, so www is the canonical host). The same
origin drives canonical URLs, Open Graph and Twitter cards, structured data,
`/robots.txt` and `/sitemap.xml`. The sitemap includes only the public home page;
`/playground` and `/logo-preview` carry `noindex` metadata.

Set `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` to the verification
token content values from your own Search Console or Webmaster Tools account.
After deploying, verify ownership and submit `/sitemap.xml` in those accounts.
Leave those values empty until you have real tokens.

Sharing previews use `public/brand/share-banner.jpg` at 1200 × 630 pixels. The
manifest supplies 192px and 512px icons, including a separate maskable asset.
This provides home-screen branding; the site still needs a network connection.

## Contact: WhatsApp and the enquiry form

Visitors can reach the studio two ways (call and email buttons are switched
off for now):

- **WhatsApp:** "WhatsApp us" in the intro, "Chat on WhatsApp" in the contact
  section, and a floating button during the tour. Each opens a chat with a
  greeting already typed.
- **Enquiry form:** in the contact section. It asks for a name, an email or a
  phone number, an optional budget and services, and a message.

The floating button hides on the intro and the contact section, which have
their own.

Contact details live in `lib/content.ts`: WhatsApp goes to `whatsapp`
(+91 85868 75703), and the footer links to Instagram
([@bellops.in](https://www.instagram.com/bellops.in/)). The budget ranges and
form wording are there too.

**Cookie notice.** A small notice explains that the site uses cookies and
similar storage. Pressing OK hides it for a year (it remembers this in a
`bellops-cookie-notice` cookie). Its wording is `cookieNotice` in
`lib/content.ts`.

## Admin portal

Enquiries arrive at [/admin](http://localhost:3000/admin), behind one shared
password. There you can:

- filter by status (New, Contacted, Won, Lost) and search;
- reply by email, phone or WhatsApp from each enquiry;
- change an enquiry's status, delete it, or export everything as a CSV file.

To set it up, copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD`.
On Vercel, add the same variable under Settings → Environment Variables, then
redeploy. Without a password, the portal stays switched off.

**Database: Supabase.** Enquiries are saved in a free
[Supabase](https://supabase.com) database. Setup takes about five minutes:

1. **Create a project.** Either open your Vercel project's **Storage** tab and
   connect Supabase (this creates the project and adds `SUPABASE_URL` and
   `SUPABASE_SECRET_KEY` to Vercel for you), or create a project at
   [supabase.com](https://supabase.com/dashboard).
2. **Create the tables.** In the Supabase dashboard, open **SQL Editor**, paste
   the contents of [`supabase/schema.sql`](supabase/schema.sql) and press
   **Run**. It's safe to run again.
3. **Add the keys locally.** In `.env.local`, set `SUPABASE_URL` (from the
   project's **Connect** dialog) and `SUPABASE_SECRET_KEY` (from **Settings →
   API Keys**, the key starting `sb_secret_`). With Vercel, `vercel env pull
.env.local` copies them for you. If you created the project yourself, add
   both to Vercel's Environment Variables too, then redeploy.
4. **Check it.** Run `pnpm db:check`. It confirms the connection and the
   tables.

With the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
signed in to the account that owns the project, step 2 is one command (also
how to apply later changes to `schema.sql`):

```bash
npx supabase db query --linked --project-ref <project-ref> --file supabase/schema.sql
```

The live project is `sfxnrcphhoptarrtnhfp` (account jashancoc12@gmail.com).

The secret key stays on the server; never prefix it with `NEXT_PUBLIC_`. The
tables have row level security switched on with no public access, so the
publishable key can't read enquiries. Without Supabase keys, local
development saves to `.data/leads.json` (ignored by git). On Vercel, the form
asks visitors to use WhatsApp or email until Supabase is connected, and the
admin portal says what's missing.

**Email alerts (optional).** Set `RESEND_API_KEY` and `LEADS_NOTIFY_TO` to
email each new enquiry through [Resend](https://resend.com). To send from
your own address, verify your domain in Resend and set `LEADS_NOTIFY_FROM`.

**Security.** Sign-ins last 7 days, in an http-only cookie that is only
sent to `/admin` pages. Every admin page, action and the export check the
session on the server. Wrong passwords are limited to 8 per 15 minutes,
and enquiries to 5 per 10 minutes, per connection. Changing `ADMIN_PASSWORD`
signs every device out. `/admin` is excluded from search engines.

## Analytics

`/admin/analytics` shows how the site is doing, for today or the last 7, 30
or 90 days:

- visitors, page views, time on site, engaged visits, contact rate and
  enquiries, with a visitors-per-day chart;
- where visitors come from (Google Ads, Meta Ads, Instagram, Google Search,
  Direct, …), ad campaigns, referring sites, cities and devices;
- how far through the tour visitors get, and which buttons they press
  (WhatsApp, the form, project links);
- site speed measured on visitors' own devices (Core Web Vitals);
- the 30 most recent visits, and a CSV export of every event.

Each enquiry also records where its visit came from, its city and device.

**Campaigns.** Tag ad links so campaigns show by name, for example
`https://www.bellops.in/?utm_source=meta&utm_medium=paid&utm_campaign=diwali`.
Google Ads auto-tagging (gclid) is recognised without tags.

**Privacy.** The site's own analytics use no cookies (the only first-party
cookie is the cookie notice's own). A visit ID lives in the
browser tab's session storage and is gone when the tab closes. The server
never stores IP addresses: visitors are counted with a one-way hash that
changes every day, and the city comes from Vercel's coarse IP location.
Browsers that send Do Not Track or Global Privacy Control, bots and visits
from localhost (unless `ANALYTICS_IN_DEV=1`) aren't counted.

**Google Analytics.** Google's tag (GA4 property `G-GC08E6VQ91`) also runs,
loaded once the page is idle so it never holds up the first paint. It sets
Google's own `_ga` cookies, which the cookie notice covers. It stays off for
Do Not Track and Global Privacy Control, on `/admin` and on localhost. The
measurement ID is in `components/analytics/GoogleAnalytics.tsx`.

How it works: `components/analytics/Tracker.tsx` batches events and sends them
to `/api/collect` when the page is hidden or a contact button is pressed;
`analytics_summary` in `supabase/schema.sql` builds the whole report in one
query.

## Home page: the studio tour

The page scrolls normally. A fixed stage behind it plays the camera shot that matches each section.

- **Desktop:** the live 3D scene. It loads in its own chunk once the page has painted and the browser is idle, and renders only while something moves.
- **Phones and tablets:** the same live scene, tuned for phone graphics chips
  (see "On phones" below).
- **Slow devices and reduced motion:** pre-rendered stills of the same shots, crossfading as you scroll.

**On phones.** The camera flies through the studio exactly as on desktop,
with framings composed for a tall screen: on the work shots the sign sits on
top, the laptop in the middle and the project name below. The view also
answers to the hand: dragging a finger sideways turns it (it springs back on
release), and on Android tilting the phone shifts it like a view through a
window. iOS only shares tilt after a permission prompt, so it's skipped there.
Everywhere, the camera banks slightly into turns and the lens widens a touch at
speed; both settle to nothing as it lands on a shot.

To stay smooth, phones load an office model with smaller textures (a quarter
of the graphics memory), skip the post-processing pass (they antialias
natively instead and draw the vignette in CSS), use smaller shadow and
reflection maps and a lighter sky, and cap the pixel count. On every device
the sun's shadows are drawn while it sweeps in and then kept, since nothing in
the room moves.

Which devices get 3D: phones with a known budget graphics chip, under 4 GB of
memory, Data Saver or a 3G connection get the stills straight away, and so do
computers with 4 CPU cores or fewer. Everyone else gets the live scene, which
only fades in once it holds a smooth frame rate: a slower device first renders
fewer pixels, then hands over to the stills, and is remembered for the rest of
the visit. To test a renderer on a real device, add `?render=live`
(this device's 3D settings), `?render=mobile`, `?render=desktop` or
`?render=stills`. Tilt needs HTTPS, so it only works on the deployed site.

**Loading.** Nothing holds the page up: the opening copy is in the page's
HTML and paints straight away (in light colors over the dark backdrop),
then eases into its mood's colors as the first still fades in behind it. A
tiny inline script picks that still from the visitor's clock (the same hours
as `lib/atmosphere.ts`, or a `?scene=` preview) and preloads it at high
priority before any JavaScript runs; the other stills load later, and only
where the stills carry the tour. On devices that get 3D, the live studio
downloads, warms up out of sight (every texture uploaded, every shader
compiled, each shot drawn once with nothing skipped for being out of view,
so the camera never stalls on something new mid-flight), then crossfades in
and the sun sweeps in. A thin line along the top of the screen tracks it.
Devices that get the stills never download the models.

While the tour runs, anything heavy waits for the camera to rest: the sign's
reflection updates, and a lower resolution if the frame-rate check asks for
one (resizing the 3D costs a frame).

The studio matches each visitor's world automatically, with no controls and
no prompts. Their device clock sets the time of day. Their area comes from
coarse IP location: Vercel's built-in headers on Vercel, or a lookup through
[GeoJS](https://www.geojs.io/) on other hosts and in local development. If the
visitor already granted this site their location before, that is used instead.
Coordinates are rounded to two decimals and never stored.

With a known area, SunCalc calculates the sun's altitude rather than assuming
a fixed sunset time. An IP-based area whose sun time is more than 3.5 hours
from the device's time zone (a VPN, a roaming SIM) is ignored, and the scene
follows the device clock instead. If the forecast is unavailable, the area
still sets day and night, and lookups are retried every 5 minutes. Night switches on warm ceiling and wall lights; cloudy skies
soften the sun; rain and snow stay outside the office. Weather failures leave
the time-of-day scene working.

Outside the windows, the studio sits high above a slow-moving sea of clouds.
It is rendered rather than photographed, so perspective, depth and light match
the room from every camera angle: soft gold cloud tops by day, rose and peach at
dusk, a moonlit blanket with faint warm city light glowing through at night, and
cloud pressed up against the glass when it's overcast or raining. There is no
image to download. Glass reflects the lit room at night; rain adds subtle
droplets and distant haze.

`/api/weather` proxies [MET Norway's Locationforecast API](https://api.met.no/weatherapi/locationforecast/2.0/documentation),
with hourly upstream caching (a cached forecast more than 3 hours old is
fetched again) and an identifying BellOps User-Agent. No API key
is required. The contact footer credits MET Norway, as their [license](https://api.met.no/doc/License) requires.
The forecast changes the scene's appearance; it is not an observed weather station reading.
The automatic IP response is private; coordinate-based responses can be cached.

To preview a mood directly, open `/?scene=night` (also `day`, `dusk`, `overcast`
or `rain`). Slow devices use matching images from `public/experience/atmosphere-v5/`;
re-capture them with `STILLS_URL=http://localhost:3000 node scripts/capture-stills.mjs`
after changing the scene, and bump the folder version so no stale images are served.

What to edit, and where:

| Change                                           | File                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Copy, WhatsApp, social links, cookie notice      | `lib/content.ts`                                                                              |
| Services: names, page copy, studio shot per page | `lib/content.ts` (`services`, `servicesPage`, `projectProcess`, `faqs`)                       |
| Header: services panel, phone menu               | `components/nav/SiteHeader.tsx`                                                               |
| Inner pages: hero, sections, footer              | `components/site/`, `app/(site)/`                                                             |
| Enquiry form and floating WhatsApp button        | `components/contact/`, `components/experience/ContactDock.tsx`                                |
| Admin portal                                     | `app/admin/`, `lib/admin/session.ts`, `lib/leads/`                                            |
| Analytics: tracking, sources, report             | `components/analytics/`, `lib/analytics/`, `app/admin/analytics/`                             |
| Database tables                                  | `supabase/schema.sql`                                                                         |
| Projects shown on the laptop                     | `lib/work.ts` and `public/projects/`                                                          |
| Camera shots (and phone framings), lighting      | `components/experience/scene/shots.ts`                                                        |
| Sky and sea of clouds, per time and weather      | `components/experience/scene/Exterior.tsx`                                                    |
| Sun and room lighting                            | `components/experience/scene/lighting.ts` and `scene/Daylight.tsx`                            |
| Ceiling and wall lights                          | `components/experience/scene/Office.tsx`                                                      |
| Local time, sun position and weather             | `lib/atmosphere.ts`, `components/experience/environment-store.ts`, `app/api/weather/route.ts` |
| Logo sign size, glow, power-on                   | `components/experience/scene/LogoSign.tsx` and `scene/rig.ts`                                 |
| Bloom, scroll feel, banking, frame-rate check    | `components/experience/scene/OfficeScene.tsx`                                                 |
| Quality settings for phones and desktops         | `components/experience/scene/profile.ts`                                                      |
| Cursor, finger drag and tilt                     | `components/experience/scene/look.ts`                                                         |
| Which devices get 3D                             | `components/three/utils/use3DSupport.ts`                                                      |
| First still preload, 3D progress line            | `components/experience/Stage.tsx`, `components/experience/Stills.tsx`                         |
| Section heights (how long each shot holds)       | `components/experience/Chapters.tsx`                                                          |

Every tweakable value has a comment next to it.

**After changing shots, lighting or the models, re-capture the stills** so slow devices see the same thing:

```bash
pnpm build && pnpm start   # in one terminal
pnpm stills                # in another (needs Google Chrome)
```

The capture includes all eight shots in landscape and portrait for five moods.
Use `STILLS_MOODS=night`, `STILLS_SHOTS=0` or `STILLS_SIZES=portrait` to limit a refresh. If the server is
on another port, set `STILLS_URL=http://localhost:3002`.

**Service pages.** Every service has its own page (`/premium-website-design`,
`/landing-pages`, `/google-meta-ads`, `/social-media-management`, `/seo`,
`/website-care-plans`, `/branding`), and `/services` lists them all. Each
opens on a window into the studio: one of the tour's stills, art-directed to
an hour of the day (`hour` in `lib/content.ts`; phones can get a different
shot, as Branding does with the lit sign). Then what's included, how a
project runs, the work, related services, questions and a way in. The copy
is drawn from the services' own descriptions: no prices, timelines or results
until Bellops supplies them. Each page carries Service and BreadcrumbList
structured data.

The header is the same everywhere. On wide screens, Services opens a panel
listing every service with a preview of its studio shot; on phones, a Menu
button opens a full-screen menu. Both work from the keyboard and close with
Escape.

**Models.** The scene loads compressed copies in `public/models/`: the office
(1.15 MB, from 2.34 MB) and the laptop (0.68 MB, from 0.85 MB), the same for
phones and desktops. `scripts/optimize-models.mjs` builds them from the source
models; its header says how to run it. Models and project screenshots are
named with a short hash of their contents and cached for a year
(`immutable`), so a replaced file must get a new name (and the code its new
path). It keeps 1024 px textures, drops what
the scene never reads (the hidden backdrop, unused textures, the plants'
unused UV set) and simplifies only as far as nothing visibly changes. Going
further was tried: it thins out the plants' leaves and wipes the laptop's key
legends.

Earlier 3D pieces (the orb and the work showcase) are still on [/playground](http://localhost:3000/playground).

## 3D logo

Preview the wordmark at [http://localhost:3000/logo-preview](http://localhost:3000/logo-preview).

Load it on the client so Three.js stays out of the server render:

```tsx
import dynamic from "next/dynamic";

const Logo3D = dynamic(
  () => import("@/components/Logo3D").then((mod) => mod.Logo3D),
  { ssr: false },
);

export function Example() {
  return (
    <div style={{ height: 480 }}>
      <Logo3D size={1} autoRotate interactive />
    </div>
  );
}
```

`size` scales the logo in its frame (`1` fills the frame). `autoRotate` turns on the slow spin and float. `interactive` tilts the logo toward the pointer. Both animations stay off when the visitor has `prefers-reduced-motion: reduce`.

The extruded face is Outfit Bold at `public/fonts/outfit-bold.typeface.json` (SIL Open Font License, see `public/fonts/OFL.txt`). Studio lighting uses the HDR at `public/hdri/studio_small_03_1k.hdr`.

Deploy by importing the repo on Vercel.
