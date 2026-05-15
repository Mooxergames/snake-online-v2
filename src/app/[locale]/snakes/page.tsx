import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import { snakeImg, backgroundImg } from '@/lib/assets';
import snakes from '@/data/snakes.json';
import backgrounds from '@/data/backgrounds.json';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'snakes', path: '/snakes' });
}

export default async function SnakesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'snakes' });

  const all = snakes as string[];
  const country = all.filter(id => id.startsWith('CSNAKE_'));
  const fancy = all.filter(id => id.startsWith('FSNAKE_')).sort((a, b) => {
    const na = parseInt(a.replace('FSNAKE_', ''), 10);
    const nb = parseInt(b.replace('FSNAKE_', ''), 10);
    return na - nb;
  });
  const other = all.filter(id => !id.startsWith('CSNAKE_') && !id.startsWith('FSNAKE_'));

  const featuredFancy = fancy.slice(0, 36);
  const restFancy = fancy.slice(36);

  const bgList = (backgrounds as string[]).slice(0, 16);

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />

      <section className="container-wide py-16 space-y-20">
        {/* Country Snakes */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">Country Skins</h2>
              <p className="mt-1 text-text-secondary">{country.length} flag-themed snakes representing nations across the world.</p>
            </div>
            <span className="chip">{country.length} skins</span>
          </div>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {country.map(id => (
              <div key={id} className="card !p-3 group">
                <div className="aspect-square rounded-lg bg-bg-subtle/60 flex items-center justify-center overflow-hidden">
                  <img
                    src={snakeImg(id)}
                    alt={id}
                    loading="lazy"
                    className="w-4/5 h-4/5 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="mt-2 text-[10px] text-text-tertiary text-center font-mono truncate">{id.replace('CSNAKE_', '')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Fancy */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">Legendary Skins</h2>
              <p className="mt-1 text-text-secondary">Hand-crafted designs across {fancy.length} unique snakes.</p>
            </div>
            <span className="chip">{fancy.length} skins</span>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featuredFancy.map(id => (
              <div key={id} className="card !p-3 group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-brand-500/10 via-transparent to-magenta-500/10 pointer-events-none" />
                <div className="relative aspect-square rounded-lg bg-bg-subtle/60 flex items-center justify-center overflow-hidden">
                  <img
                    src={snakeImg(id)}
                    alt={id}
                    loading="lazy"
                    className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="mt-2 text-[10px] text-text-tertiary text-center font-mono">{id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest in dense grid */}
        {restFancy.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-5">+ {restFancy.length} more</h3>
            <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
              {restFancy.map(id => (
                <div key={id} className="aspect-square rounded-md bg-bg-subtle/40 hover:bg-bg-subtle transition-colors p-1.5 group">
                  <img src={snakeImg(id)} alt={id} loading="lazy" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>
        )}

        {other.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-5">Originals</h3>
            <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {other.map(id => (
                <div key={id} className="card !p-3">
                  <div className="aspect-square rounded-lg bg-bg-subtle/60 flex items-center justify-center overflow-hidden">
                    <img src={snakeImg(id)} alt={id} loading="lazy" className="w-4/5 h-4/5 object-contain" />
                  </div>
                  <div className="mt-2 text-[10px] text-text-tertiary text-center font-mono">{id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backgrounds preview */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">Game Arenas</h2>
              <p className="mt-1 text-text-secondary">Battle in {(backgrounds as string[]).length} unique themed environments.</p>
            </div>
            <span className="chip">{(backgrounds as string[]).length} arenas</span>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {bgList.map(id => (
              <div key={id} className="rounded-xl overflow-hidden border border-border group relative aspect-video bg-bg-subtle">
                <img src={backgroundImg(id)} alt={id} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 text-xs font-mono text-text-secondary">{id}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
