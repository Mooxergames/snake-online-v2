import { getSkinBySlug, type Skin } from './skins';

/**
 * Server-only locale-aware skin lookup.
 *
 * The base skin catalog in `lib/skins.ts` is English-only (auto-generated from
 * FANTASY_NAMES + COUNTRY_NAMES). This helper rewrites the user-facing fields
 * (`name`, `description`, `obtainHint`) using the active locale's
 * `skinTemplates` block from `messages/{locale}.json`.
 *
 *   • Country skins (`CSNAKE_*`): the country code is looked up in the
 *     localized `countries` map and substituted into the description /
 *     obtain-hint templates.
 *   • Fantasy skins (`FSNAKE_*`): the English brand name (Ember, Dusk…) is
 *     kept as-is for brand consistency, but the surrounding description /
 *     obtain-hint sentences come from the per-rarity localized templates.
 *
 * Falls back gracefully — if the locale file is missing `skinTemplates`,
 * the original English Skin is returned unchanged.
 */
export async function getLocalizedSkin(slug: string, locale: string): Promise<Skin | undefined> {
  const skin = getSkinBySlug(slug);
  if (!skin) return undefined;
  const messages = await loadMessages(locale);
  return applyTemplates(skin, messages);
}

export async function getLocalizedRelatedSkins(
  base: Skin,
  locale: string,
  count = 6,
): Promise<Skin[]> {
  const { getRelatedSkins } = await import('./skins');
  const related = getRelatedSkins(base, count);
  const messages = await loadMessages(locale);
  return related.map(s => applyTemplates(s, messages));
}

interface SkinTemplatesShape {
  descriptionCountry?: string;
  descriptionFantasy?: Record<string, string>;
  obtainHintCountry?: string;
  obtainHintFantasy?: Record<string, string>;
  countries?: Record<string, string>;
}

interface MessagesShape {
  skinTemplates?: SkinTemplatesShape;
}

async function loadMessages(locale: string): Promise<MessagesShape> {
  try {
    const mod = await import(`../../messages/${locale}.json`);
    return (mod.default ?? mod) as MessagesShape;
  } catch {
    try {
      const mod = await import(`../../messages/en.json`);
      return (mod.default ?? mod) as MessagesShape;
    } catch {
      return {};
    }
  }
}

function applyTemplates(skin: Skin, messages: MessagesShape): Skin {
  const t = messages.skinTemplates;
  if (!t) return skin;

  let name = skin.name;
  let description = skin.description;
  let obtainHint = skin.obtainHint;

  if (skin.isCountry && skin.country) {
    const localizedCountry = t.countries?.[skin.country] ?? skin.name;
    name = localizedCountry;
    if (t.descriptionCountry) {
      description = t.descriptionCountry.replace('{country}', localizedCountry);
    }
    if (t.obtainHintCountry) {
      obtainHint = t.obtainHintCountry.replace('{country}', localizedCountry);
    }
  } else {
    const desc = t.descriptionFantasy?.[skin.rarity];
    if (desc) description = desc.replace('{name}', skin.name);
    const oh = t.obtainHintFantasy?.[skin.rarity];
    if (oh) obtainHint = oh;
  }

  return { ...skin, name, description, obtainHint };
}
