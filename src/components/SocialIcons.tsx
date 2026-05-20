import { MessageCircle, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

export const SOCIALS = [
  { Icon: Facebook,      label: 'Facebook',  href: 'https://www.facebook.com/snakeonlineio/',    color: 'hover:text-blue-400'   },
  { Icon: Twitter,       label: 'X',         href: 'https://twitter.com/snakeonlineio',          color: 'hover:text-sky-400'    },
  { Icon: Instagram,     label: 'Instagram', href: 'https://www.instagram.com/snakeonlineio/',   color: 'hover:text-pink-400'   },
  { Icon: Youtube,       label: 'YouTube',   href: 'https://www.youtube.com/@SnakeOnlineio',     color: 'hover:text-red-400'    },
  { Icon: MessageCircle, label: 'Discord',   href: 'https://discord.gg/snakeonline',             color: 'hover:text-indigo-400' },
];

export default function SocialIcons({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {SOCIALS.map(({ Icon, label, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`p-2 rounded-full text-text-tertiary transition-colors ${color}`}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
