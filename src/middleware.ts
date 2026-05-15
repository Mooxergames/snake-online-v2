import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/locales';

export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
