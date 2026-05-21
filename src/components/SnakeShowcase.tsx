import { getTranslations } from 'next-intl/server';
import { getAllSkinsFromCatalog } from '@/lib/skins';
import SnakeShowcaseClient, { type ShowcaseItem } from './SnakeShowcaseClient';

// Six headline skins for the homepage. IDs are stable across the catalog;
// glow color is purely cosmetic. Names come from the backend /public/catalog/snakes
// endpoint so the homepage shows the same names players see in-game.
const SHOWCASE_CONFIG: { id: string; glow: string }[] = [
  { id: 'FSNAKE_01',  glow: '#FF6B35' },
  { id: 'FSNAKE_07',  glow: '#A455FF' },
  { id: 'FSNAKE_12',  glow: '#00E5FF' },
  { id: 'CSNAKE_USA', glow: '#3B82F6' },
  { id: 'CSNAKE_TR',  glow: '#FF3B8A' },
  { id: 'FSNAKE_22',  glow: '#FFD980' },
];

export default async function SnakeShowcase({ locale }: { locale: string }) {
  const all = await getAllSkinsFromCatalog();
  const tCountries = await getTranslations({ locale, namespace: 'skinTemplates.countries' });

  const items: ShowcaseItem[] = SHOWCASE_CONFIG
    .map(c => {
      const skin = all.find(s => s.id === c.id);
      if (!skin) return null;
      let name = skin.name;
      if (skin.isCountry && skin.country) {
        try { name = tCountries(skin.country); } catch { /* keep backend name */ }
      }
      return { ...skin, name, glow: c.glow };
    })
    .filter((x): x is ShowcaseItem => x !== null);

  return <SnakeShowcaseClient locale={locale} items={items} />;
}
