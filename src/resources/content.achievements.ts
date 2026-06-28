import type { Achievement } from "@/types";

const LOCAL_STORAGE_KEY = "achievements";

const achievementsList: Array<Achievement> = [
  {
    id: 1,
    title: "New Beginnings",
    description: "Entered the page for the first time",
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: 2,
    title: "Eos",
    description: "Changed the theme of the page",
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: 3,
    title: "Fashion Police",
    description: "Changed the style overlay of the page",
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: 4,
    title: "Snoopy Detective",
    description: "Found the creator's workplace",
    rarity: "uncommon",
    isUnlocked: false,
  },
  {
    id: 5,
    title: "Social Stalker",
    description: "Looked at all of the creator's socials",
    rarity: "uncommon",
    isUnlocked: false,
  },
  {
    id: 6,
    title: "Test",
    description: "Test achievement for development purposes",
    rarity: "uncommon",
    isUnlocked: false,
  },
  {
    id: 7,
    title: "Puzzle Master",
    description: "Solved the most difficult puzzle ever created",
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: 8,
    title: "Out of Bounds",
    description: "Went to the backdoors",
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: 19,
    title: "Sand Mandala",
    description: "Reset achievements under mysterious conditions",
    noOfAchievementsRequiredToUnlock: 99, // Note: Not the actual number, see below for its reassignment
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: 21,
    title: "Go Touch Grass",
    description: "Unlocked all achievements",
    rarity: "legendary",
    isUnlocked: false,
  },
];

const negativeAchievement: Achievement = {
  //NOTE: This is a negative achievement, a secret one not counted in 100% completion
  id: -1,
  title: "Speedophile",
  description: "Unlocked all achievements in less than 67 seconds",
  rarity: "mythic",
  isUnlocked: false,
};

//NOTE: Have to reassign noOfAchievementsRequiredToUnlock for Sand Mandala, as "achievementList" cannot be called in itself

const sandMandalaIndex = achievementsList.findIndex(
  (achievement) => achievement.title === "Sand Mandala",
);
if (sandMandalaIndex !== -1) {
  achievementsList[sandMandalaIndex].noOfAchievementsRequiredToUnlock = achievementsList.length - 6;
} else {
  achievementsList.push({
    id: 19,
    title: "Sand Mandala",
    description: "Reset achievements under mysterious conditions",
    noOfAchievementsRequiredToUnlock: achievementsList.length - 6, // Total achievements minus the 5 left to unlock and itself
    rarity: "rare",
    isUnlocked: false,
  });
}

const achievementTrophyMapping = {
  common: "🏆",
  uncommon: "🎖️",
  rare: "🥇",
  legendary: "🌟",
  mythic: "💎",
} as const;

export { achievementsList, achievementTrophyMapping, LOCAL_STORAGE_KEY, negativeAchievement };
