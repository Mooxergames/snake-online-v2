# Snake Online Web — Claude Context

> Bu dosya Claude Code oturumları arasında bağlam aktarmak içindir.
> Son güncelleme: 2026-05-20

## Proje Özeti

Snake Online (`snakeonline.io`) — gerçek zamanlı multiplayer .io snake battle royale oyununun marketing/landing sitesi. Next.js 14 (App Router), Tailwind CSS, next-intl (14 dil), Railway deploy.

## Mimari

- **Framework**: Next.js 14, App Router, TypeScript
- **Styling**: Tailwind CSS + custom `globals.css` (liquid-glass design system)
- **i18n**: next-intl, 14 locale (`en, tr, de, es, pt, fr, it, ru, ar, zh, ja, ko, hi, id`)
- **Deploy**: Railway (Node.js runtime, GitHub auto-deploy on push to main)
- **Backend API**: `api.snakeonline.io` (rankings), `backend.snakeonline.net` (legacy)
- **Blog**: Markdown dosyaları `src/content/blog/{locale}/` altında, AI-generated skin spotlights

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/lib/api.ts` | Rankings API client — `api.snakeonline.io/api/rankings` endpoint'leri |
| `src/lib/assets.ts` | Asset URL helper'ları (snake, avatar, flag) + emoji flag fallback |
| `src/lib/skins.ts` | 200+ skin kataloğu (fantasy + country) |
| `src/lib/skin-localizer.ts` | Locale-aware skin name/description çevirisi |
| `src/components/RankingsTable.tsx` | Leaderboard UI — sort, pagination, country filter |
| `src/components/Logo.tsx` | Snake Online logo (PNG, `public/snake-logo.png`) |
| `src/app/api/cron/generate-post/route.ts` | Blog post generator (OpenAI gpt-4o-mini, 14 locale) |
| `src/app/api/cron/translate-i18n/route.ts` | i18n block translator (OpenAI, 12 locale × 10 block) |
| `messages/{locale}.json` | i18n çeviri dosyaları |

## Tamamlanan İşler (Mayıs 2026)

### Cron Sistemi
- **generate-post** (`/api/cron/generate-post`): Skin spotlight blog post üretici. Her çağrıda 1-20 skin seçip 14 locale'e post yazar. GitHub Contents API ile commit eder. `?n=10&force=1&slug=fantasy-dusk-83` parametreleri destekler.
- **translate-i18n** (`/api/cron/translate-i18n`): `en.json`'daki tüm i18n bloklarını 12 locale'e çevirir. `?locale=de&block=bento&force=1` parametreleri.
- Her iki cron da GitHub'a sequential commit yapar (parallel commit GitHub API'de drop'a neden oluyordu).
- Auth: `x-cron-secret: <CRON_SECRET>` header.

### i18n Çeviri
- 12 locale × 9 block (bento, skinTemplates, compare, faq, skinPage, versus, howToPlay, downloadsPage, blog, marquee) tamamen çevrildi.
- Skin isimleri locale-aware: `/tr/skins/country-germany` → "Almanya".
- Blog postlar 14 dilde mevcut.

### Rankings API Entegrasyonu
- Eski `/players` endpoint'i (11MB full dump) yerine yeni paginated API:
  - `GET /api/rankings/global?sort=trophy&limit=50&offset=0`
  - `GET /api/rankings/country/TR?sort=totalkills&limit=20`
  - `GET /api/rankings/countries`
- Response'da CDN URL'leri: `avatarUrl`, `snakeUrl`, `flagUrl`
- Frontend'te sort dropdown (trophy, bestScore, kills, games)
- Avatar yoksa renkli baş harf fallback, flag yoksa emoji flag
- Skeleton loading animasyonu

### Performans
- Skin grid (`/snakes`): `backdrop-filter` kaldırıldı (166 kart), `content-visibility: auto` eklendi
- Rankings: 11MB dump → paginated API (50 kayıt/sayfa)
- Next.js fetch cache: 5dk revalidate (backend s-maxage ile uyumlu)

### SEO & IndexNow
- IndexNow key dosyası: `public/e6fbfdb00f1f116ffc6541c891957b1e4aaef5c54d6b39061c40b9b4115adf9c.txt`
- Blog post üretildikten sonra otomatik IndexNow ping
- Her locale için hreflang, canonical, JSON-LD structured data

### Logo
- SVG placeholder yerine gerçek Snake Online logosu (`public/snake-logo.png`)
- Header ve Footer'da `next/image` ile optimize

## Env Değişkenleri (Railway)

```
CRON_SECRET=***           # Cron endpoint auth
OPENAI_API_KEY=***        # Blog/translation AI
GITHUB_TOKEN=***          # Cron → GitHub commit
GITHUB_REPO=Mooxergames/snake-online-v2
GITHUB_BRANCH=main
INDEXNOW_KEY=e6fbfdb00f1f116ffc6541c891957b1e4aaef5c54d6b39061c40b9b4115adf9c
NEXT_PUBLIC_SITE_URL=https://snakeonline.io
BACKEND_API_BASE=https://backend.snakeonline.net
```

## Git Workflow

- Solo proje: direkt `main` branch'e commit + push, PR yok.
- Commit mesajları kısa, conventional-ish (`fix:`, `feat:`, `blog:`, `i18n:`).

## Bilinen Eksikler / Yapılacaklar

- [ ] Avatar PNG'leri henüz `public/avatars/` altında yok — backend CDN URL verene kadar renkli harf fallback kullanılıyor
- [ ] Flag PNG'leri yok — emoji flag kullanılıyor, backend `flagUrl` verirse geçilecek
- [ ] Rankings pagination UI (şu an sadece ilk 50 gösteriliyor, "Load more" yok)
- [ ] Ranking sayfası hız testi (yeni API sonrası)
- [ ] Blog post kalite kontrolü (bazı postlarda mixed-language sorunları olabilir)

## Kullanıcı Tercihleri

- Kısa cevaplar, status tablosu yok (sorulmadıkça)
- Türkçe iletişim
- Skill/plugin/agent sormadan kullanılabilir
- Git: direkt main'e push, PR yok
