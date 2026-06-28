"use client";
import "./AchievementsTitle.css";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";

export default function AchievementsTitle() {
  const { translate } = useLocale();
  const title = translate("achievements.label");
  const achievementsTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!achievementsTitleRef.current) return;
    gsap.registerPlugin(SplitText);
    document.fonts.ready.then(() => {
      gsap.set(achievementsTitleRef.current, { opacity: 1 });
      const split = SplitText.create(achievementsTitleRef.current, {
        type: "chars",
        charsClass: "char++",
      });

      // Set initial Y for each char: even = -100, odd = 100
      split.chars.forEach((char, i) => {
        gsap.set(char, { y: i % 2 === 0 ? -100 : 100, opacity: 0 });
      });

      gsap.to(split.chars, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        delay: 0.4,
        duration: 1,
        ease: "back",
      });
    });
  }, []);

  return <h1 ref={achievementsTitleRef}>{title}</h1>;
}
