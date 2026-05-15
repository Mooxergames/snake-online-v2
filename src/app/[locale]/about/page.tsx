import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import { snakeImg } from '@/lib/assets';
import { Sparkles, Rocket, Target, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'about', path: '/about' });
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const values = t.raw('values.items') as Array<{ title: string; body: string }>;

  const timeline = [
    { year: '2023', title: 'First commit',    body: 'Two engineers, one prototype, one shared dream of Snake reborn for the .io era.' },
    { year: '2024', title: 'Soft launch',     body: 'Open beta in Turkey, Brazil, and Indonesia. 100K players in the first week.' },
    { year: '2025', title: 'Global launch',   body: 'Apple App Store + Google Play global release. Hits 1M MAU in 90 days.' },
    { year: '2026', title: 'You are here',    body: 'Crossing 5M players. 200+ skins. 14 languages. The arena keeps growing.' },
  ];

  const team = [
    { id: 'AVATAR_01', role: 'Founder · Code', name: 'M.' },
    { id: 'AVATAR_05', role: 'Game Design',    name: 'A.' },
    { id: 'AVATAR_12', role: 'Art Direction',  name: 'E.' },
    { id: 'AVATAR_18', role: 'Backend',        name: 'B.' },
    { id: 'AVATAR_22', role: 'Community',      name: 'S.' },
    { id: 'AVATAR_03', role: 'Localization',   name: 'L.' },
  ];

  const valueIcons = [Heart, Target, Rocket];

  return (
    <>
      <PageHero title={t('title')} subtitle={t('lead')} />

      <section className="container-wide py-16 space-y-24">
        {/* Mission */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <div className="chip mb-4">OUR MISSION</div>
            <h2 className="font-display text-3xl font-semibold">{t('mission.title')}</h2>
          </div>
          <div className="lg:col-span-2 card !p-8 relative overflow-hidden">
            <Sparkles className="absolute top-6 right-6 text-brand-400/30" size={40} />
            <p className="text-text-secondary text-xl leading-relaxed">{t('mission.body')}</p>
          </div>
        </div>

        {/* Values */}
        <div>
          <div className="mb-10">
            <div className="chip mb-4">WHAT WE STAND FOR</div>
            <h2 className="font-display text-3xl font-semibold">{t('values.title')}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map((v, i) => {
              const Icon = valueIcons[i] || Heart;
              return (
                <div key={v.title} className="card card-hover group">
                  <div className="size-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-5 group-hover:bg-brand-500/20 transition-colors">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="mb-10">
            <div className="chip mb-4">OUR JOURNEY</div>
            <h2 className="font-display text-3xl font-semibold">From hack week to 5 million players</h2>
          </div>
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-brand-500/60 before:via-magenta-500/40 before:to-transparent">
            {timeline.map(item => (
              <div key={item.year} className="relative">
                <div className="absolute -left-6 sm:-left-8 top-1.5 size-4 rounded-full bg-brand-500 ring-4 ring-bg" />
                <div className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-1">{item.year}</div>
                <h3 className="font-display text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed max-w-xl">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <div className="mb-10">
            <div className="chip mb-4">THE STUDIO</div>
            <h2 className="font-display text-3xl font-semibold">A small team. Big arena.</h2>
            <p className="mt-3 text-text-secondary max-w-xl">Six humans across four time zones. We use our own avatars. Hi.</p>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {team.map(m => (
              <div key={m.id} className="card !p-4 text-center group">
                <div className="size-20 mx-auto rounded-full bg-bg-subtle overflow-hidden ring-2 ring-border group-hover:ring-brand-500/50 transition-all">
                  <img src={snakeImg('FSNAKE_01')} alt="" className="hidden" />
                  <img src={`/cdn/avatars/${m.id}.png`} alt={m.role} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="mt-3 font-display font-semibold">{m.name}</div>
                <div className="text-xs text-text-tertiary mt-0.5">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
