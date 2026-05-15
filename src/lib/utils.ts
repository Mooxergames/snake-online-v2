import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function getAssetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_ASSETS_BASE || 'https://backend.snakeonlines.com/public';
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${base}/${path.replace(/^\/+/, '')}`;
}
