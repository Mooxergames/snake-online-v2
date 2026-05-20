import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import {
  Shield, FileText, Users, Lock, Mail, ExternalLink,
  CheckCircle, AlertCircle, Globe, Smartphone, Star,
  Clock, Database, Eye, Key, Bell, ChevronRight,
} from 'lucide-react';
import { SITE_URL } from '@/lib/seo';

const APPLE_URL = 'https://apps.apple.com/us/app/online-snake-io-worm-clash/id6749900178';
const PLAY_URL  = 'https://play.google.com/store/apps/details?id=io.multiplayer.snake.online.game';

const DOCS = {
  privacy:          'privacy',
  terms:            'terms',
  parents:          'parents',
  'data-protection':'dataProtection',
} as const;

type DocSlug = keyof typeof DOCS;

export const revalidate = 86400;

export function generateStaticParams() {
  return (Object.keys(DOCS) as DocSlug[]).map(doc => ({ doc }));
}

export async function generateMetadata({ params }: { params: { locale: string; doc: string } }): Promise<Metadata> {
  if (!(params.doc in DOCS)) return {};
  const key = DOCS[params.doc as DocSlug];
  const t = await getTranslations({ locale: params.locale, namespace: `legal.${key}` });
  const title = t('title');
  const path = `/legal/${params.doc}`;
  return {
    title: { absolute: `${title} — Snake Online` },
    alternates: {
      canonical: `${SITE_URL}/${params.locale}${path}`,
    },
  };
}

// ─── Doc metadata ───────────────────────────────────────────────────────────

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

interface DocConfig {
  icon: React.ElementType;
  accentClass: string;
  bgGlow: string;
  badge: string;
  sections: Section[];
  contactNote: React.ReactNode;
}

function PlayStoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 1.2c-.3.3-.5.7-.5 1.2v19.2c0 .5.2.9.5 1.2L14 12 3.6 1.2zM15.4 13.4l2.7 2.7-12 6.9 9.3-9.6zM18.7 8.5l-2.6 2.6-9.4-9.6 12 7zM21.6 11.1c.5.3.8.8.8 1.4 0 .6-.3 1.1-.8 1.4l-3 1.7-2.8-2.7 2.8-2.8 3 1z" />
    </svg>
  );
}

function HighlightBox({ icon: Icon, title, children, color = 'brand' }: {
  icon: React.ElementType; title: string; children: React.ReactNode; color?: 'brand' | 'green' | 'blue' | 'amber' | 'rose';
}) {
  const colors = {
    brand: 'border-brand-500/30 bg-brand-500/5 text-brand-400',
    green: 'border-venom-500/30 bg-venom-500/5 text-venom-400',
    blue:  'border-blue-500/30 bg-blue-500/5 text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    rose:  'border-rose-500/30 bg-rose-500/5 text-rose-400',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 font-semibold text-sm mb-2">
        <Icon size={16} /> {title}
      </div>
      <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-text-secondary text-[15px] leading-relaxed">{children}</div>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle size={15} className="text-brand-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function buildDocs(): Record<DocSlug, DocConfig> {
  return {
    privacy: {
      icon: Shield,
      accentClass: 'text-brand-400',
      bgGlow: 'radial-gradient(ellipse 60% 50% at 40% 0%, rgba(255,149,0,0.12), transparent 60%)',
      badge: 'GDPR · CCPA · COPPA',
      sections: [
        {
          id: 'collect',
          icon: Eye,
          title: 'What We Collect',
          content: (
            <Prose>
              <p>Snake Online collects only the data necessary to deliver a fast, fair multiplayer experience. We do not run surveillance-style data collection and we do not build advertising profiles.</p>
              <ul className="space-y-2 mt-3">
                <Li><strong className="text-text-primary">Account info</strong> — display name, optional email (if you create a registered account). Guest play requires no personal data.</Li>
                <Li><strong className="text-text-primary">Gameplay statistics</strong> — score, kills, session length, selected skin, trophy count. Used for leaderboards and matchmaking.</Li>
                <Li><strong className="text-text-primary">Device & technical data</strong> — OS version, device model, IP address (for region detection and anti-cheat). Not linked to your identity.</Li>
                <Li><strong className="text-text-primary">Crash reports</strong> — stack traces sent only on crash to help us fix bugs. Contains no content you typed or viewed.</Li>
                <Li><strong className="text-text-primary">In-app purchase receipts</strong> — validated server-side through Apple / Google. We store the purchase ID, not your payment details.</Li>
              </ul>
            </Prose>
          ),
        },
        {
          id: 'use',
          icon: Database,
          title: 'How We Use Your Data',
          content: (
            <Prose>
              <p>Every data point we collect has a single, documented purpose:</p>
              <ul className="space-y-2 mt-3">
                <Li>Run the game — match you to servers in your region, validate session state.</Li>
                <Li>Maintain leaderboards — compute global and country rankings updated every 5 minutes.</Li>
                <Li>Prevent cheating — detect impossible scores and speed hacks; ban accounts that violate fair-play rules.</Li>
                <Li>Improve performance — aggregate (never individual) telemetry to optimise server tick rates and client frame budgets.</Li>
                <Li>Customer support — read your account state when you contact us for a refund or a ban appeal.</Li>
              </ul>
              <HighlightBox icon={CheckCircle} title="What we never do" color="green">
                We do not use your data for advertising, third-party data brokering, behavioural profiling, or any purpose not listed above.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'third-party',
          icon: Globe,
          title: 'Third-Party Services',
          content: (
            <Prose>
              <p>We integrate a small number of trusted services, each bound by data processing agreements:</p>
              <ul className="space-y-2 mt-3">
                <Li><strong className="text-text-primary">Apple App Store / Google Play</strong> — purchase validation and crash symbolication. Their own privacy policies apply to their platforms.</Li>
                <Li><strong className="text-text-primary">Railway (hosting)</strong> — EU-adjacent infrastructure, SOC 2 certified. Your data stays on Railway servers.</Li>
                <Li><strong className="text-text-primary">Cloudflare</strong> — DDoS protection and CDN. Traffic is proxied; Cloudflare does not receive personal account data.</Li>
              </ul>
              <p>We do not embed Facebook Pixel, Google Ads, or any other ad network SDKs.</p>
            </Prose>
          ),
        },
        {
          id: 'rights',
          icon: Key,
          title: 'Your Rights',
          content: (
            <Prose>
              <p>You have enforceable rights over your data regardless of where you live:</p>
              <ul className="space-y-2 mt-3">
                <Li><strong className="text-text-primary">Access</strong> — request a copy of all data we hold about you.</Li>
                <Li><strong className="text-text-primary">Correction</strong> — update inaccurate personal data (display name, email).</Li>
                <Li><strong className="text-text-primary">Deletion</strong> — permanently delete your account and all associated data within 30 days of request.</Li>
                <Li><strong className="text-text-primary">Portability</strong> — receive your gameplay history in a machine-readable format (JSON).</Li>
                <Li><strong className="text-text-primary">Objection</strong> — opt out of any processing not strictly necessary to run the game.</Li>
                <Li><strong className="text-text-primary">Complaint</strong> — lodge a complaint with your national data protection authority (EU residents: your local DPA; California residents: California AG).</Li>
              </ul>
              <p>To exercise any right, email <strong className="text-text-primary">privacy@snakeonline.io</strong>. We respond within 30 days.</p>
            </Prose>
          ),
        },
        {
          id: 'children',
          icon: Users,
          title: "Children's Privacy",
          content: (
            <Prose>
              <p>Snake Online is rated <strong className="text-text-primary">9+</strong> on the App Store and <strong className="text-text-primary">Everyone</strong> on Google Play.</p>
              <p>We do not knowingly collect personal information from users under 13 without verifiable parental consent. If you are a parent and believe your child under 13 has registered, contact us immediately at <strong className="text-text-primary">parents@snakeonline.io</strong> and we will delete the account within 72 hours.</p>
              <HighlightBox icon={Smartphone} title="Playing safely on mobile" color="blue">
                Guest play (no account) requires zero personal data — children can play without registration. In-app purchases are gated by Apple Family Sharing and Google Family Link.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'retention',
          icon: Clock,
          title: 'Data Retention',
          content: (
            <Prose>
              <p>We keep data only as long as it is needed:</p>
              <ul className="space-y-2 mt-3">
                <Li>Active account data — retained while the account exists.</Li>
                <Li>Deleted accounts — permanently purged within 30 days of deletion request.</Li>
                <Li>Crash reports — auto-deleted after 90 days.</Li>
                <Li>Server logs (IP, session) — retained for 14 days for anti-cheat, then discarded.</Li>
                <Li>Purchase receipts — kept for 7 years for tax compliance, fully anonymised after account deletion.</Li>
              </ul>
            </Prose>
          ),
        },
        {
          id: 'contact',
          icon: Mail,
          title: 'Contact & Updates',
          content: (
            <Prose>
              <p>This policy was last updated on <strong className="text-text-primary">January 15, 2026</strong>. Material changes will be communicated via in-app notification at least 30 days before taking effect.</p>
              <p>Questions? Email <strong className="text-text-primary">privacy@snakeonline.io</strong> — a human reads every message.</p>
            </Prose>
          ),
        },
      ],
      contactNote: <>Questions about this policy? Email <a href="mailto:privacy@snakeonline.io" className="text-brand-400 hover:underline">privacy@snakeonline.io</a></>,
    },

    terms: {
      icon: FileText,
      accentClass: 'text-purple-400',
      bgGlow: 'radial-gradient(ellipse 60% 50% at 40% 0%, rgba(164,85,255,0.12), transparent 60%)',
      badge: 'Fair Play · IAP · IP',
      sections: [
        {
          id: 'acceptance',
          icon: CheckCircle,
          title: 'Acceptance of Terms',
          content: (
            <Prose>
              <p>By downloading, installing, or playing Snake Online — on any platform (iOS, Android, PC, or web) — you agree to these Terms of Service. If you do not agree, please uninstall the application and stop using the service.</p>
              <p>You must be at least 9 years old to use Snake Online. If you are under 18, a parent or guardian must review and accept these terms on your behalf.</p>
              <HighlightBox icon={AlertCircle} title="TL;DR" color="amber">
                Play fair, respect other players, and don't abuse bugs. In return, we keep the servers running, the game balanced, and your data private.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'account',
          icon: Key,
          title: 'Your Account',
          content: (
            <Prose>
              <p>You may play as a guest (no registration required) or create a registered account for persistent stats and leaderboard placement.</p>
              <ul className="space-y-2 mt-3">
                <Li>You are responsible for the security of your account credentials.</Li>
                <Li>You may not share, sell, or transfer your account to another person.</Li>
                <Li>Each player may maintain one active account. Multi-accounting for competitive advantage is prohibited.</Li>
                <Li>We reserve the right to reclaim display names that violate community standards.</Li>
              </ul>
            </Prose>
          ),
        },
        {
          id: 'fairplay',
          icon: Shield,
          title: 'Fair Play Rules',
          content: (
            <Prose>
              <p>Snake Online is a competitive game. We take fair play seriously to protect the experience for all 5 million+ players.</p>
              <p><strong className="text-text-primary">Prohibited conduct:</strong></p>
              <ul className="space-y-2 mt-3">
                <Li>Using cheats, aimbots, speed hacks, macro inputs, or any software that automates gameplay.</Li>
                <Li>Exploiting server-side bugs to gain score, kills, or trophies unfairly.</Li>
                <Li>Coordinating with other players to artificially boost leaderboard positions.</Li>
                <Li>Harassment, hate speech, or targeted griefing.</Li>
                <Li>Attempting to reverse-engineer, decompile, or access the game server infrastructure.</Li>
              </ul>
              <p>Violations may result in a temporary suspension, permanent ban, or leaderboard removal at our sole discretion. We do not issue refunds for banned accounts.</p>
            </Prose>
          ),
        },
        {
          id: 'purchases',
          icon: Star,
          title: 'In-App Purchases',
          content: (
            <Prose>
              <p>Snake Online offers optional cosmetic in-app purchases (skins, bundles). No gameplay mechanics — speed, collision radius, or spawn rate — are affected by purchases.</p>
              <ul className="space-y-2 mt-3">
                <Li>All purchases are processed by Apple (App Store) or Google (Google Play) under their respective refund policies.</Li>
                <Li>Cosmetic items are non-refundable except as required by law or platform policy.</Li>
                <Li>Virtual currency and items have no real-world monetary value and cannot be traded, sold, or cashed out.</Li>
                <Li>We are not responsible for unauthorised purchases made through your device. Use platform parental controls to prevent this.</Li>
              </ul>
              <HighlightBox icon={Smartphone} title="On mobile" color="blue">
                You can disable in-app purchases entirely via iOS Screen Time (Settings → Screen Time → Content & Privacy Restrictions) or Android Family Link.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'ip',
          icon: Globe,
          title: 'Intellectual Property',
          content: (
            <Prose>
              <p>All game content — code, art, music, skins, brand name, logo, and UI — is the exclusive property of Snake Online Studio and protected by copyright law.</p>
              <p>You are granted a limited, non-transferable, revocable licence to play the game for personal, non-commercial purposes. You may:</p>
              <ul className="space-y-2 mt-3">
                <Li>Stream gameplay on platforms like Twitch, YouTube, or TikTok.</Li>
                <Li>Share screenshots and short clips with credit to Snake Online.</Li>
              </ul>
              <p>You may not: redistribute the game, sell game assets, create counterfeit accounts, or use the Snake Online name or logo in any commercial context without written permission.</p>
            </Prose>
          ),
        },
        {
          id: 'disclaimers',
          icon: AlertCircle,
          title: 'Disclaimers & Liability',
          content: (
            <Prose>
              <p>Snake Online is provided "as is". We strive for 99.9% uptime but do not guarantee uninterrupted availability, especially during planned maintenance or force-majeure events.</p>
              <p>To the maximum extent permitted by law, Snake Online Studio's liability for any claim arising from use of the service is limited to the amount you paid us in the 90 days preceding the claim.</p>
            </Prose>
          ),
        },
        {
          id: 'governing-law',
          icon: FileText,
          title: 'Governing Law & Changes',
          content: (
            <Prose>
              <p>These terms are governed by applicable law. Disputes that cannot be resolved informally will be submitted to binding arbitration or the competent courts of the jurisdiction where Snake Online Studio is registered.</p>
              <p>We may update these terms at any time. Material changes will be communicated via in-app notification at least 14 days before taking effect. Continued use of the service after the effective date constitutes acceptance of the updated terms.</p>
              <p>Last updated: <strong className="text-text-primary">January 15, 2026</strong>.</p>
            </Prose>
          ),
        },
      ],
      contactNote: <>Legal questions? Email <a href="mailto:legal@snakeonline.io" className="text-brand-400 hover:underline">legal@snakeonline.io</a></>,
    },

    parents: {
      icon: Users,
      accentClass: 'text-venom-400',
      bgGlow: 'radial-gradient(ellipse 60% 50% at 40% 0%, rgba(34,197,94,0.10), transparent 60%)',
      badge: 'Ages 9+ · COPPA · Safe by Default',
      sections: [
        {
          id: 'rating',
          icon: Star,
          title: 'Age Rating & Content',
          content: (
            <Prose>
              <p>Snake Online is rated <strong className="text-text-primary">9+ on the Apple App Store</strong> and <strong className="text-text-primary">Everyone on Google Play</strong>.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-2xl glass p-4 text-sm">
                  <div className="font-semibold text-text-primary mb-1">What the game contains</div>
                  <ul className="space-y-1.5 text-text-secondary">
                    {['Cartoon snake characters', 'Competitive multiplayer arena', 'Collectible cosmetic skins', 'Real-time global leaderboard'].map(i => (
                      <li key={i} className="flex items-center gap-2"><CheckCircle size={13} className="text-venom-400 shrink-0" />{i}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl glass p-4 text-sm">
                  <div className="font-semibold text-text-primary mb-1">What the game does NOT contain</div>
                  <ul className="space-y-1.5 text-text-secondary">
                    {['Voice or text chat with strangers', 'Violent or mature imagery', 'Gambling mechanics', 'Mandatory real-name registration'].map(i => (
                      <li key={i} className="flex items-center gap-2"><span className="text-rose-400 shrink-0">✕</span>{i}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Prose>
          ),
        },
        {
          id: 'guest-play',
          icon: Shield,
          title: 'Guest Play — No Account Needed',
          content: (
            <Prose>
              <p>Your child can play Snake Online <strong className="text-text-primary">without creating an account</strong>. Guest mode requires zero personal information — no email, no name, no phone number.</p>
              <p>Guest scores are local to the device and do not appear on the global leaderboard. A registered account is only needed for persistent trophy tracking and leaderboard placement.</p>
              <HighlightBox icon={Shield} title="Privacy by default" color="green">
                We do not collect personal information from users under 13 without verifiable parental consent (COPPA). Guest play is specifically designed with children in mind.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'purchases',
          icon: Smartphone,
          title: 'In-App Purchases & Parental Controls',
          content: (
            <Prose>
              <p>Snake Online has optional cosmetic in-app purchases (snake skins and bundles). These are <strong className="text-text-primary">disabled by default</strong> until your child's device allows them. No gameplay content is paywalled — your child gets the full competitive experience for free.</p>
              <p><strong className="text-text-primary">How to disable purchases:</strong></p>
              <ul className="space-y-2 mt-3">
                <Li><strong>iOS (iPhone/iPad)</strong> — Settings → Screen Time → Content &amp; Privacy Restrictions → iTunes &amp; App Store Purchases → In-app Purchases → Off.</Li>
                <Li><strong>Android</strong> — Google Play → profile icon → Settings → Family → Parental controls → Purchases require authentication.</Li>
                <Li><strong>Google Family Link</strong> — In the Family Link app, select your child's account → Controls → Content restrictions → Google Play → Purchases → Require approval.</Li>
              </ul>
            </Prose>
          ),
        },
        {
          id: 'screen-time',
          icon: Clock,
          title: 'Screen Time Tips',
          content: (
            <Prose>
              <p>Here are a few practical suggestions from parents who play with their kids:</p>
              <ul className="space-y-2 mt-3">
                <Li>Set a session timer — most matches are 3-5 minutes, making it easy to define "one more game" boundaries.</Li>
                <Li>Play together for the first few sessions to learn the controls and strategy as a team.</Li>
                <Li>Use the leaderboard as motivation: track your child's personal best score week-over-week.</Li>
                <Li>iOS Screen Time and Android Digital Wellbeing both support per-app daily time limits.</Li>
              </ul>
              <HighlightBox icon={Bell} title="Platform tools" color="blue">
                Apple Screen Time and Google Family Link let you set daily limits for Snake Online specifically — we encourage you to use them alongside your own household rules.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'contact-parents',
          icon: Mail,
          title: 'Contact for Parents',
          content: (
            <Prose>
              <p>We take parent concerns seriously. If you have questions or need to request account deletion for your child, contact our dedicated parents support line:</p>
              <p className="mt-2"><strong className="text-text-primary">parents@snakeonline.io</strong> — we respond within 24 hours on weekdays.</p>
              <p>We will delete any account belonging to a user under 13 within 72 hours of a verified request, including all associated gameplay data.</p>
            </Prose>
          ),
        },
      ],
      contactNote: <>Parent questions or concerns? Email <a href="mailto:parents@snakeonline.io" className="text-brand-400 hover:underline">parents@snakeonline.io</a></>,
    },

    'data-protection': {
      icon: Lock,
      accentClass: 'text-blue-400',
      bgGlow: 'radial-gradient(ellipse 60% 50% at 40% 0%, rgba(59,130,246,0.12), transparent 60%)',
      badge: 'TLS 1.3 · AES-256 · GDPR Art. 32',
      sections: [
        {
          id: 'technical',
          icon: Lock,
          title: 'Technical Security Measures',
          content: (
            <Prose>
              <p>We apply industry-standard security controls across every layer of the Snake Online infrastructure:</p>
              <ul className="space-y-2 mt-3">
                <Li><strong className="text-text-primary">Transport encryption</strong> — All client–server communication is encrypted with TLS 1.3. Older TLS versions are rejected.</Li>
                <Li><strong className="text-text-primary">Data at rest</strong> — Player databases are encrypted with AES-256. Encryption keys are managed separately from the data.</Li>
                <Li><strong className="text-text-primary">Network isolation</strong> — Game servers and database servers run in separate network segments with strict firewall rules.</Li>
                <Li><strong className="text-text-primary">DDoS mitigation</strong> — Cloudflare Magic Transit protects game endpoints from volumetric attacks.</Li>
                <Li><strong className="text-text-primary">Dependency scanning</strong> — Automated vulnerability checks run on every code deployment.</Li>
              </ul>
              <HighlightBox icon={CheckCircle} title="Security posture" color="green">
                Our infrastructure is aligned with the OWASP Application Security Verification Standard (ASVS) Level 2. Penetration tests are conducted annually.
              </HighlightBox>
            </Prose>
          ),
        },
        {
          id: 'retention',
          icon: Clock,
          title: 'Data Retention Schedule',
          content: (
            <Prose>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-tertiary">
                      <th className="py-3 pr-6">Data type</th>
                      <th className="py-3 pr-6">Retention period</th>
                      <th className="py-3">Basis</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    {[
                      ['Account data', 'Duration of account existence', 'Contract'],
                      ['Gameplay statistics', 'Duration of account existence', 'Legitimate interest'],
                      ['IP / session logs', '14 days', 'Security / anti-cheat'],
                      ['Crash reports', '90 days', 'Service improvement'],
                      ['Purchase receipts', '7 years after account deletion', 'Tax / legal obligation'],
                      ['Deleted accounts', 'Purged within 30 days of request', 'GDPR Art. 17'],
                    ].map(([type, period, basis]) => (
                      <tr key={type} className="border-b border-border/50">
                        <td className="py-3 pr-6 text-text-primary font-medium">{type}</td>
                        <td className="py-3 pr-6">{period}</td>
                        <td className="py-3">{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Prose>
          ),
        },
        {
          id: 'gdpr-rights',
          icon: Key,
          title: 'GDPR Rights (EU / EEA)',
          content: (
            <Prose>
              <p>If you are located in the European Union or European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="space-y-2 mt-3">
                <Li><strong className="text-text-primary">Art. 15</strong> — Right of access: obtain a copy of your personal data.</Li>
                <Li><strong className="text-text-primary">Art. 16</strong> — Right to rectification: correct inaccurate data.</Li>
                <Li><strong className="text-text-primary">Art. 17</strong> — Right to erasure ("right to be forgotten"): delete your account and data.</Li>
                <Li><strong className="text-text-primary">Art. 18</strong> — Right to restriction: limit how we use your data pending a dispute.</Li>
                <Li><strong className="text-text-primary">Art. 20</strong> — Right to portability: receive your data in JSON format.</Li>
                <Li><strong className="text-text-primary">Art. 21</strong> — Right to object: opt out of processing based on legitimate interests.</Li>
                <Li><strong className="text-text-primary">Art. 77</strong> — Right to lodge a complaint with your national supervisory authority.</Li>
              </ul>
            </Prose>
          ),
        },
        {
          id: 'transfers',
          icon: Globe,
          title: 'International Data Transfers',
          content: (
            <Prose>
              <p>Snake Online's primary infrastructure is hosted in the EU (Railway, Frankfurt datacenter). We do not systematically transfer personal data to countries outside the EEA.</p>
              <p>In cases where sub-processors operate outside the EEA (e.g. Cloudflare edge nodes), we rely on the European Commission's Standard Contractual Clauses (SCCs) as the legal transfer mechanism.</p>
            </Prose>
          ),
        },
        {
          id: 'dpa',
          icon: FileText,
          title: 'Data Processing Agreement',
          content: (
            <Prose>
              <p>If you are a business or developer integrating Snake Online services and require a Data Processing Agreement (DPA) under GDPR Art. 28, please email <strong className="text-text-primary">legal@snakeonline.io</strong> with subject line "DPA Request". We will provide a signed DPA within 5 business days.</p>
            </Prose>
          ),
        },
        {
          id: 'contact-dp',
          icon: Mail,
          title: 'Data Protection Contact',
          content: (
            <Prose>
              <p>For all data protection enquiries — access requests, erasure requests, complaints, or DPA requests — contact:</p>
              <p className="mt-2"><strong className="text-text-primary">privacy@snakeonline.io</strong></p>
              <p>We respond to all requests within 30 days as required by GDPR Art. 12. If your request is complex, we may extend by a further 60 days and will notify you within the initial 30-day period.</p>
            </Prose>
          ),
        },
      ],
      contactNote: <>Data protection enquiries: <a href="mailto:privacy@snakeonline.io" className="text-brand-400 hover:underline">privacy@snakeonline.io</a></>,
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function LegalPage({ params }: { params: { locale: string; doc: string } }) {
  if (!(params.doc in DOCS)) notFound();
  unstable_setRequestLocale(params.locale);

  const key = DOCS[params.doc as DocSlug];
  const t = await getTranslations({ locale: params.locale, namespace: `legal.${key}` });
  const docs = buildDocs();
  const doc = docs[params.doc as DocSlug];
  const DocIcon = doc.icon;
  const isParents = params.doc === 'parents';

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: doc.bgGlow }} aria-hidden="true" />
        <div className="container-wide relative py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/80 px-4 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-5">
                <DocIcon size={13} className={doc.accentClass} />
                {doc.badge}
              </div>
              <h1 className="font-display text-display-xl text-balance gradient-text">{t('title')}</h1>
              <p className="mt-4 text-text-tertiary text-sm flex items-center gap-1.5">
                <Clock size={13} /> {t('lastUpdated')}: January 15, 2026
              </p>
            </div>

            {/* Trust cards */}
            <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
              <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 text-sm">
                <div className="size-9 rounded-full bg-venom-500/10 ring-1 ring-venom-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} className="text-venom-400" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">GDPR Compliant</div>
                  <div className="text-[11px] text-text-tertiary">EU data protection</div>
                </div>
              </div>
              <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 text-sm">
                <div className="size-9 rounded-full bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">TLS 1.3 · AES-256</div>
                  <div className="text-[11px] text-text-tertiary">End-to-end encryption</div>
                </div>
              </div>
              {isParents && (
                <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 text-sm">
                  <div className="size-9 rounded-full bg-brand-500/10 ring-1 ring-brand-500/30 flex items-center justify-center shrink-0">
                    <Star size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Rated 9+</div>
                    <div className="text-[11px] text-text-tertiary">App Store · Google Play</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-8">
            {doc.sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/60 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
              >
                <s.icon size={11} /> {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container-tight py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">

          {/* Sticky sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-4 px-3">On this page</p>
              {doc.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] transition-all"
                >
                  <span className="size-5 rounded-md bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-text-tertiary shrink-0 group-hover:bg-brand-500/15 group-hover:text-brand-400 transition-colors">
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              ))}

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-3 px-3">Other pages</p>
                {(Object.keys(DOCS) as DocSlug[]).filter(d => d !== params.doc).map(d => (
                  <Link
                    key={d}
                    href={`/${params.locale}/legal/${d}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] transition-all"
                  >
                    <ChevronRight size={12} className="shrink-0" />
                    {DOCS[d] === 'privacy' ? 'Privacy Policy'
                      : DOCS[d] === 'terms' ? 'Terms of Service'
                      : DOCS[d] === 'parents' ? 'Parents Guide'
                      : 'Data Protection'}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-12 min-w-0">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-9 rounded-xl bg-bg-elevated ring-1 ring-border flex items-center justify-center shrink-0">
                    <s.icon size={16} className={doc.accentClass} />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-text-primary">{s.title}</h2>
                  <span className="ml-auto text-[10px] font-mono text-text-tertiary opacity-40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="pl-12">
                  {s.content}
                </div>
                {i < doc.sections.length - 1 && <hr className="mt-12 border-border" />}
              </section>
            ))}

            {/* Parents: App Store links */}
            {isParents && (
              <section className="scroll-mt-24">
                <hr className="mb-12 border-border" />
                <div className="rounded-3xl liquid-glass-strong p-8 text-center">
                  <div className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">Available now on</div>
                  <h2 className="font-display text-2xl text-text-primary mb-6">Download Snake Online</h2>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={APPLE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-white text-bg px-5 py-3 font-semibold text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-99.5C27.8 679.4 0 563.7 0 453.8c0-107.8 26.1-196.9 74.9-255.6 41.7-50.2 101.6-80.2 166.9-80.2 68.2 0 109 41.9 163.8 41.9 52.7 0 85.1-42.2 163.8-42.2 62.4 0 120.3 28.3 163.5 78.8zm-42.1-174.9C790.7 106 803.3 59.5 803.3 14c0-11.3-.9-22.6-2.7-31.8C726.2-14.8 638.9 28.4 591 96.8c-42.2 59.8-70.2 132.2-70.2 210.6 0 14.4 2.4 28.8 3.8 34.6 6.4 1.3 14.8 2.8 23.5 2.8 72.4 0 157.7-41.9 198.9-137.8z" />
                      </svg>
                      <span className="leading-none">
                        <span className="block text-[9px] opacity-70 -mb-0.5">Download on the</span>
                        App Store
                      </span>
                    </a>
                    <a
                      href={PLAY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-bg-elevated border border-border-strong text-text-primary px-5 py-3 font-semibold text-sm hover:scale-[1.02] hover:border-brand-500/50 transition-all"
                    >
                      <PlayStoreIcon />
                      <span className="leading-none">
                        <span className="block text-[9px] opacity-70 -mb-0.5">Get it on</span>
                        Google Play
                      </span>
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Contact footer */}
            <section>
              <hr className="mb-12 border-border" />
              <div className="rounded-3xl liquid-glass p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="size-12 rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/30 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-text-primary text-lg">Still have questions?</div>
                  <p className="mt-1 text-sm text-text-secondary">{doc.contactNote}</p>
                </div>
                <a
                  href={`mailto:${
                    params.doc === 'parents' ? 'parents' : params.doc === 'terms' ? 'legal' : 'privacy'
                  }@snakeonline.io`}
                  className="btn-secondary shrink-0 text-sm"
                >
                  Contact us <ExternalLink size={13} />
                </a>
              </div>
            </section>

            {/* Legal nav mobile */}
            <nav className="lg:hidden">
              <hr className="mb-8 border-border" />
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DOCS) as DocSlug[]).filter(d => d !== params.doc).map(d => (
                  <Link
                    key={d}
                    href={`/${params.locale}/legal/${d}`}
                    className="rounded-xl glass px-4 py-3 text-sm text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors"
                  >
                    <ChevronRight size={13} />
                    {DOCS[d] === 'privacy' ? 'Privacy Policy'
                      : DOCS[d] === 'terms' ? 'Terms of Service'
                      : DOCS[d] === 'parents' ? 'Parents Guide'
                      : 'Data Protection'}
                  </Link>
                ))}
              </div>
            </nav>
          </main>
        </div>
      </div>
    </>
  );
}
