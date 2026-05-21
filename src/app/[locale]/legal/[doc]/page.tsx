import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

const DOCS = {
  privacy: 'privacy',
  terms: 'terms',
  parents: 'parents',
  'data-protection': 'dataProtection',
} as const;

type DocSlug = keyof typeof DOCS;

export function generateStaticParams() {
  return (Object.keys(DOCS) as DocSlug[]).map(doc => ({ doc }));
}

export async function generateMetadata({ params }: { params: { locale: string; doc: string } }): Promise<Metadata> {
  if (!(params.doc in DOCS)) return {};
  const key = DOCS[params.doc as DocSlug];
  const t = await getTranslations({ locale: params.locale, namespace: `legal.${key}` });
  return { title: t('title'), alternates: { canonical: `/${params.locale}/legal/${params.doc}` } };
}

const CONTENT: Record<string, string[]> = {
  privacy: [
    'We collect minimal personal data: account email, gameplay statistics, and device information necessary to operate the service.',
    'We never sell your data. We use standard analytics (anonymized) to improve gameplay performance and balance.',
    'You can request deletion of your account and personal data at any time by emailing info@visiongo.at.',
    'For EU residents, we comply with GDPR. For California residents, we comply with CCPA.',
  ],
  terms: [
    'By using Snake Online you agree to play fairly: no cheating, no botting, no exploiting bugs for unfair advantage.',
    'Cosmetic items and currency purchased in-game are non-refundable except where required by law.',
    'We reserve the right to suspend accounts that violate the fair-play policy.',
    'These terms are governed by the laws of the operator’s home jurisdiction.',
  ],
  parents: [
    'Snake Online is rated for ages 9+. There is no voice chat with strangers and no real-name registration required.',
    'In-app purchases are disabled by default in the mobile apps until enabled in device parental controls.',
    'We never collect personal information from users under 13 without verifiable parental consent.',
    'Tips: enable screen-time limits, review purchase settings, and play together a few times to learn the game.',
  ],
  'data-protection': [
    'All player data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
    'We retain account data only as long as the account is active. Deleted accounts are permanently purged within 30 days.',
    'Our data processing agreements are available on request.',
  ],
};

export default async function LegalPage({ params }: { params: { locale: string; doc: string } }) {
  if (!(params.doc in DOCS)) notFound();
  unstable_setRequestLocale(params.locale);
  const key = DOCS[params.doc as DocSlug];
  const t = await getTranslations({ locale: params.locale, namespace: `legal.${key}` });
  const paragraphs = CONTENT[params.doc] || [];

  return (
    <>
      <PageHero title={t('title')} subtitle={`${t('lastUpdated')}: 2026-01-15`} />
      <section className="container-tight py-16 prose prose-invert max-w-none">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </section>
    </>
  );
}
