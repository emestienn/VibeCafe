export const LOCALE_COOKIE = "vibecafe_locale";

export const locales = ["uz", "ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";

export const localeNames: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

export const localeFullNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
