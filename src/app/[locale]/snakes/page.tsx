import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import SnakesCollectionSchema from '@/components/SnakesCollectionSchema';
import { snakeImg, backgroundImg } from '@/lib/assets';
import backgrounds from '@/data/backgrounds.json';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { getAllSkinsFromCatalog, getAllSkins, type Skin } from '@/lib/skins';
import { getLocalizedSkin } from '@/lib/skin-localizer';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'snakes', path: '/snakes' });
}

/**
 * /snakes — the canonical hub for all 200+ skins.
 * Every card now wraps in a Link to /skins/{slug}, distributing PageRank to detail pages
 * (previously they were unclickable divs; the 166 detail pages were sitemap-only orphans).
 * Schema lives in <SnakesCollectionSchema /> for separation of concerns.
 */
export default async function SnakesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'snakes' });
  const tSkin = await getTranslations({ locale, namespace: 'skinPage' });

  const baseAll = await getAllSkinsFromCatalog();
  // Localise every skin's name/description/obtainHint so per-locale pages
  // show "Almanya" instead of "Germany", "Türkiye" instead of "Türkiye", etc.
  // Done in parallel — each call is just a memory lookup against the cached
  // locale messages, no I/O.
  const all = await Promise.all(baseAll.map(s => getLocalizedSkin(s.slug, locale)));
  const safeAll = all.filter((s): s is Skin => s !== undefined);
  const country = safeAll.filter(s => s.isCountry);
  const fancy = safeAll.filter(s => !s.isCountry && s.id.startsWith('FSNAKE_')).sort((a, b) => {
    const na = parseInt(a.id.replace('FSNAKE_', ''), 10);
    const nb = parseInt(b.id.replace('FSNAKE_', ''), 10);
    return na - nb;
  });
  const other = safeAll.filter(s => !s.isCountry && !s.id.startsWith('FSNAKE_'));

  const featuredFancy = fancy.slice(0, 36);
  const restFancy = fancy.slice(36);

  const bgList = (backgrounds as string[]).slice(0, 16);

  function SkinCard({ skin, dense }: { skin: Skin; dense?: boolean }) {
    return (
      <Link
        href={`/${locale}/skins/${skin.slug}`}
        className={`skin-grid-card rounded-2xl p-3 group relative overflow-hidden block focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-colors hover:border-border-strong ${dense ? '!p-1.5' : ''}`}
        aria-label={`${skin.name} — ${tSkin(`rarity.${skin.rarity}`)}`}
      >
        <div className={`relative aspect-square rounded-${dense ? 'md' : 'lg'} bg-bg-subtle/60 flex items-center justify-center overflow-hidden`}>
          <img
            src={snakeImg(skin.id)}
            alt={`${skin.name} snake skin in Snake Online`}
            loading="lazy"
            decoding="async"
            width={dense ? 64 : 160}
            height={dense ? 64 : 160}
            className="w-4/5 h-4/5 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        {!dense && (
          <div className="mt-2 text-[10px] text-text-tertiary text-center font-mono truncate">{skin.name}</div>
        )}
      </Link>
    );
  }

  return (
    <>
      <SnakesCollectionSchema locale={locale} />
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
          <div className="cv-auto grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {country.map(skin => <SkinCard key={skin.id} skin={skin} />)}
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
          <div className="cv-auto grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featuredFancy.map(skin => <SkinCard key={skin.id} skin={skin} />)}
          </div>
        </div>

        {/* Rest in dense grid */}
        {restFancy.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-5">+ {restFancy.length} more</h3>
            <div className="cv-auto grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
              {restFancy.map(skin => <SkinCard key={skin.id} skin={skin} dense />)}
            </div>
          </div>
        )}

        {other.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-5">Originals</h3>
            <div className="cv-auto grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {other.map(skin => <SkinCard key={skin.id} skin={skin} />)}
            </div>
          </div>
        )}

        {/* Backgrounds preview — non-clickable decorative gallery */}
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
                <img src={backgroundImg(id)} alt={`${id} arena background in Snake Online`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute bottom-2 left-3 text-xs font-mono text-text-secondary">{id}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
