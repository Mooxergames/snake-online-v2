import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Logo from './Logo';
import SocialIcons from './SocialIcons';
import AppBadges from './AppBadges';

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer');

  const sections = [
    {
      title: t('sections.game'),
      links: [
        { label: t('links.play'), href: `/${locale}/play` },
        { label: 'Downloads', href: `/${locale}/downloads` },
        { label: t('links.snakes'), href: `/${locale}/snakes` },
        { label: t('links.ranking'), href: `/${locale}/game-ranking` },
        { label: t('links.news'), href: `/${locale}/news` },
      ],
    },
    {
      title: t('sections.company'),
      links: [
        { label: t('links.about'), href: `/${locale}/about` },
        { label: t('links.community'), href: `/${locale}/community` },
        { label: t('links.contact'), href: `/${locale}/contact` },
      ],
    },
    {
      title: t('sections.resources'),
      links: [
        { label: t('links.support'), href: `/${locale}/support` },
        { label: 'Press Kit', href: `/${locale}/about` },
        { label: t('links.privacy'), href: `/${locale}/legal/privacy` },
        { label: t('links.terms'), href: `/${locale}/legal/terms` },
        { label: t('links.parents'), href: `/${locale}/legal/parents` },
        { label: t('links.data'), href: `/${locale}/legal/data-protection` },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border bg-bg-elevated mt-24 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,149,0,0.3), transparent 60%)' }}
      />
      <div className="container-wide py-16 relative">
        <div className="grid gap-12 lg:grid-cols-5 sm:grid-cols-2">
          <div className="lg:col-span-2 max-w-sm">
            <Link href={`/${locale}`} className="inline-flex items-center group">
              <Logo className="h-12 w-auto" />
            </Link>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed">{t('tagline')}</p>
            <div className="mt-6"><AppBadges /></div>
            <div className="mt-6 flex items-center gap-1 -ml-2">
              <SocialIcons size={16} />
            </div>
          </div>

          {sections.map(s => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">{s.title}</h4>
              <ul className="space-y-2.5">
                {s.links.map(l => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-text-tertiary">{t('copyright', { year: new Date().getFullYear() })}</p>
          <p className="text-xs text-text-tertiary italic">{t('madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
