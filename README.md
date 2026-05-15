# Snake Online — Marketing Site

The public-facing marketing & community site for **Snake Online** — built independently from the admin dashboard and the game backend. Designed for Railway deployment.

## Tech stack

- **Next.js 14** App Router (SSR + SSG hybrid)
- **TypeScript** strict mode
- **Tailwind CSS** with a custom Apple-grade dark design system
- **next-intl** for 14-language internationalization
- **Framer Motion** for choreographed animations
- **React Three Fiber** for the WebGL hero (currently a stylized mock — swap to your S3 build later)
- **next-sitemap** for sitemap fallback

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
# → http://localhost:3001
```

## Environment variables

| Variable                    | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE`      | Backend API base URL (e.g. `https://backend.snakeonlines.com`)|
| `NEXT_PUBLIC_ASSETS_BASE`   | Public asset base URL (snake/avatar/flag PNGs)               |
| `NEXT_PUBLIC_SITE_URL`      | Canonical public site URL (used for sitemap/OG/canonical)    |
| `INDEXNOW_KEY`              | Any 8+ char alphanumeric key (must match the file in /public)|
| `OPENAI_API_KEY`            | (Optional) For the auto-blog generator (planned)             |

## Project structure

```
snakeonline-web/
├── src/
│   ├── app/
│   │   ├── [locale]/         # localized routes (14 languages)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # /
│   │   │   ├── play/                 # /play
│   │   │   ├── snakes/               # /snakes
│   │   │   ├── game-ranking/         # /game-ranking  (consumes backend)
│   │   │   ├── community/
│   │   │   ├── news/[slug]/          # /news + blog system (MDX)
│   │   │   ├── about/, contact/, support/
│   │   │   └── legal/[doc]/          # privacy, terms, parents, data-protection
│   │   ├── api/rankings/             # CORS-safe proxy → backend public rankings
│   │   ├── sitemap.ts                # dynamic, per-locale, hreflang
│   │   ├── robots.ts                 # AI bots allow-listed
│   │   └── globals.css
│   ├── components/                   # Header, Footer, Hero, RankingsTable…
│   ├── content/blog/{locale}/*.md    # blog posts (per-locale, fallback en)
│   ├── lib/                          # api/, blog/, locales/, utils/
│   ├── i18n.ts                       # next-intl config
│   └── middleware.ts                 # locale routing
├── messages/{en,tr,de,es,…}.json     # i18n strings
├── public/                           # favicon, manifest, indexnow key, og-image
├── next.config.mjs
├── tailwind.config.ts
├── railway.json + nixpacks.toml      # Railway deploy config
└── README.md
```

## SEO checklist (already wired)

- ✅ Per-locale dynamic sitemap with `hreflang` alternates
- ✅ `robots.ts` with major search bots + AI crawlers (GPTBot, PerplexityBot, ClaudeBot)
- ✅ Schema.org JSON-LD: `Organization`, `WebSite`, `VideoGame`, `BlogPosting`
- ✅ Open Graph + Twitter cards on every page
- ✅ Canonical URLs per route
- ✅ IndexNow key file in `/public`
- ✅ `manifest.webmanifest` PWA-ready
- ✅ Per-page generated `<title>` and `<meta description>` via `generateMetadata`

> **Action item:** add a real `og-image.jpg` (1200×630) to `/public/og-image.jpg`. The schema currently references it but the file needs to be supplied by the brand team.

## Backend integration

The site **never** writes to the backend and **never** uses authenticated endpoints. It only consumes:

- `GET /public/rankings` — overview (top 10 + country list)
- `GET /public/rankings/global?limit=N`
- `GET /public/rankings/local/:country?limit=N`

These are proxied through `/api/rankings/*` Next.js Route Handlers so:
1. The browser never hits the backend directly (no CORS issues for end users).
2. We get edge caching (`s-maxage=300`).
3. We can swap the backend host without touching client code.

> **Important:** the marketing site domain (`snakeonline.io`) is *not* in the backend's CORS allow-list — by design. The proxy makes server-to-server calls so this doesn't matter.

## Internationalization

14 locales are wired: **en, es, pt, de, fr, it, tr, ru, ar, zh, ja, ko, hi, id**.

- Fully translated today: `en`, `tr`, `de`, `es`
- Other locales render English as fallback (graceful via `i18n.ts`) — translation files can be added one-by-one.
- RTL handled automatically for `ar`.

## Blog / News system

- Posts live in `src/content/blog/{locale}/{slug}.md` with YAML front-matter.
- The page reads them via `gray-matter` + `remark`, and falls back to `en` if no localized version exists.
- ISR: pages revalidate every 30 minutes (`export const revalidate = 1800`).
- **Auto-blog hook:** when `OPENAI_API_KEY` is provided, a future cron route (`/api/cron/generate-post`) will be wired in to generate daily posts about snake skin lore.

## WebGL hero

The current hero uses **React Three Fiber** to render a stylized 3D snake animation as a placeholder.

When you have the real WebGL build:
1. Upload to S3 (or any CDN).
2. Replace `MockWebGLCanvas.tsx` with an `<iframe>` or a custom Three.js loader pointing at your build.
3. Keep the gradient + grid overlays for visual continuity.

## Deployment to Railway

1. Push this directory to a fresh GitHub repository.
2. In Railway: *New Project → Deploy from GitHub Repo* → select the repo.
3. Railway auto-detects Next.js via `nixpacks.toml`.
4. Add environment variables (see table above).
5. Add custom domain `snakeonline.io` in Railway settings, point your DNS A record.

That's it — every push to `main` triggers a redeploy.

## License

© Snake Online. All rights reserved.
