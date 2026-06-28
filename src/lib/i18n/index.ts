import en from "./en";
import ja from "./ja";

export const translations = {
  en,
  ja,
} as const;

export type Locale = keyof typeof translations;
export type Translation = typeof en; // Use one locale as the base for keys

// Deep key type helper
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type NestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T]: K extends string ? `${K}${DotPrefix<NestedKeys<T[K]>>}` : never;
      }[keyof T]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export type TranslationKey = NestedKeys<Translation>;
type NestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? NestedValue<T[First], Rest>
    : undefined
  : K extends keyof T
    ? T[K]
    : undefined;

function get<T, K extends string>(obj: T, key: K): NestedValue<T, K> {
  const parts = key.split(".");
  let result: unknown = obj;
  for (const part of parts) {
    if (result && typeof result === "object" && part in result) {
      result = (result as Record<string, unknown>)[part];
    } else {
      return undefined as NestedValue<T, K>;
    }
  }
  return result as NestedValue<T, K>;
}

/**
 * Type-safe translation function.
 *
 * WARNING: Prefer using the `translate` function provided by the `LocaleProvider` context
 * (see: src/components/LocaleProvider.tsx) instead of calling this function directly.
 * The context-based `translate` will automatically infer and use the user's current locale,
 * ensuring consistent and dynamic translations throughout your app.
 *
 * This function is intended for advanced or server-side usage where you must explicitly
 * specify the locale. For most client-side components, use the `useLocale` hook and
 * `translate` from the context.
 *
 * @param key - The translation key (type-safe, dot notation supported)
 * @param locale - The locale to use (defaults to "en" if not provided)
 * @returns The translated locale string, or 'en' locale string if none, or the key if no translation is found
 *
 * @see src/components/LocaleProvider.tsx
 */
export function t(key: TranslationKey, locale: Locale = "en") {
  return get(translations[locale], key) ?? get(translations.en, key) ?? key;
}
