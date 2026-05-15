import { locales } from './locales';

export function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * Emit one <url> entry per locale for a given route, each one declaring the
 * full set of hreflang alternates (mandatory: every URL must point to every
 * sibling locale of itself, or Google demotes the hreflang signal).
 */
export function urlBlock(
  base: string,
  route: string,
  lastmod: string,
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority: number,
) {
  const altLinks = locales
    .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(`${base}/${l}${route}`)}"/>`)
    .join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${base}/en${route}`)}"/>`;

  return locales
    .map(locale => {
      const url = `${base}/${locale}${route}`;
      return `  <url>
    <loc>${xmlEscape(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
${altLinks}
${xDefault}
  </url>`;
    })
    .join('\n');
}

export function wrapUrlset(body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`;
}

export const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
} as const;

export function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
}
