import Link from 'next/link';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Play, MousePointer2, Move, Target, Crown, Shield, Zap, ArrowRight } from 'lucide-react';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

export const revalidate = 86400;

const STEP_KEYS = ['enter', 'move', 'eat', 'boost', 'coil', 'survive', 'climb'] as const;
const STEP_ICONS = [Play, MousePointer2, Target, Zap, Move, Shield, Crown];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'howToPlay', path: '/how-to-play' });
}

function HowToSchema({ locale, title, desc, steps }: { locale: string; title: string; desc: string; steps: { name: string; text: string }[] }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: desc,
    image: `${SITE_URL}/og-image.png`,
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    supply: [{ '@type': 'HowToSupply', name: 'Any modern web browser, or the Snake Online iOS / Android app' }],
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${SITE_URL}/${locale}/how-to-play#step-${i + 1}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default async function HowToPlayPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'howToPlay' });

  const steps = STEP_KEYS.map(k => ({ name: t(`steps.${k}.title`), text: t(`steps.${k}.body`) }));

  return (
    <>
      <HowToSchema locale={locale} title={t('seoTitle')} desc={t('seoDescription')} steps={steps} />

      <section className="relative pt-20 pb-12 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,149,0,0.16), transparent 60%)',
          }}
        />
        <div className="container-tight relative">
          <div className="chip-brand">{t('eyebrow')}</div>
          <h1 className="mt-5 font-display text-display-xl text-balance">
            <span className="gradient-text">{t('title')}</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-3xl text-pretty">{t('lead')}</p>
          <div className="mt-8">
            <Link href={`/${locale}/play`} className="btn-primary">
              <Play size={18} fill="currentColor" /> {t('playNow')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-tight">
          <ol className="relative space-y-6 sm:space-y-8">
            <span aria-hidden="true" className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-brand-500/40 via-magenta-500/30 to-purple-500/20" />
            {STEP_KEYS.map((k, i) => {
              const Icon = STEP_ICONS[i] || Target;
              return (
                <li key={k} id={`step-${i + 1}`} className="relative pl-16">
                  <span className="absolute left-0 top-0 size-12 rounded-2xl liquid-glass-strong flex items-center justify-center font-display text-sm font-bold text-brand-300">
                    {i + 1}
                  </span>
                  <div className="rounded-2xl liquid-glass p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className="text-brand-300" />
                      <h2 className="font-display text-lg font-semibold">{t(`steps.${k}.title`)}</h2>
                    </div>
                    <p className="text-text-secondary leading-relaxed text-pretty">{t(`steps.${k}.body`)}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-14 rounded-3xl liquid-glass p-8 text-center">
            <h2 className="font-display text-display-md">{t('readyTitle')}</h2>
            <p className="mt-3 text-text-secondary max-w-xl mx-auto">{t('readyBody')}</p>
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${locale}/play`} className="btn-primary-xl">
                <Play size={20} fill="currentColor" /> {t('playNow')}
              </Link>
              <Link href={`/${locale}/snakes`} className="btn-secondary">
                {t('browseSkins')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
