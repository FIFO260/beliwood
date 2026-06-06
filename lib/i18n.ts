import type { Locale } from './i18n-config';

const dictionaries = {
  sk: () => import('../dictionaries/sk.json').then(m => m.default),
  en: () => import('../dictionaries/en.json').then(m => m.default),
  de: () => import('../dictionaries/de.json').then(m => m.default),
  pl: () => import('../dictionaries/pl.json').then(m => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
