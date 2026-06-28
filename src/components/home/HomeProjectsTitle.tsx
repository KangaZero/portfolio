"use client";
import "./HomeProjectsTitle.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";

export default function AchievementsTitle() {
  const { translate } = useLocale();
  const title = translate("home.projects");
  const homeProjectsTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!homeProjectsTitleRef.current) return;
    gsap.registerPlugin(SplitText, ScrollTrigger);
    document.fonts.ready.then(() => {
      gsap.set(homeProjectsTitleRef.current, { opacity: 1 });
      const split = SplitText.create(homeProjectsTitleRef.current, {
        type: "chars",
        charsClass: "char++",
      });

      split.chars.forEach((char, i) => {
        const isFirstHalf = i < split.chars.length / 2;
        gsap.set(char, { x: isFirstHalf ? -200 : 200, opacity: 0 });
      });

      gsap.to(split.chars, {
        scrollTrigger: {
          trigger: homeProjectsTitleRef.current,
          start: "top 80%",
          end: "bottom 10%",
          toggleActions: "play none none none",
        },
        x: 0,
        opacity: 1,
        stagger: 0.08,
        delay: 0.4,
        duration: 1,
        ease: "power4",
      });
    });
  }, []);

  return <h1 ref={homeProjectsTitleRef}>{title}</h1>;
}
