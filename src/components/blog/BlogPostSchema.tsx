import { SITE_URL } from '@/lib/seo';
import type { BlogPost } from '@/lib/blog';

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

  const blogPosting = {
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
    </>
  );
}
