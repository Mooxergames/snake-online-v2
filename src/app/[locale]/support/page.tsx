import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import FAQ from '@/components/FAQ';
import { User, CreditCard, Gamepad2, Wrench, MessageCircle, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'support', path: '/support' });
}

export default async function SupportPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'support' });

  const cats = [
    { Icon: User,       label: t('categories.account'),  desc: 'Login, password, account recovery, deletion' },
    { Icon: CreditCard, label: t('categories.purchase'), desc: 'IAP, refunds, missing items, subscriptions' },
    { Icon: Gamepad2,   label: t('categories.gameplay'), desc: 'Controls, matchmaking, ranks, fair play' },
    { Icon: Wrench,     label: t('categories.technical'), desc: 'Crashes, lag, performance, compatibility' },
  ];

  const faqs = [
    { q: 'Is Snake Online free to play?', a: 'Yes. The game is 100% free on Web, iOS, and Android. We sell only cosmetic skins — no pay-to-win, ever.' },
    { q: 'Can I play across devices with the same account?', a: 'Absolutely. Sign in with the same provider (Apple, Google, or email) on any device and your trophies, skins, and rank follow you.' },
    { q: "I lost my account — how do I recover it?", a: 'If you signed in with Apple or Google, just sign in again on a new device. For email accounts, use the "Forgot password" link in the app or email support@snakeonline.io.' },
    { q: 'How do I get a refund for an in-app purchase?', a: 'Refunds are handled by Apple App Store or Google Play, not by us. Open the store app → Order history → Request refund. We never take cuts on refund decisions.' },
    { q: 'Why is my game lagging?', a: 'Most lag is network-related. Try switching from Wi-Fi to mobile data (or vice versa). Servers in 12 regions auto-pick the closest one — but background downloads can saturate your connection.' },
    { q: 'Are there cheaters? What do you do about them?', a: 'We use server-authoritative movement and behavioural anti-cheat. Confirmed cheaters get permanent hardware bans. Report a player from the in-game profile screen.' },
    { q: 'How are global ranks calculated?', a: 'Trophies = wins minus losses (weighted by opponent rank). Global rankings refresh every hour, regional every hour, lifetime stats every 12 hours.' },
    { q: 'Can I host private games with friends?', a: 'Friend lobbies are coming in the v3.0 update (Q3 2026). Discord groups can already coordinate to land in the same public server.' },
  ];

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />

      <section className="container-wide py-16 space-y-16">
        {/* Categories */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map(({ Icon, label, desc }) => (
              <div key={label} className="card card-hover group">
                <div className="size-11 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={20} />
                </div>
                <div className="font-display font-semibold mb-1.5">{label}</div>
                <div className="text-sm text-text-tertiary leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">Frequently asked</h2>
              <p className="mt-2 text-text-secondary">The questions we get asked most often.</p>
            </div>
            <Link href={`/${locale}/contact`} className="btn-secondary">
              <Mail size={16} /> Email support
            </Link>
          </div>
          <FAQ items={faqs} />
        </div>

        {/* Talk to a human */}
        <div className="rounded-3xl border border-border bg-bg-elevated p-10 text-center">
          <div className="inline-flex size-14 rounded-2xl bg-brand-500/10 text-brand-400 items-center justify-center mb-5">
            <MessageCircle size={26} />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Still stuck? Talk to a human.</h3>
          <p className="text-text-secondary max-w-lg mx-auto mb-6">Our support team replies within 24 hours, in 14 languages. We never use auto-responders.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${locale}/contact`} className="btn-primary">{t('contactSupport')}</Link>
            <a href="https://discord.gg/snakeonline" target="_blank" rel="noopener" className="btn-secondary">
              <MessageCircle size={16} /> Join Discord
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
