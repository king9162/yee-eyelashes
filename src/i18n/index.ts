import en from "./en";
import zh from "./zh";

export type Lang = "en" | "zh";
export const defaultLang: Lang = "en";
export const supportedLangs: Lang[] = ["en", "zh"];

const translations = { en, zh };

export function getTranslations(lang: Lang) {
  return translations[lang] ?? translations.en;
}

export function isValidLang(lang: string): lang is Lang {
  return supportedLangs.includes(lang as Lang);
}
