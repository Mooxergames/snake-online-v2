import type { MetadataRoute } from 'next';

/**
 * robots.txt — production rules.
 *
 * Strategy:
 *   - Allow ALL major search engines + ALL public AI/LLM crawlers (we WANT
 *     to be cited in ChatGPT / Claude / Perplexity / Google AI Overviews).
 *   - Block /api/* (server endpoints — nothing useful for crawlers).
 *   - Block /tests/* and /_next/* (Next.js internals + dev artifacts).
 *   - No crawl-delay — we want fast indexation.
 *
 * The named user-agent blocks below repeat the global allow on purpose:
 *   - Some bots only respect their own user-agent stanza and ignore "*"
 *     entirely (Google has documented this for `Google-Extended`).
 *   - Listing them explicitly is a clear signal of consent for AI training
 *     and answer-engine retrieval.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';

  const disallow = ['/api/', '/_next/', '/tests/', '/test-results/'];

  // Tier 1: traditional search engines — well-known, explicit allow.
  const searchEngines = [
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Googlebot-Video',
    'Bingbot',
    'DuckDuckBot',
    'YandexBot',
    'Baiduspider',
    'Slurp',           // Yahoo
    'Applebot',
    'Applebot-Extended',
  ];

  // Tier 2: AI/LLM crawlers — answer engines, GEO/AEO traffic.
  // Source list curated from each vendor's published docs (May 2026).
  const aiCrawlers = [
    'GPTBot',                // OpenAI training
    'OAI-SearchBot',         // ChatGPT live search
    'ChatGPT-User',          // user-initiated ChatGPT browse
    'Google-Extended',       // Google AI / Gemini training
    'ClaudeBot',             // Anthropic crawl
    'anthropic-ai',          // legacy Anthropic UA
    'Claude-Web',            // Claude live retrieval
    'PerplexityBot',         // Perplexity index
    'Perplexity-User',       // Perplexity user-fetch
    'CCBot',                 // Common Crawl
    'cohere-ai',             // Cohere
    'Meta-ExternalAgent',    // Meta AI
    'Meta-ExternalFetcher',  // Meta AI fetch
    'FacebookBot',
    'Bytespider',            // TikTok / ByteDance
    'Amazonbot',             // Alexa / Amazon
    'YouBot',                // You.com
    'PhindBot',              // Phind
    'DiffBot',
    'MistralAI-User',        // Mistral
  ];

  const rules: NonNullable<MetadataRoute.Robots['rules']> = [
    // Default: allow everything except internals.
    { userAgent: '*', allow: '/', disallow },
    // Explicit allow per UA so bots that ignore the wildcard see consent.
    ...searchEngines.map(ua => ({ userAgent: ua, allow: '/', disallow })),
    ...aiCrawlers.map(ua => ({ userAgent: ua, allow: '/', disallow })),
  ];

  return {
    rules,
    // Sitemap index — see src/app/sitemap.xml/route.ts (split into children
    // by section so Google's crawl-budget allocation is honest).
    sitemap: [`${base}/sitemap.xml`],
    host: base,
  };
}
