export const locales = ['sk', 'en', 'de', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'sk';
