import { MessageCircle, Twitter, Instagram, Youtube, Music2 } from 'lucide-react';

export const SOCIALS = [
  { Icon: MessageCircle, label: 'Discord',   href: 'https://discord.gg/snakeonline',       color: 'hover:text-indigo-400' },
  { Icon: Twitter,       label: 'X',         href: 'https://twitter.com/snakeonlineio',    color: 'hover:text-sky-400' },
  { Icon: Instagram,     label: 'Instagram', href: 'https://instagram.com/snakeonline.io', color: 'hover:text-pink-400' },
  { Icon: Music2,        label: 'TikTok',    href: 'https://tiktok.com/@snakeonline.io',   color: 'hover:text-rose-400' },
  { Icon: Youtube,       label: 'YouTube',   href: 'https://youtube.com/@snakeonline',     color: 'hover:text-red-400' },
];

export default function SocialIcons({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {SOCIALS.map(({ Icon, label, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener"
          aria-label={label}
          className={`p-2 rounded-full text-text-tertiary transition-colors ${color}`}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
