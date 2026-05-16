# Snake Online — Backend API Brief (May 2026)

This is a single-pass spec for the backend developer of `backend.snakeonline.net`.
Implement every section in priority order. Each endpoint includes the response
shape the marketing site (`snakeonline.io`) expects.

If you only have time for one thing this week, ship **§1 Skin metadata**.
That's the bottleneck for the entire SEO programmatic-pages strategy.

---

## Context — what the marketing site needs and why

The marketing site at `snakeonline.io` (Next.js 14, deployed on Railway) is a
static-rendered site with **2,500+ pre-rendered pages** covering 14 languages.
It calls into the backend for two things:

1. **Skin / arena / bait metadata** — currently invented client-side from raw
   asset IDs (e.g. `FSNAKE_05` → made-up name "Frostbite"). We need the **real
   names and lore** from the game CMS so SEO copy, Open Graph titles, and
   structured data match what players see in-game.

2. **Live leaderboard data** — `GET /players` works but returns the full
   11K-record dump (~11 MB) on every call. We need pagination + sort + filter
   server-side so the site can render fast and the backend can scale.

A future "blog" system also needs storage (§4 below) but only if you want
content stored centrally rather than in the git repo.

---

## §1 — Skin / arena / bait metadata (CRITICAL — blocks SEO scale)

### What we have today

The marketing site generates names like:

| Asset ID       | Site shows now       | Site needs (real name) |
|----------------|----------------------|-------------------------|
| `CSNAKE_TR`    | "Türkiye"            | ✅ already country-derived — keep |
| `FSNAKE_01`    | "Ember"              | ❌ made-up (real CMS name) |
| `FSNAKE_05`    | "Mythril"            | ❌ made-up |
| `BAIT_05`      | "BAIT_05"            | ❌ no name |
| `BACKGROUND_12`| "BACKGROUND_12"      | ❌ no name |

Country skins (`CSNAKE_*`) are fine — they derive from the ISO country code.
Everything else needs real metadata.

### Endpoint to ship

```
GET /metadata/snakes
GET /metadata/snakes/{id}
GET /metadata/baits
GET /metadata/baits/{id}
GET /metadata/backgrounds
GET /metadata/backgrounds/{id}
```

### Response shape per skin

```json
{
  "id": "FSNAKE_05",
  "name": "Mythril Serpent",
  "slug": "mythril-serpent",
  "category": "fantasy",
  "rarity": "legendary",
  "description": "Forged from rare alloys in the late-game arena. Earned at top-1% trophy.",
  "lore": "<p>(2-4 paragraphs of HTML or Markdown — for the blog system and skin pages)</p>",
  "unlockMethod": "leaderboard-top-1pct",
  "unlockDetail": "Reach Top 1% of the global leaderboard once.",
  "tier": 5,
  "season": "Season 4 — 2024 Q4",
  "releasedAt": "2024-10-15",
  "imageUrl": "https://backend.snakeonline.net/public/snakes/FSNAKE_05.png",
  "thumbnailUrl": "https://backend.snakeonline.net/public/snakes/FSNAKE_05_thumb.png",
  "tags": ["legendary", "metallic", "season-4"],
  "i18n": {
    "en": { "name": "Mythril Serpent", "description": "…", "lore": "…" },
    "tr": { "name": "Mitril Yılan", "description": "…", "lore": "…" },
    "de": { "name": "Mithril-Schlange", "description": "…", "lore": "…" },
    "es": { "name": "Serpiente de Mitril", "description": "…", "lore": "…" },
    "pt": { "name": "Serpente de Mitril", "description": "…", "lore": "…" },
    "fr": { "name": "Serpent de Mithril", "description": "…", "lore": "…" },
    "it": { "name": "Serpente di Mithril", "description": "…", "lore": "…" },
    "ru": { "name": "Мифриловая змея", "description": "…", "lore": "…" },
    "ja": { "name": "ミスリルの蛇", "description": "…", "lore": "…" },
    "ko": { "name": "미스릴 뱀", "description": "…", "lore": "…" },
    "zh": { "name": "秘银之蛇", "description": "…", "lore": "…" },
    "ar": { "name": "ثعبان الميثريل", "description": "…", "lore": "…" },
    "hi": { "name": "मिथ्रिल सर्प", "description": "…", "lore": "…" },
    "id": { "name": "Ular Mitril", "description": "…", "lore": "…" }
  }
}
```

### Required fields

- `id` (string) — the asset ID matching the PNG filename
- `name` (string) — canonical English name; max 60 chars; used in `<title>` tags
- `slug` (string, kebab-case) — URL-safe; the marketing site builds `/skins/{slug}` from this
- `rarity` (enum: `common | rare | epic | legendary | mythic | exclusive`)
- `category` (enum: `country | fantasy | event | seasonal | mythic | starter`)
- `description` (string, plain text, 80-160 chars) — used as meta description
- `imageUrl` (full URL, https://) — must already work
- `tags` (string[]) — used for related-skin lookups

### Strongly recommended fields

- `lore` (HTML or Markdown, 200-800 words) — used by the blog system to auto-generate per-skin articles
- `unlockMethod` (enum: `starter | leaderboard-top-1pct | tournament-mythic | event-seasonal | country-flag`)
- `unlockDetail` (string) — human-readable
- `i18n.{locale}.name / .description / .lore` — per-language overrides. Without them, the site falls back to English.

### Index endpoint

```
GET /metadata/snakes?category=fantasy&rarity=legendary&limit=50&page=1
```

Response:
```json
{
  "data": [ {…skin}, {…skin}, … ],
  "pagination": { "page": 1, "limit": 50, "total": 200, "hasNext": true }
}
```

### Acceptance criteria

- All 200+ snake IDs (every `CSNAKE_*` and `FSNAKE_*` and unique starter) have at least `name + slug + rarity + category + description + imageUrl` in English.
- At least 50 most-popular skins have `lore` filled in.
- All 14 i18n locales populated for the top 30 skins (the rest fall back to English).
- `slug` is unique across all skins.
- Same shape works for `/metadata/baits` and `/metadata/backgrounds`.

---

## §2 — Players / leaderboard (HIGH — performance blocker)

### Current state

`GET /players` returns 11,844 players as a single JSON array (~11 MB).
Query parameters (`?limit=10`, `?sort=-trophy`, `?location=TR`) are ignored.
Every request transfers all data.

The marketing site currently fetches the full dump, sorts in Node memory,
slices top 50, and caches the result for 10 minutes. This wastes ~10 MB per
revalidation and ~3 seconds of compute.

### Endpoint to ship

```
GET /public/rankings/global?limit=50
GET /public/rankings/local/{country}?limit=50
GET /public/rankings?limit=10
```

### Response — global

```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "playerId": "MG-MNW5Y0FD",
        "playerName": "gundul",
        "trophy": 6096,
        "totalScore": 1830099,
        "bestScore": 156339,
        "gamePlayed": 455,
        "totalkills": 696,
        "bestKills": 32,
        "location": "ID",
        "selectedAvatar": "AVATAR_16",
        "selectedSnake": "CSNAKE_USA",
        "selectedFlag": "ID_FLAG",
        "badgeName": "BADGE_12"
      }
    ],
    "total": 11844,
    "updatedAt": "2026-05-16T00:15:30.565Z"
  }
}
```

### Response — local (per country)

Same shape as global, plus `"country": "TR"` in `data`. Players filtered by
`location` field (ISO 2-letter). Ranks are re-numbered within the country slice.

### Response — overview

Combination: top-10 global + list of countries with player counts.

```json
{
  "success": true,
  "data": {
    "global": { "rankings": [ …top 10 ], "total": 11844 },
    "local": {
      "availableCountries": [
        { "country": "TR", "playerCount": 1843 },
        { "country": "ID", "playerCount": 1102 },
        { "country": "US", "playerCount": 891 }
      ]
    },
    "updatedAt": "2026-05-16T00:15:30.565Z"
  }
}
```

### Sort + tie-break

Sort by `trophy DESC`, then `bestScore DESC` as tiebreaker. Match the order
the in-game leaderboard shows.

### CORS

`Access-Control-Allow-Origin: https://snakeonline.io` is fine — the site
proxies these through its own `/api/rankings/*` route handlers, so direct
browser CORS isn't strictly required. But allowing it doesn't hurt.

### Caching

Set `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`. The
leaderboard is fine being 5-10 minutes stale.

### Acceptance criteria

- Global endpoint returns top-50 in <200 ms p95.
- Local endpoint accepts any ISO-2 country code and returns players matching that `location`.
- Overview endpoint returns top-10 + country list in <250 ms.
- `updatedAt` reflects the last time the underlying player documents were updated.
- Response bodies are gzip-compressed.

---

## §3 — Player profile lookup (MEDIUM — for share/profile pages)

The marketing site will eventually link from leaderboard rows to a public
profile page. To support that:

```
GET /public/players/{playerId}
```

```json
{
  "success": true,
  "data": {
    "playerId": "MG-MNW5Y0FD",
    "playerName": "gundul",
    "trophy": 6096,
    "totalScore": 1830099,
    "bestScore": 156339,
    "gamePlayed": 455,
    "totalkills": 696,
    "bestKills": 32,
    "bestSurvivalTime": 445,
    "location": "ID",
    "selectedAvatar": "AVATAR_16",
    "selectedSnake": "CSNAKE_USA",
    "selectedFlag": "ID_FLAG",
    "badgeName": "BADGE_12",
    "globalRank": 1,
    "countryRank": 1,
    "createdAt": "2025-06-05T02:09:22.633Z"
  }
}
```

Optional but useful: redact `_id`, `notificationToken`, `quantumRoomId`,
`platforms`, payment / IAP flags. Public site never needs those.

### Acceptance

- 404 if the player doesn't exist.
- Same caching headers as §2.
- Reject any non-public field — assume any leaked field will end up on Google.

---

## §4 — Blog / news content storage (LOW — optional)

The marketing site plans to publish 10 AI-generated blog posts per day across
14 languages (140 posts/day). Two options:

### Option A — keep blog in the git repo (default)

The site reads MDX from `src/content/blog/{locale}/{slug}.md`. An OpenAI cron
inside the site writes new MDX files and triggers a Railway redeploy. **No
backend work needed** if you're OK with this.

### Option B — backend-stored blog (if you'd rather centralise)

If you want the blog editable from the same admin you use for skin metadata,
ship:

```
GET    /blog/posts?locale=en&category=skin-spotlight&limit=20&page=1
GET    /blog/posts/{slug}?locale=en
POST   /blog/posts            (admin-only, Bearer token)
PUT    /blog/posts/{slug}      (admin-only)
DELETE /blog/posts/{slug}      (admin-only)
GET    /blog/categories        (public)
```

Post shape:

```json
{
  "slug": "unlocking-the-mythril-serpent",
  "title": "How to Unlock the Mythril Serpent in Snake Online",
  "description": "Snake Online's rarest legendary skin and the trophy path to it.",
  "category": "skin-spotlight",
  "tags": ["legendary", "unlock-guide", "mythril-serpent"],
  "cover": "https://backend.snakeonline.net/public/snakes/FSNAKE_05.png",
  "ogImage": "https://cdn.snakeonline.io/og/blog/mythril-serpent.jpg",
  "body": "<markdown or html>",
  "internalLinks": [
    { "anchorText": "Mythril Serpent skin page", "url": "/skins/mythril-serpent" },
    { "anchorText": "Top 1% global leaderboard", "url": "/game-ranking" }
  ],
  "author": { "name": "Snake Online Studio", "url": "https://snakeonline.io" },
  "locale": "en",
  "translations": ["tr", "de", "es"],
  "publishedAt": "2026-05-16T08:00:00Z",
  "updatedAt": "2026-05-16T08:00:00Z",
  "schemaType": "BlogPosting",
  "readingTime": 4,
  "isAiGenerated": true
}
```

If you go Option B, see also `POST /blog/posts/generate` (calls OpenAI server-side, returns the generated post) so we don't have to expose the OpenAI API key to the deploy env.

---

## §5 — IndexNow + cache purge webhook (NICE TO HAVE)

When skin metadata or blog posts change, we want to notify search engines
immediately. The marketing site exposes `POST /api/indexnow` that submits
URLs to Bing/Yandex IndexNow. To trigger it from the backend:

```
POST https://snakeonline.io/api/indexnow
Header: x-indexnow-secret: <INDEXNOW_KEY>
Body:   { "urls": [ "https://snakeonline.io/en/skins/mythril-serpent", … ] }
```

Add a webhook from the backend admin: on save, fire this POST.

---

## §6 — Image variants (NICE TO HAVE)

Skin PNGs are 200-500 KB each. For mobile and OG images we'd benefit from:

- `imageUrl_512` — 512×512 PNG, served from `/public/snakes/{id}_512.png`
- `imageUrl_thumb` — 128×128 WebP, served from `/public/snakes/{id}_thumb.webp`
- `ogImage` — 1200×630 composited card (skin centered on brand-gradient background)

If you can pre-generate at upload time, even better — otherwise the site
will use the current full-size PNGs (works, just heavier).

---

## §7 — CORS + rate limiting + security

- Allow `https://snakeonline.io` and `http://localhost:5000` (dev) in CORS.
- All admin write endpoints (§4, §6 upload) behind `Authorization: Bearer <ADMIN_TOKEN>`.
- Rate-limit public endpoints to 60 req/min per IP — protects against scraping the leaderboard.
- The `_id` MongoDB field MUST be stripped from public responses (it leaks the player doc primary key).
- Already-public fields fine to keep: playerId, playerName, trophy, score data, location, selected* (snake/flag/avatar), badge.
- **Never** expose: notificationToken, quantumRoomId, platforms, paid-IAP flags, email, deviceId.

---

## §8 — Priority order summary

1. **§1 Skin metadata `/metadata/snakes`** — unlocks SEO scale + real names everywhere.
2. **§2 Players `/public/rankings/global` + `/local/{country}` + overview** — replaces the 11 MB dump.
3. **§3 Player profile `/public/players/{id}`** — future profile pages.
4. **§5 IndexNow webhook** — instant indexation on skin / blog updates.
5. **§4 Blog storage** — only if you'd rather centralise content over git-based MDX.
6. **§6 Image variants** — performance polish.

---

## §9 — Quick sanity checks

After deploying each endpoint, run these from a terminal and paste the output back:

```bash
# §1
curl -s https://backend.snakeonline.net/metadata/snakes/FSNAKE_05 | jq

# §2
curl -s "https://backend.snakeonline.net/public/rankings/global?limit=10" | jq '.data.rankings[0:3]'
curl -s "https://backend.snakeonline.net/public/rankings/local/TR?limit=10" | jq '.data.rankings[0:3]'

# §3
curl -s https://backend.snakeonline.net/public/players/MG-MNW5Y0FD | jq

# Header sanity
curl -sI https://backend.snakeonline.net/public/rankings/global | grep -iE 'cache-control|access-control'
```

The marketing site at `snakeonline.io` will switch from the current
`/players` adapter to the new endpoints in the same commit that you deploy
§1 + §2. No frontend change is needed from your side.

---

## §10 — Questions for the marketing-site dev (us)

- Want filtering on `/metadata/snakes` by `isAvailable / isHidden / season`? Tell us flags you already track.
- Should country codes use ISO-2 (`TR`) or ISO-3 (`TUR`)? We're using ISO-2 across the site — keep that.
- Are there snake IDs that should NEVER appear publicly (test / dev assets)? Add an `isPublic: false` flag so we can filter.
- For Option B blog: do you have an admin UI today, or do you want us to scaffold one?

Contact the marketing site dev (us) when each numbered section is done so
we can wire the frontend.
