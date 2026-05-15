interface Props { locale: string }

export default function SchemaOrg({ locale }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Snake Online',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg`, width: 512, height: 512 },
      sameAs: [
        'https://twitter.com/snakeonlineio',
        'https://www.instagram.com/snakeonline.io',
        'https://www.tiktok.com/@snakeonline.io',
        'https://www.youtube.com/@snakeonline',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Snake Online',
      description: 'Multiplayer snake battle royale .io game',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: locale,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/${locale}/news?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'VideoGame',
      '@id': `${siteUrl}/#game`,
      name: 'Snake Online',
      url: siteUrl,
      description: 'Real-time multiplayer snake battle royale. Free on iOS, Android, and Web.',
      genre: ['Casual', 'Multiplayer', '.io', 'Action', 'Battle Royale'],
      gamePlatform: ['iOS', 'Android', 'Web Browser'],
      applicationCategory: 'Game',
      operatingSystem: 'iOS, Android, Web',
      playMode: 'MultiPlayer',
      numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 100 },
      publisher: { '@id': `${siteUrl}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', ratingCount: '128450', bestRating: '5', worstRating: '1' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Snake Online',
      operatingSystem: 'iOS, Android, Web',
      applicationCategory: 'GameApplication',
      applicationSubCategory: 'Casual Multiplayer',
      url: siteUrl,
      downloadUrl: `${siteUrl}/${locale}/downloads`,
      installUrl: `${siteUrl}/${locale}/downloads`,
      softwareVersion: '2.0',
      releaseNotes: `${siteUrl}/${locale}/news`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', ratingCount: '128450', bestRating: '5', worstRating: '1' },
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  );
}
