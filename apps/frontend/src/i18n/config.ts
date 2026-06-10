export const locales = ['bs', 'en'] as const;
export const defaultLocale = 'bs';

export type Locale = (typeof locales)[number];
