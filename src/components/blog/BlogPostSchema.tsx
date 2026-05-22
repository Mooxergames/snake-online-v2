import { SITE_URL } from '@/lib/seo';
import type { BlogPost } from '@/lib/blog';

// "about" entity hints — appended to JSON-LD when the post sits in a
// technology-leaning category so Google can tie the article to the underlying
// concept. Helps "snake online" + "photon" / "unity" queries co-rank because
// the entity graph references both the brand and the technology.
const TECH_ABOUT: Array<{ '@type': string; name: string; sameAs?: string }> = [
  { '@type': 'SoftwareApplication', name: 'Unity', sameAs: 'https://unity.com/' },
  { '@type': 'Thing',               name: 'Photon Multiplayer', sameAs: 'https://www.photonengine.com/' },
  { '@type': 'Thing',               name: 'WebSocket', sameAs: 'https://en.wikipedia.org/wiki/WebSocket' },
];

/**
 * Server-only JSON-LD for an individual blog post.
 * Emits BlogPosting (or NewsArticle for /updates category) + BreadcrumbList.
 * All inputs are author-controlled MDX frontmatter — not user input —
 * so dangerouslySetInnerHTML below is safe.
 */
export default function BlogPostSchema({ post, locale }: { post: BlogPost; locale: string }) {
  const url = `${SITE_URL}/${locale}/news/${post.slug}`;
  const isUpdate = post.category === 'updates';
  const coverAbs = post.cover
    ? (post.cover.startsWith('http') ? post.cover : `${SITE_URL}${post.cover}`)
    : `${SITE_URL}/og-image.png`;

  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isUpdate ? 'NewsArticle' : 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    image: coverAbs,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale,
    keywords: (post.tags || []).join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    author: {
      '@type': 'Organization',
      name: post.author || 'Snake Online Studio',
      url: SITE_URL,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': `${SITE_URL}/${locale}/news` },
  };

  // Spotlight posts: tie the article to the specific skin CreativeWork via
  // mainEntity. The skin already has its own @id from src/app/[locale]/skins/[slug]/page.tsx,
  // so this strengthens the entity graph without duplicating it.
  if (post.category === 'skin-spotlight' && post.relatedSkinSlug) {
    blogPosting.mainEntity = { '@id': `${SITE_URL}/${locale}/skins/${post.relatedSkinSlug}` };
  }

  // Tech deep dives: declare the underlying tech concepts so the article
  // co-ranks for "snake online photon" / "snake online unity" queries.
  if (post.category === 'tech-deep-dive') {
    blogPosting.about = [{ '@id': `${SITE_URL}/#game` }, ...TECH_ABOUT];
  } else if (post.category === 'gaming-history') {
    blogPosting.about = [{ '@id': `${SITE_URL}/#game` }, { '@type': 'VideoGame', name: 'Snake (Nokia)' }];
  } else {
    blogPosting.about = { '@id': `${SITE_URL}/#game` };
  }

  // FAQ schema — emitted as a separate JSON-LD block when frontmatter carries
  // a faq array.
  type FAQPair = { q: string; a: string };
  const postFaq = (post as unknown as { faq?: FAQPair[] }).faq;
  const faqSchema = Array.isArray(postFaq) && postFaq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: postFaq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }
    : null;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE_URL}/${locale}/news` },
      ...(post.category
        ? [{ '@type': 'ListItem', position: 3, name: post.category, item: `${SITE_URL}/${locale}/news/category/${post.category}` }]
        : []),
      { '@type': 'ListItem', position: post.category ? 4 : 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </>
  );
}
