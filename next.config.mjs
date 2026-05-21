import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'backend.snakeonlines.com' },
      { protocol: 'https', hostname: 'backend.snakeonline.net' },
      { protocol: 'https', hostname: 'snakeeditor.snakeonline.net' },
      { protocol: 'https', hostname: 'snakeonline.io' },
      { protocol: 'https', hostname: 'snakeonlines.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Skin / arena PNGs live in /public/{snakes,backgrounds,baits}.
  // The /cdn/* rewrite previously proxied to backend.snakeonlines.com but the
  // origin returns 525 (SSL handshake failure); the rewrite is no longer needed
  // since assets are now same-origin static files.
  // The /api/rankings/* routes still talk to BACKEND_API_BASE via direct fetch
  // inside the route handlers — see src/app/api/rankings/*.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        // Static assets in /public — long-cache headers for browsers + edge CDN.
        source: '/:folder(snakes|backgrounds|baits|avatars|flags|powerUps)/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
