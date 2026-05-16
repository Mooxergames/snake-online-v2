import { SITE_URL } from '@/lib/seo';
import type { BlogPost } from '@/lib/blog';

interface Props {
  locale: string;
  title: string;
  description: string;
  posts: BlogPost[];
}

/**
 * Server-only JSON-LD emitter for /news. Inputs are server-controlled —
 * no user input is interpolated into the script payload, so the
 * dangerouslySetInnerHTML below is safe.
 */
export default function BlogListSchema({ locale, title, description, posts }: Props) {
  const url = `${SITE_URL}/${locale}/news`;
  const json = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 30).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${locale}/news/${p.slug}`,
          name: p.title,
        })),
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}
