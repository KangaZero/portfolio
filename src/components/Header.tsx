"use client";

import { Avatar, Column, Fade, Flex, HoverCard, Row, Text, useTheme } from "@once-ui-system/core";
import { gsap } from "gsap";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type React from "react";
import { useEffect, useRef } from "react";
import { useAchievements } from "@/components/AchievementsProvider";
import { HeaderDock } from "@/components/HeaderDock";
// import { CustomHeadingNav } from "./CustomHeadingNav";
import { useLocale } from "@/components/LocaleProvider";
import { HeaderDate } from "@/components/ui/header-date";
import {
  // biome-ignore lint/suspicious/noShadowRestrictedNames: "Map" is the Leaflet map wrapper component's public name
  Map,
  MapCircle,
  MapLocateControl,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { TimeDisplay } from "@/components/ui/time-display";
import { display, headerHoverCardDetails, person } from "@/resources";
import styles from "./Header.module.scss";
import TrophiesDisplay from "./ui/trophies-display";

export const Header = () => {
  const { translate, locale } = useLocale();
  const {
    // achievements: achievementsFromProvider,
    unlockAchievement,
    achievementsCount,
  } = useAchievements();
  const hoverCardDescriptionRef = useRef<HTMLSpanElement>(null);
  const { theme } = useTheme();

  // TODO might not be needed if system theme settings component is removed
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    const lightThemeBtnElement = document.querySelector('[aria-label="Light theme"]');
    const darkThemeBtnElement = document.querySelector('[aria-label="Dark theme"]');
    const systemThemeBtnElement = document.querySelector('[aria-label="System theme"]');

    const toUnlockOrNotEosAchievement = (mode: "light" | "dark" | "system") => {
      const documentTheme = document.documentElement.getAttribute("data-theme");
      if (theme === mode) return;
      if (mode !== documentTheme) unlockAchievement("Eos");
    };

    lightThemeBtnElement?.addEventListener("pointerdown", () =>
      toUnlockOrNotEosAchievement("light"),
    );
    darkThemeBtnElement?.addEventListener("pointerdown", () => toUnlockOrNotEosAchievement("dark"));
    systemThemeBtnElement?.addEventListener("pointerdown", () =>
      toUnlockOrNotEosAchievement("system"),
    );
    //Clean up event listeners on unmount
    return () => {
      lightThemeBtnElement?.removeEventListener("pointerdown", () =>
        toUnlockOrNotEosAchievement("light"),
      );
      darkThemeBtnElement?.removeEventListener("pointerdown", () =>
        toUnlockOrNotEosAchievement("dark"),
      );
      systemThemeBtnElement?.removeEventListener("pointerdown", () =>
        toUnlockOrNotEosAchievement("system"),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (!hoverCardDescriptionRef.current || !locale) return;
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
    let killed = false;
    function cycleText(
      ref: React.RefObject<HTMLDivElement>,
      texts: string[],
      duration = 1,
      delay = 8,
    ) {
      const animate = (index = 0) => {
        if (killed) return;
        gsap.to(ref.current, {
          scrambleText: {
            text: translate(`headerHoverCardDetails.${index}` as "headerHoverCardDetails.0"),
            chars: translate(
              `headerHoverCardDetails.${(index + 1) % texts.length}` as "headerHoverCardDetails.0",
            ),
            revealDelay: 0.2,
            speed: 1,
            newClass: "",
          },
          duration,
          delay,
          onComplete: () => {
            animate((index + 1) % texts.length);
          },
        });
      };
      animate();
    }
    cycleText(hoverCardDescriptionRef as React.RefObject<HTMLDivElement>, headerHoverCardDetails);
    return () => {
      killed = true;
    };
  }, [locale]);

  return (
    <>
      <Fade s={{ hide: true }} fillWidth position="fixed" height="80" zIndex={9} />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />
      <Row
        fitHeight
        className={styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{
          position: "fixed",
        }}
      >
        <Row paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
          {display.location && (
            <Row s={{ hide: true }}>
              <HoverCard tabIndex={0} placement="bottom" trigger={<HeaderDate />}>
                <Column
                  padding="20"
                  gap="20"
                  radius="l"
                  minHeight={25}
                  minWidth={25}
                  maxWidth={100}
                  background="page"
                  border="neutral-alpha-weak"
                >
                  <Row gap="20" fillWidth vertical="center">
                    <Avatar
                      size={3}
                      src="/trademarks/accenture-logo.svg"
                      aria-description="Accenture logo"
                    />
                    <Column gap="4">
                      <Text variant="heading-strong-m">Accenture Japan</Text>
                      <Text
                        variant="body-default-s"
                        onBackground="neutral-weak"
                        onClick={() => {
                          unlockAchievement("Test");
                        }}
                      >
                        Software Engineer
                      </Text>
                    </Column>
                  </Row>

                  <Map
                    className="border-4 rounded-sm"
                    zoom={12}
                    center={person.locationCoordinates}
                    style={{ height: "200px", width: "100%" }}
                  >
                    <MapZoomControl className="z-20 top-auto right-1 bottom-1 left-auto" />
                    <MapLocateControl className="z-20 top-1" />
                    <MapTileLayer
                      zIndex={1}
                      darkUrl="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}"
                    />
                    <MapCircle center={person.locationCoordinates} radius={200} />
                    <MapMarker
                      key={person.location.split("/")[1]}
                      position={person.locationCoordinates}
                      icon={<span className="text-sm">🦑</span>}
                    >
                      <MapPopup>Hey this is where I work at!</MapPopup>
                    </MapMarker>
                  </Map>
                </Column>
              </HoverCard>
            </Row>
          )}
          {/* {display.location && <Row s={{ hide: true }}>{person.location}</Row>} */}
          <Flex paddingLeft="24" vertical="center" s={{ hide: true }} m={{ hide: true }}>
            {display.trophies && <TrophiesDisplay achievementsCount={achievementsCount} />}
          </Flex>
        </Row>

        <HeaderDock />
        <Flex fillWidth horizontal="end" vertical="center">
          {display.time && (
            <Flex
              s={{ hide: true }}
              paddingRight="12"
              paddingLeft="24"
              horizontal="end"
              vertical="center"
              textVariant="body-default-s"
              gap="20"
            >
              <TimeDisplay timeZone={person.location} />
            </Flex>
          )}
          {display.status && (
            <Flex
              s={{ hide: true }}
              paddingRight="12"
              paddingLeft="24"
              horizontal="end"
              vertical="center"
              textVariant="body-default-s"
              gap="20"
              minWidth={15}
            >
              <span className={styles.hoverCardDescription} ref={hoverCardDescriptionRef}></span>
            </Flex>
          )}
        </Flex>
        {/*TODO FIx the styling and positioning*/}
        {/*<CustomHeadingNav />*/}
      </Row>
    </>
  );
};
