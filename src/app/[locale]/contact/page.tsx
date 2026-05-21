import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { Mail, MessageCircle, Briefcase, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'contact', path: '/contact' });
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  const tf = await getTranslations({ locale, namespace: 'contactForm' });

  const channels = [
    { Icon: Mail,        label: 'General',      email: 'info@visiongo.at',     desc: 'Anything else.' },
    { Icon: Briefcase,   label: 'Partnerships', email: 'info@visiongo.at',       desc: 'Brand collabs, esports, distribution.' },
    { Icon: Newspaper,   label: 'Press',        email: 'info@visiongo.at',     desc: 'Interviews, review codes, assets.' },
    { Icon: MessageCircle, label: 'Player Support', email: 'info@visiongo.at', desc: 'Account, billing, gameplay.' },
  ];

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />

      <section className="container-wide py-16 grid lg:grid-cols-2 gap-12">
        {/* Channels */}
        <div>
          <h2 className="font-display text-2xl font-semibold mb-6">{t('byTopic') || 'By topic'}</h2>
          <div className="space-y-3">
            {channels.map(c => (
              <a
                key={c.label}
                href={`mailto:${c.email}`}
                className="card card-hover flex items-start gap-4 group"
              >
                <div className="size-11 rounded-xl bg-bg-subtle flex items-center justify-center text-brand-400 shrink-0">
                  <c.Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold mb-1">{c.label}</div>
                  <div className="text-sm text-text-tertiary mb-2">{c.desc}</div>
                  <div className="text-sm text-brand-400 group-hover:text-brand-300 font-mono truncate">{c.email}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 text-sm text-text-tertiary">
            <Link href={`/${locale}/support`} className="hover:text-brand-400">{t('supportLink')}</Link>
          </div>
        </div>

        {/* Contact form (mailto submit) */}
        <div>
          <h2 className="font-display text-2xl font-semibold mb-6">{tf('title')}</h2>
          <form
            action="mailto:info@visiongo.at"
            method="post"
            encType="text/plain"
            className="space-y-4 card"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-text-tertiary">{tf('labels.name')}</span>
                <input
                  name="Name"
                  required
                  type="text"
                  className="mt-1.5 w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-bg-elevated transition-colors"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-text-tertiary">{tf('labels.email')}</span>
                <input
                  name="Email"
                  required
                  type="email"
                  className="mt-1.5 w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-bg-elevated transition-colors"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">{tf('labels.subject')}</span>
              <select
                name="Subject"
                className="mt-1.5 w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/60 transition-colors"
                defaultValue={tf('subjects.general')}
              >
                <option>{tf('subjects.general')}</option>
                <option>{tf('subjects.bugReport')}</option>
                <option>{tf('subjects.feedback')}</option>
                <option>{tf('subjects.partnership')}</option>
                <option>{tf('subjects.press')}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">{tf('labels.message')}</span>
              <textarea
                name="Message"
                required
                rows={6}
                className="mt-1.5 w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-bg-elevated transition-colors resize-none"
                placeholder="What's on your mind?"
              />
            </label>
            <button type="submit" className="btn-primary w-full justify-center">{tf('submit')}</button>
            <p className="text-[11px] text-text-tertiary text-center">
              By sending you agree to our <Link href={`/${locale}/legal/privacy`} className="underline hover:text-text-secondary">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
