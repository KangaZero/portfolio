"use client";
import "./RubyNameTitle.css";
import { useLocale } from "@/components/LocaleProvider";
import { person } from "@/resources";

const RubyNameTitle = () => {
  const { locale } = useLocale();

  return (
    <h2 className="rubyNameTitle">
      {person.rubyName.map((name, index) => (
        <ruby key={index}>
          {name.romaji}
          <rp>(</rp>
          <rt className={locale === "en" ? "fade-out" : "fade-in"}>{name.furigana}</rt>
          <rp>)</rp>{" "}
        </ruby>
      ))}
    </h2>
  );
};

export { RubyNameTitle };
