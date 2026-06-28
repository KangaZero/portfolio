"use client";
import { IconButton, useToast } from "@once-ui-system/core";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";

const LocaleToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocaleCookieAndState } = useLocale();
  const { addToast } = useToast();
  return (
    <IconButton
      className={cn(className, "")}
      tooltip={locale === "en" ? "日本語に切り替える" : "Set to English"}
      icon={locale === "en" ? "englishInput" : "languageHiragana"}
      variant="ghost"
      onPointerDown={() => {
        setLocaleCookieAndState(locale === "en" ? "ja" : "en");
        addToast({
          variant: "success",
          message: locale === "en" ? "日本語に切り替えました" : "Switched to English",
        });
      }}
    />
  );
};

export { LocaleToggle };
