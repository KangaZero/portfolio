"use client";
import "./AchievementsWrapper.css";
import { useAchievements } from "@/components/AchievementsProvider";
import { gsap } from "gsap";
//NOTE: gsap/Flip is the actual path, though doesn't seem to be recognized by local machine
import { Flip } from "gsap/all";
import { AchievementCard } from "@/components/ui/achievement-card";
import {
  Grid,
  Flex,
  Row,
  Tag,
  StatusIndicator,
  ToggleButton,
} from "@once-ui-system/core";
import { useUserInfo } from "@/components/UserInfoProvider";
import SearchBar from "./SearchBar";
import { useState, useRef } from "react";
import type { PointerEvent } from "react";
import type { Achievement } from "@/types";
import { negativeAchievement } from "@/resources";

export default function AchievementsWrapper() {
  const { userInfo } = useUserInfo();
  const { achievements, achievementsCount } = useAchievements();
  const [statusIndicatorColor, setStatusIndicatorColor] = useState<
    | "blue"
    | "indigo"
    | "violet"
    | "magenta"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "moss"
    | "green"
    | "emerald"
    | "aqua"
    | "cyan"
    | "gray"
  >("aqua");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentSelectedFilters, setCurrentSelectedFilters] = useState<
    Achievement["rarity"][]
  >([]);
  const achievementsGridRef = useRef<HTMLDivElement>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  // Check if all achievements except "Speedophile" are unlocked.
  // // "Speedophile may have already been unlocked, so that check is also added"
  const isAllVisibleAchievementsUnlocked =
    achievements.filter(
      (achievement) =>
        achievement.isUnlocked && achievement.title !== "Speedophile",
    ).length === achievements.length;
  // If all visible achievements are unlocked, include the negative achievement with its title & description, as it will show as ???
  const achievementsToDisplay = isAllVisibleAchievementsUnlocked
    ? [...achievements, negativeAchievement]
    : ([
        ...achievements,
        {
          id: -99,
          title: "???",
          description: "??????",
          rarity: "mythic",
          isUnlocked: false,
        },
      ] as Achievement[]);
  const filteredAchievements = achievementsToDisplay.filter(
    (achievement) =>
      achievement.title
        .toLowerCase()
        .includes(currentSearchTerm.toLowerCase().trim()) &&
      (currentSelectedFilters.length === 0 ||
        currentSelectedFilters.includes(achievement.rarity)),
  );
  const searchResultDescription = filteredAchievements
    ? `${filteredAchievements.length} result(s) found.`
    : "No results found.";

  const removeFilter = (
    filter: Achievement["rarity"],
    e: PointerEvent<HTMLDivElement>,
  ) => {
    const element = e.currentTarget;

    gsap.to(element, {
      duration: 0.15,
      scale: 0,
      opacity: 0,
      ease: "power1.inOut",
      onComplete: () =>
        setCurrentSelectedFilters(
          currentSelectedFilters.filter((f) => f !== filter),
        ),
    });
  };

  const toggleColumns = () => {
    if (!achievementsGridRef.current) return;
    gsap.registerPlugin(Flip);
    const state = Flip.getState(achievementsGridRef.current.children);
    const currentColumns = getComputedStyle(
      achievementsGridRef.current,
    ).gridTemplateColumns;
    const columnCount = currentColumns.split(" ").length;
    const newColumnCount = columnCount === 3 ? 1 : columnCount + 1;
    achievementsGridRef.current.style.gridTemplateColumns = `repeat(${newColumnCount}, minmax(0, 1fr))`;
    setStatusIndicatorColor(
      columnCount === 1 ? "aqua" : columnCount === 2 ? "red" : "emerald",
    );
    Flip.from(state, {
      duration: 0.5,
      ease: "power1.inOut",
      stagger: 0.02,
    });
  };

  return (
    <Flex maxWidth="l" direction="column" gap="m" align="center">
      <Row s={{ hide: true }}>
        <ToggleButton variant="outline" onPointerDown={toggleColumns}>
          <Row vertical="center" gap="8">
            Toggle Cards
            <StatusIndicator color={statusIndicatorColor} size="s" />
          </Row>
        </ToggleButton>
      </Row>
      {userInfo?.localStorageEnabled && <></>}
      <Row s={{ style: { width: "100%" } }} m={{ style: { width: "80%" } }}>
        <SearchBar
          currentSearchTerm={currentSearchTerm}
          setCurrentSearchTerm={setCurrentSearchTerm}
          searchResultDescription={searchResultDescription}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          currentSelectedFilters={currentSelectedFilters}
          setCurrentSelectedFilters={setCurrentSelectedFilters}
          achievementsCount={achievementsCount}
        />
      </Row>
      {currentSelectedFilters.length > 0 && (
        <Row>
          {currentSelectedFilters.map((filter) => (
            <Tag
              tabIndex={0}
              onPointerDown={(e) => removeFilter(filter, e)}
              className="achievement-filter-tag"
              size="m"
              label={filter}
              key={filter}
              prefixIcon="close"
              suffixIcon="trophy"
            />
          ))}
        </Row>
      )}
      <Grid
        ref={achievementsGridRef}
        fillWidth
        fillHeight
        columns="3"
        gap="l"
        m={{ columns: "2" }}
        s={{ columns: "1" }}
      >
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </Grid>
    </Flex>
  );
}
