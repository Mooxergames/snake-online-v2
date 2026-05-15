/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io',
  generateRobotsTxt: false, // We use app/robots.ts
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/404', '/500'],
};
