# Bellops

The Bellops site. The home page is a scroll-driven studio tour with a glowing 3D sign, projects on a laptop, and daylight and weather that follow the visitor.

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
public origin before building. It defaults to `https://bellops.in`. The same
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
([@bellops.ai](https://www.instagram.com/bellops.ai/)). The budget ranges and
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
`https://bellops.in/?utm_source=meta&utm_medium=paid&utm_campaign=diwali`.
Google Ads auto-tagging (gclid) is recognised without tags.

**Privacy.** Analytics use no cookies and no third-party scripts (the only
cookie is the cookie notice's own). A visit ID lives in the
browser tab's session storage and is gone when the tab closes. The server
never stores IP addresses: visitors are counted with a one-way hash that
changes every day, and the city comes from Vercel's coarse IP location.
Browsers that send Do Not Track or Global Privacy Control, bots and visits
from localhost (unless `ANALYTICS_IN_DEV=1`) aren't counted.

How it works: `components/analytics/Tracker.tsx` batches events and sends them
to `/api/collect` when the page is hidden or a contact button is pressed;
`analytics_summary` in `supabase/schema.sql` builds the whole report in one
query.

## Home page: the studio tour

The page scrolls normally. A fixed stage behind it plays the camera shot that matches each section.

- **Desktop:** the live 3D scene. It loads in its own chunk after the page and renders only while something moves.
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

**Start-up loader.** A counter covers the first paint on every visit and
climbs as the studio really loads: fonts, the local weather, the first image
and, on devices that get 3D, the models and the warm-up. The warm-up uploads
every texture, compiles every shader and draws each shot once, hidden, with
nothing skipped for being out of view, so the camera never stalls on
something new mid-flight. Then the loader lifts like a window blind and the
sun sweeps in. It waits at most 2 seconds for the weather and 15 for the 3D
(which otherwise fades in later over the image, already warmed up), takes
about a second on a cached visit, and never shows without JavaScript.
Devices that pass the 3D check download their models alongside the 3D code;
devices that get the stills never download them.

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

| Change                                        | File                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Copy, WhatsApp, social links, cookie notice   | `lib/content.ts`                                                                              |
| Enquiry form and floating WhatsApp button     | `components/contact/`, `components/experience/ContactDock.tsx`                                |
| Admin portal                                  | `app/admin/`, `lib/admin/session.ts`, `lib/leads/`                                            |
| Analytics: tracking, sources, report          | `components/analytics/`, `lib/analytics/`, `app/admin/analytics/`                             |
| Database tables                               | `supabase/schema.sql`                                                                         |
| Projects shown on the laptop                  | `lib/work.ts` and `public/work/`                                                              |
| Camera shots (and phone framings), lighting   | `components/experience/scene/shots.ts`                                                        |
| Sky and sea of clouds, per time and weather   | `components/experience/scene/Exterior.tsx`                                                    |
| Sun and room lighting                         | `components/experience/scene/lighting.ts` and `scene/Daylight.tsx`                            |
| Ceiling and wall lights                       | `components/experience/scene/Office.tsx`                                                      |
| Local time, sun position and weather          | `lib/atmosphere.ts`, `components/experience/environment-store.ts`, `app/api/weather/route.ts` |
| Logo sign size, glow, power-on                | `components/experience/scene/LogoSign.tsx` and `scene/rig.ts`                                 |
| Bloom, scroll feel, banking, frame-rate check | `components/experience/scene/OfficeScene.tsx`                                                 |
| Quality settings for phones and desktops      | `components/experience/scene/profile.ts`                                                      |
| Cursor, finger drag and tilt                  | `components/experience/scene/look.ts`                                                         |
| Which devices get 3D                          | `components/three/utils/use3DSupport.ts`                                                      |
| Start-up loader: wait limits, wording         | `components/experience/SiteLoader.tsx`, `lib/content.ts`                                      |
| Section heights (how long each shot holds)    | `components/experience/Chapters.tsx`                                                          |

Every tweakable value has a comment next to it.

**After changing shots, lighting or the models, re-capture the stills** so slow devices see the same thing:

```bash
pnpm build && pnpm start   # in one terminal
pnpm stills                # in another (needs Google Chrome)
```

The capture includes all eight shots in landscape and portrait for five moods.
Use `STILLS_MOODS=night`, `STILLS_SHOTS=0` or `STILLS_SIZES=portrait` to limit a refresh. If the server is
on another port, set `STILLS_URL=http://localhost:3002`.

**Models.** The scene loads compressed copies in `public/models/`. To re-compress after replacing a source model:

```bash
npx @gltf-transform/cli optimize public/minimalistic_modern_office.glb public/models/office.glb --compress meshopt --texture-compress webp --texture-size 2048
npx @gltf-transform/cli optimize public/minimalistic_modern_office.glb public/models/office-mobile.glb --compress meshopt --texture-compress webp --texture-size 1024
npx @gltf-transform/cli optimize public/macbook_pro_m3_16_inch_2024.glb public/models/macbook.glb --compress meshopt --texture-compress webp --texture-size 1024
```

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
