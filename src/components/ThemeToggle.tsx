"use client";

import { Icon, ToggleButton, useTheme } from "@once-ui-system/core";
import React, { useEffect, useState } from "react";
import { useAchievements } from "./AchievementsProvider";
import styles from "./ThemeToggle.module.scss";

export const ThemeToggle: React.FC<{ className: string }> = ({ className }) => {
  const toggleThemeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();
  const { unlockAchievement } = useAchievements();
  const [, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const toggleIconRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const updateCurrentTheme = () => {
      setCurrentTheme(
        (document.documentElement.getAttribute("data-theme") as "light" | "dark" | null) ||
          (window.localStorage.getItem("data-theme") as "light" | "dark" | null) ||
          "light",
      );
    };
    updateCurrentTheme();
    const observer = new MutationObserver(updateCurrentTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!theme) return;
    setCurrentTheme(
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light",
    );
    toggleIconRef.current?.classList.remove(styles.iconSlide);
    // Trigger reflow to restart the animation
    void toggleIconRef.current?.offsetWidth;
    toggleIconRef.current?.classList.add(styles.iconSlide);
  }, [theme]);

  const icon = currentTheme === "dark" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  return (
    <ToggleButton
      ref={toggleThemeButtonRef}
      className={className}
      onPointerDown={async () => {
        if (!document.startViewTransition || !toggleThemeButtonRef.current) {
          setTheme(nextTheme);
          unlockAchievement("Eos");
          return;
        }
        await document.startViewTransition(() => {
          setTheme(nextTheme);
          unlockAchievement("Eos");
        }).ready;
        const { top, left, width, height } = toggleThemeButtonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
          Math.max(left, window.innerWidth - left),
          Math.max(top, window.innerHeight - top),
        );
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 600,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      }}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      <Icon
        ref={toggleIconRef}
        name={icon}
        size="s"
        tooltip={`Switch to ${nextTheme} mode`}
        tooltipPosition="top"
      />
    </ToggleButton>
  );
};
