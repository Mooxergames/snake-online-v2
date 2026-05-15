# Snake Online — Marketing Site Deployment Guide

A self-contained Next.js 14 marketing & community site for **snakeonline.io**.
Standalone — does **not** depend on any sibling workspace package.

---

## 1. What's inside

```
snakeonline-web/
├── package.json              # All dependencies + scripts
├── package-lock.json         # Locked versions (npm ci ready)
├── next.config.mjs           # Image domains + /cdn proxy rewrite
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── next-sitemap.config.js
├── nixpacks.toml             # Nixpacks build config (Railway / Coolify / Dokku)
├── railway.json              # Railway deployment config
├── .env.example              # All env vars documented (copy to .env.local)
├── .gitignore
├── README.md                 # Original feature overview
├── DEPLOYMENT.md             # ← THIS FILE
├── messages/                 # i18n — 14 locale JSONs (en, es, pt, de, fr, it,
│                             # tr, ru, ar, zh, ja, ko, hi, id)
├── public/                   # Static assets (OG card, favicon, IndexNow key,
│                             # logo, etc.)
└── src/
    ├── app/                  # Next.js 14 App Router
    │   ├── [locale]/         # Locale-prefixed pages (home, /play, /snakes,
    │   │                     # /game-ranking, /community, /news, /about,
    │   │                     # /contact, /support, /downloads, /legal/*)
    │   ├── api/rankings/     # Server-side proxy → backend
    │   ├── sitemap.xml/      # Custom sitemap with hreflang xhtml:link tags
    │   ├── robots.ts
    │   └── layout.tsx
    ├── components/           # Shared React components
    ├── data/                 # Static JSON (snake skin IDs, etc.)
    ├── lib/                  # seo.ts, api.ts, locales.ts, utils.ts, blog.ts
    ├── content/news/         # MDX blog posts
    ├── i18n.ts               # next-intl config
    └── middleware.ts         # Locale routing middleware
```

---

## 2. Tech stack

- **Framework**: Next.js 14.2.34 (App Router, RSC)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3 + custom design tokens
- **i18n**: next-intl 3.20 (`localePrefix: 'always'`)
- **Animation**: Framer Motion 11
- **3D / WebGL**: react-three-fiber 8 + @react-three/drei 9 (hero only,
  conditionally loaded)
- **MDX blog**: gray-matter + remark + remark-html
- **Icons**: lucide-react
- **Sitemap**: custom route `/sitemap.xml` (proper xhtml:link hreflang)
- **Node version**: 20 (set via nixpacks.toml)

---

## 3. Environment variables

Copy `.env.example` to `.env.local` for local dev, or set in your hosting
provider's dashboard for production.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BACKEND_API_BASE` | recommended | `http://localhost:3000` | Real Snake Online backend base URL. Used by `/cdn/*` rewrite (snake-skin images) and the server-side `/api/rankings/*` proxy. **Set this in production**, otherwise builds fall back to localhost and assets break. |
| `NEXT_PUBLIC_API_BASE` | optional | (uses `BACKEND_API_BASE`) | Legacy alias — only used if `BACKEND_API_BASE` is unset. Safe to omit. |
| `NEXT_PUBLIC_ASSETS_BASE` | optional | `https://backend.snakeonlines.com/public` | Direct base URL used by `snakeImg()` helper (snake skin images bypassing the rewrite). |
| `NEXT_PUBLIC_SITE_URL` | recommended | `https://snakeonline.io` | Public site URL. Used for canonical URLs, sitemap, OG metadata, hreflang, JSON-LD `@id`. |
| `INDEXNOW_KEY` | optional | `snakeonlineio2026indexnowkey` | IndexNow key for instant search-engine notification. Must match the `<key>.txt` file inside `public/`. |
| `OPENAI_API_KEY` | optional | _(empty)_ | Reserved for the auto-blog system. Leave empty until you want to enable AI content generation. |
| `PORT` | optional | `3001` | Port the production server listens on (`npm start` uses `${PORT:-3001}`). Most platforms set this automatically. |

### Production values (recommended)

```env
BACKEND_API_BASE=https://backend.snakeonlines.com
NEXT_PUBLIC_API_BASE=https://backend.snakeonlines.com
NEXT_PUBLIC_ASSETS_BASE=https://backend.snakeonlines.com/public
NEXT_PUBLIC_SITE_URL=https://snakeonline.io
INDEXNOW_KEY=snakeonlineio2026indexnowkey
```

### Important note about env var timing

- `NEXT_PUBLIC_*` variables are **inlined at build time**. If you change them,
  you must **rebuild** (not just restart) the app.
- `BACKEND_API_BASE` is read **at runtime** on the server (used in
  `next.config.mjs` rewrites and server-side fetches). It's read at build
  time too because Next.js bakes config — set it before `npm run build`.

---

## 4. Local development

```bash
# 1. Unpack
unzip snakeonline-web.zip
cd snakeonline-web

# 2. Install dependencies (uses package-lock.json)
npm ci         # or: npm install

# 3. Configure env
cp .env.example .env.local
# Edit .env.local — at minimum set BACKEND_API_BASE if you have a backend running

# 4. Run dev server
npm run dev
# → http://localhost:5000

# 5. Production build (validate before deploying)
npm run build
npm start
# → http://localhost:3001
```

The dev server uses port `5000`, production server uses `${PORT:-3001}`.

---

## 5. Deployment — by platform

### Railway (recommended, zero-config)

The repo includes `railway.json` and `nixpacks.toml`. Just:

1. Create a new Railway project, "Deploy from a folder/zip"
2. Upload/link this folder
3. Add the env vars from section 3 in the Railway dashboard
4. Railway auto-detects Next.js, runs `npm ci && npm run build`, then
   `npm start`. It exposes the right `PORT` automatically.

`nixpacks.toml` pins **Node 20**.

### Vercel

```bash
npx vercel              # follow prompts
# Then set env vars in the Vercel dashboard (Settings → Environment Variables)
```

Vercel auto-detects Next.js. No special config needed.

### Render / Fly.io / Coolify / Dokku / any VPS with Nixpacks or Buildpacks

Same Nixpacks config works. Build command: `npm ci && npm run build`. Start
command: `npm start`. Port: read from `$PORT`.

### Docker (DIY)

A minimal Dockerfile would look like:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Pass env vars via `docker run -e BACKEND_API_BASE=...`.

### Replit Deployments

1. Import this folder as a Replit project
2. Set env vars in the **Secrets** tab
3. Use the "Deploy" button — Replit handles build & hosting automatically
4. Note: Replit's preview uses port `5000` (dev), prod uses `3001` by default

---

## 6. Build output & performance

A clean `npm run build` produces:

- **~210 prerendered pages** (14 locales × 15 routes including legal & news)
- **First Load JS**: ~87.5 KB shared baseline
- **Sitemap**: 210 URLs, each with 15 hreflang `xhtml:link` entries
- **Images**: served from `/cdn/*` (rewritten to backend) — no upload needed
- All routes are SSG-friendly; `/api/rankings/*` is the only dynamic route

---

## 7. SEO / i18n architecture (important if you edit content)

### Adding a new locale

1. Add the language code to `locales` array + `localeMeta` map in
   `src/lib/locales.ts`
2. Create `messages/<code>.json` — copy the **full key tree** of `en.json` and
   translate every value
3. Sitemap, hreflang, robots.txt, and the language switcher pick it up
   automatically

### Adding a new page

1. Add a `meta.pages.<pageKey>` block (with native `title` + `description`) to
   **all 14** locale files in `messages/`
2. Add the route to `ROUTES` in `src/app/sitemap.xml/route.ts`
3. In the new page's `generateMetadata`, return:
   ```ts
   buildPageMetadata({ locale, page: '<pageKey>', path: '/<route>' })
   ```
   from `@/lib/seo` — auto-generates canonical, hreflang for all 14 languages,
   OG, Twitter

### Adding any UI string

- Add the key to **all 14** locale files in **native language**.
- English-only fallback is unacceptable in production — it weakens
  `<html lang>` consistency for SEO.
- Applies to: client components (`useTranslations`), server components
  (`getTranslations`), `aria-label`, `iframe title`, `<option>` values, form
  labels, and placeholder text.

### Title format

`buildPageMetadata` uses `title.absolute`, so per-page titles are NOT suffixed
with the brand template. Prevents duplication like "X — Snake Online — Snake
Online". Page-level titles should already include the brand name where
appropriate (handled in the locale JSONs).

---

## 8. Backend integration

The site fetches **read-only** data from the Snake Online backend:

- `GET /public/rankings/global` → top players globally
- `GET /public/rankings/local` → leaderboards per country
- Snake skin images: `/public/snakes/*.png` (proxied through `/cdn/*`)

All requests go server-side via the Next.js API routes in `src/app/api/` — the
browser never talks to the backend directly. This avoids CORS issues and lets
the edge cache rankings.

**No write operations.** The marketing site is purely consumer-facing.

---

## 9. Files NOT included in the zip (intentional)

These are excluded because they're regenerated on the deploy target:

- `node_modules/` — `npm install` regenerates
- `.next/` — `npm run build` regenerates
- `out/`, `dist/`, `.vercel/` — build outputs
- `.env`, `.env.local`, `.env.*.local` — secrets, set them in your hosting
  dashboard
- `next-env.d.ts` — auto-generated by Next.js on first build
- `*.log`, `.DS_Store`

`package-lock.json` IS included (so versions are deterministic).

---

## 10. Troubleshooting

**Snake images don't load**
→ `BACKEND_API_BASE` is unset or wrong. Check the value points to a server
that exposes `/public/snakes/*.png`.

**Rankings page is empty**
→ Same as above. Server-side fetch in `src/app/api/rankings/` requires the
backend reachable from the deploy environment.

**OG image / canonical shows wrong domain**
→ `NEXT_PUBLIC_SITE_URL` is wrong. Remember: `NEXT_PUBLIC_*` is baked at build
time. **Rebuild** after changing it.

**A locale shows English for some text**
→ A new translation key was added but not propagated to that locale's JSON
file. Diff `messages/en.json` against the offending locale's file and add the
missing keys (in the native language).

**Sitemap doesn't have hreflang entries**
→ Make sure you're hitting `/sitemap.xml` (the **route handler** at
`src/app/sitemap.xml/route.ts`), NOT a stale `public/sitemap.xml`. The latter
would silently override the route. Delete any `public/sitemap*.xml` files.

**Build fails with "Cannot find module 'sharp'"**
→ Some hosts need `npm install --include=optional` or the `sharp` native
binary. Nixpacks/Railway handle this automatically.

---

## 11. Domain & DNS

For production at `snakeonline.io`:

1. Point an `A` record (or `CNAME`) at your hosting provider's IP/hostname
2. Provider issues an SSL certificate (Railway, Vercel, Render do this
   automatically)
3. Set `NEXT_PUBLIC_SITE_URL=https://snakeonline.io` and rebuild

The site's CORS config and metadata already assume `snakeonline.io` as the
canonical hostname.

---

## 12. License & ownership

Proprietary — © Snake Online. All third-party packages retain their original
licenses (see `package.json`).

---

**Questions?** See `README.md` for feature-level documentation.
