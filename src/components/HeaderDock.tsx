"use client";

import "./HeaderDock.css";
import { Animation, IconButton, Line, Row, StyleOverlay, ToggleButton } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { display, routes } from "@/resources";

const HeaderDock = () => {
  const pathname = usePathname() ?? "";
  const { translate, locale } = useLocale();
  const [hideMenu, setHideMenu] = useState(false);
  const [chevronAnimating, setChevronAnimating] = useState(false);

  const handleChevronPointerDown = () => {
    setChevronAnimating(false); // Remove class if present
    // Force reflow to restart animation
    requestAnimationFrame(() => {
      setChevronAnimating(true); // Add class to trigger animation
    });
  };

  useEffect(() => {
    if (!document) return;
    const menuIcons: NodeListOf<HTMLButtonElement> | undefined =
      document.querySelectorAll(".menuIcon");
    if (!menuIcons) return console.warn("No menu icons found for hover effect");
    menuIcons.forEach((icon, idx, icons) => {
      icon.addEventListener("mouseenter", () => {
        icon.classList.add("menuIconHovered");
        if (icons[idx - 1]) icons[idx - 1].classList.add("adjacentMenuIconHovered");
        if (icons[idx + 1]) icons[idx + 1].classList.add("adjacentMenuIconHovered");
      });
      icon.addEventListener("mouseleave", () => {
        icon.classList.remove("menuIconHovered");
        if (icons[idx - 1]) icons[idx - 1].classList.remove("adjacentMenuIconHovered");
        if (icons[idx + 1]) icons[idx + 1].classList.remove("adjacentMenuIconHovered");
      });
    });
    return () => {
      document.querySelectorAll(".menuIcon").forEach((icon) => {
        icon.removeEventListener("mouseenter", () => {});
        icon.removeEventListener("mouseleave", () => {});
      });
    };
  }, []);

  return (
    <Row fillWidth horizontal="center">
      <Row
        background="page"
        border="neutral-alpha-weak"
        radius="m-4"
        shadow="l"
        padding="4"
        horizontal="center"
        zIndex={1}
      >
        <Row gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning>
          {routes["/"] && (
            <>
              <Row s={{ hide: true }}>
                <Animation
                  blur={8}
                  triggerType="hover"
                  center
                  duration={400}
                  trigger={
                    <ToggleButton
                      prefixIcon="home"
                      href={`/${locale}`}
                      disabled={pathname === `/${locale}`}
                      selected={pathname === `/${locale}`}
                    />
                  }
                >
                  <ToggleButton
                    prefixIcon="home"
                    className="menuIcon"
                    href={`/${locale}`}
                    disabled={pathname === `/${locale}`}
                    selected={pathname === `/${locale}`}
                  />
                </Animation>
              </Row>
              <Row hide s={{ hide: false }}>
                <ToggleButton
                  prefixIcon="home"
                  href={`/${locale}`}
                  disabled={pathname === `/${locale}`}
                  selected={pathname === `/${locale}`}
                />
              </Row>
            </>
          )}
          <Row className={`menuItems ${hideMenu ? "menuHidden" : "menuVisible"}`}>
            <Line background="neutral-alpha-medium" vert maxHeight="24" s={{ hide: true }} />
            {routes["/about"] && (
              <>
                <Row s={{ hide: true }}>
                  <ToggleButton
                    prefixIcon="person"
                    className="menuIcon"
                    label={translate("about.label")}
                    href={`/${locale}/about`}
                    disabled={pathname === `/${locale}/about`}
                    selected={pathname === `/${locale}/about`}
                  />
                </Row>
                <Row hide s={{ hide: false }}>
                  <ToggleButton
                    prefixIcon="person"
                    href={`/${locale}/about`}
                    disabled={pathname === `/${locale}/about`}
                    selected={pathname === `/${locale}/about`}
                  />
                </Row>
              </>
            )}
            {routes["/work"] && (
              <>
                <Row s={{ hide: true }}>
                  <ToggleButton
                    prefixIcon="grid"
                    className="menuIcon"
                    label={translate("work.label")}
                    href={`/${locale}/work`}
                    disabled={pathname === `/${locale}/work`}
                    selected={pathname.startsWith(`/${locale}/work`)}
                  />
                </Row>
                <Row hide s={{ hide: false }}>
                  <ToggleButton
                    prefixIcon="grid"
                    href={`/${locale}/work`}
                    disabled={pathname === `/${locale}/work`}
                    selected={pathname.startsWith(`/${locale}/work`)}
                  />
                </Row>
              </>
            )}
            {routes["/blog"] && (
              <>
                <Row s={{ hide: true }}>
                  <ToggleButton
                    prefixIcon="book"
                    className="menuIcon"
                    label={translate("blog.label")}
                    href={`/${locale}/blog`}
                    disabled={pathname === `/${locale}/blog`}
                    selected={pathname.startsWith(`/${locale}/blog`)}
                  />
                </Row>
                <Row hide s={{ hide: false }}>
                  <ToggleButton
                    prefixIcon="book"
                    href={`/${locale}/blog`}
                    disabled={pathname === `/${locale}/blog`}
                    selected={pathname.startsWith(`/${locale}/blog`)}
                  />
                </Row>
              </>
            )}
            {routes["/achievements"] && (
              <>
                <Row s={{ hide: true }}>
                  <ToggleButton
                    prefixIcon="trophy"
                    className="menuIcon"
                    label={translate("achievements.label")}
                    href={`/${locale}/achievements`}
                    disabled={pathname.startsWith(`/${locale}/achievements`)}
                    selected={pathname.startsWith(`/${locale}/achievements`)}
                  />
                </Row>
                <Row hide s={{ hide: false }}>
                  <ToggleButton
                    prefixIcon="trophy"
                    href={`/${locale}/achievements`}
                    disabled={pathname.startsWith(`/${locale}/achievements`)}
                    selected={pathname.startsWith(`/${locale}/achievements`)}
                  />
                </Row>
              </>
            )}
            {routes["/gallery"] && (
              <>
                <Row s={{ hide: true }}>
                  <ToggleButton
                    prefixIcon="gallery"
                    className="menuIcon"
                    label={translate("gallery.label")}
                    href={`/${locale}/gallery`}
                    disabled={pathname.startsWith(`/${locale}/gallery`)}
                    selected={pathname.startsWith(`/${locale}/gallery`)}
                  />
                </Row>
                <Row hide s={{ hide: false }}>
                  <ToggleButton
                    prefixIcon="gallery"
                    href={`/${locale}/gallery`}
                    disabled={pathname.startsWith(`/${locale}/gallery`)}
                    selected={pathname.startsWith(`/${locale}/gallery`)}
                  />
                </Row>
              </>
            )}
          </Row>
          {display.themeSwitcher && (
            <>
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              <ThemeToggle className="menuIcon" />
            </>
          )}
          {display.localeSwitcher && <LocaleToggle className="menuIcon" />}
          {!hideMenu && (
            <>
              <Line
                className={"hideElementOnMobile"}
                background="neutral-alpha-medium"
                vert
                maxHeight="24"
              />
              <StyleOverlay minHeight={25} overflowY="auto">
                <IconButton
                  //NOTE: StyleOverlay must not be allowing the querySelector to work, thus need to manually add a different className
                  className={"menuIcon menuIconManual hideElementOnMobile"}
                  tooltip="Open style settings"
                  icon="sun"
                  variant="ghost"
                  //NOTE: full menu needs to be shown else the screen size is too small to access the style settings
                  onPointerDown={() => {
                    if (hideMenu) {
                      setHideMenu(false);
                    }
                  }}
                />
              </StyleOverlay>
            </>
          )}
          {display.menuAccordion && (
            <>
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              <ToggleButton
                className={`menuIcon ${chevronAnimating ? "chevronRotate" : ""}`}
                prefixIcon={hideMenu ? "chevronRight" : "chevronLeft"}
                onPointerDown={handleChevronPointerDown}
                onAnimationStart={() => setHideMenu(!hideMenu)}
                aria-label="Toggle menu"
              />
            </>
          )}
        </Row>
      </Row>
    </Row>
  );
};

export { HeaderDock };
