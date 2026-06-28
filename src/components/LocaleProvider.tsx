"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type TranslationKey, t } from "@/lib/i18n";
import { useI18nIndicator } from "@/resources";
import { getLocaleCookieFromClient } from "@/utils/getLocaleCookie";
import { setLocaleCookie } from "@/utils/setLocaleCookie";

type OmitSecondParamFromFunction<F> = F extends (arg1: infer A, arg2: infer B) => infer R
  ? (arg1: A) => R
  : never;

type LocaleContextType = {
  locale: "en" | "ja";
  setLocaleCookieAndState: (locale: "en" | "ja") => void;
  translate: OmitSecondParamFromFunction<typeof t>;
  useLocaleContentOrDefaultContent<T = string>(value: T | string, key: TranslationKey): string | T;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children, lang }: { children: ReactNode; lang: string }) => {
  const pathname = usePathname();
  const [locale, setLocale] = useState<"en" | "ja">("en");
  useEffect(() => {
    //NOTE: This just takes the first /[value] in the path, so it could be anything
    const paramsLocale = lang;
    if (paramsLocale === "en" || paramsLocale === "ja") {
      setLocaleCookie(paramsLocale);
      return setLocale(paramsLocale);
    }
    const savedLocale = getLocaleCookieFromClient();

    if (!savedLocale) {
      const userLanguage = navigator.language;
      if (userLanguage === "ja" || userLanguage.startsWith("ja-")) {
        return setLocaleCookie("ja");
      } else if (userLanguage === "en" || userLanguage.startsWith("en-")) {
        return setLocaleCookie("en");
      } else {
        console.warn("No default locale found or incompatible, falling back to EN");
        return setLocaleCookie("en");
      }
    }
    setLocale(savedLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useLocaleContentOrDefaultContent<T = string>(value: T | string, key: TranslationKey) {
    if (typeof value === "string" && value === useI18nIndicator) {
      return translate(key);
    }
    return value;
  }

  const setParamsLocale = (newLocale: string) => {
    // 1. Split the path: ["", "en", "dashboard"]
    const pathSegments = pathname.split("/");

    // 2. Replace the locale segment (index 1)
    pathSegments[1] = newLocale;

    // 3. Join back but don't navigate: "/fr/dashboard"
    const newPath = pathSegments.join("/");
    // router.push(newPath);
    window.history.replaceState(null, "", newPath);
  };

  const setLocaleCookieAndState = (newLocale: "en" | "ja") => {
    setParamsLocale(newLocale);
    setLocaleCookie(newLocale);
    setLocale(newLocale);
  };

  const translate = (key: TranslationKey) => {
    return t(key, locale);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        useLocaleContentOrDefaultContent,
        setLocaleCookieAndState,
        translate,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within a LocaleProvider");
  return context;
};
