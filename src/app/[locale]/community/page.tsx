import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import { Twitter, Instagram, Youtube, Facebook, Users, Trophy, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'community', path: '/community' });
}

export default async function CommunityPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'community' });

  const channels = [
    { Icon: Facebook,  label: 'Facebook',     handle: 'facebook.com/snakeonlineio', href: 'https://www.facebook.com/snakeonlineio/',  followers: 'Follow us',       accent: 'from-blue-600 to-blue-400',  shadow: 'shadow-blue-500/20' },
    { Icon: Twitter,   label: t('twitter'),   handle: '@snakeonlineio',             href: 'https://twitter.com/snakeonlineio',        followers: '92K followers',   accent: 'from-sky-500 to-cyan-400',   shadow: 'shadow-sky-500/20'  },
    { Icon: Instagram, label: t('instagram'), handle: '@snakeonlineio',             href: 'https://www.instagram.com/snakeonlineio/', followers: '210K followers',  accent: 'from-pink-500 to-rose-500',  shadow: 'shadow-pink-500/20' },
    { Icon: Youtube,   label: t('youtube'),   handle: '@SnakeOnlineio',             href: 'https://www.youtube.com/@SnakeOnlineio',   followers: '67K subscribers', accent: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20'  },
  ];

  const stats = [
    { Icon: Users,    label: 'Active community',  value: '5M+' },
    { Icon: Trophy,   label: 'Tournaments hosted', value: '1,200+' },
    { Icon: Sparkles, label: 'Community creators', value: '8,400+' },
  ];

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />

      <section className="container-wide py-16 space-y-20">
        {/* Stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-3xl glass overflow-hidden">
          {stats.map(s => (
            <div key={s.label} className="bg-bg-elevated/50 p-8 text-center">
              <s.Icon className="mx-auto text-brand-400 mb-3" size={22} />
              <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-xs text-text-tertiary uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Channels */}
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-semibold">Where we hang out</h2>
            <p className="mt-2 text-text-secondary">Pick your platform — the conversation never stops.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener" className={`relative group rounded-2xl border border-border bg-bg-elevated overflow-hidden p-6 transition-all hover:scale-[1.015] hover:shadow-xl ${c.shadow}`}>
                <div className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${c.accent} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />
                <div className="relative">
                  <div className={`size-12 rounded-2xl bg-gradient-to-br ${c.accent} flex items-center justify-center text-white mb-5`}>
                    <c.Icon size={22} />
                  </div>
                  <div className="font-display text-xl font-semibold mb-1">{c.label}</div>
                  <div className="text-sm text-text-tertiary mb-4 font-mono">{c.handle}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{c.followers}</span>
                    <span className="text-brand-400 group-hover:text-brand-300">Follow →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Creator program teaser */}
        <div className="rounded-3xl border border-border bg-bg-elevated p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 70% at 50% 30%, rgba(255,149,0,0.20), transparent 65%), radial-gradient(ellipse 40% 50% at 30% 80%, rgba(255,59,138,0.18), transparent 65%)',
          }} aria-hidden="true" />
          <div className="relative">
            <div className="chip mb-5">CREATOR PROGRAM · COMING SOON</div>
            <h3 className="font-display text-3xl sm:text-4xl font-semibold mb-3 gradient-text">Make content. Earn skins.</h3>
            <p className="text-text-secondary max-w-xl mx-auto">Streamers and creators with 1K+ subscribers get exclusive skins, code drops, and revenue share. Apply to the Snake Creators program once it opens this summer.</p>
            <a href="mailto:info@visiongo.at" className="btn-primary mt-8">Get early access</a>
          </div>
        </div>
      </section>
    </>
  );
}
