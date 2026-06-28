import type { zones } from "tzdata";
import type { WMOCodeDescriptions } from "@/resources";
import type { IconName } from "@/resources/icons";

/**
 * IANA time zone string (e.g., 'Asia/Calcutta', 'Europe/Vienna').
 * See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export type IANATimeZone = Extract<keyof typeof zones, string>; // Narrow to string keys for React usage

export type UserSettings = {
  isEffectsEnabled: boolean;
};

/**
 * Represents a person featured in the portfolio.
 */
export type Person = {
  /** First name of the person */
  firstName: string;
  /** Last name of the person */
  lastName: string;
  /** The name you want to display, allows variations like nicknames */
  name: string;
  /** Company name */
  workplace: string;
  /** Ruby name of the person */
  rubyName: {
    romaji: string;
    furigana: string;
    kanji: string;
  }[];
  /** Role or job title */
  role: string;
  /** Path to avatar image */
  avatar: string;
  /** Email address */
  email: `${string}@${string}.${"com" | "net" | "org" | "edu"}`;
  /** GitHub username */
  githubUsername: string;
  /** IANA time zone location */
  location: IANATimeZone;
  /** Geographic coordinates for the location */
  locationCoordinates: [number, number]; // [latitude, longitude]
  /** Languages spoken */
  languages: string[];
  /** Languages learning or limited proficiency */
  learningLanguages: {
    language: string;
    description: string;
  }[];
  /** Technologies you dabble with */
  technologies: {
    name: string;
    icon: IconName;
    category: "hobby" | "professional";
  }[];
  /** Current thing I am probably doing */
  currentStatus: "sleeping" | "coding" | "running" | "gaming" | "relaxing";
};

/**
 * Newsletter Section
 * @description The below information will be displayed on the Home page in Newsletter block
 */
export type Newsletter = {
  /** Whether to display the newsletter section */
  display: boolean;
  /** Title of the newsletter   */
  title: React.ReactNode;
  /** Description of the newsletter */
  description: React.ReactNode;
};

/**
 * Social link configuration.
 */
export type Social = Array<{
  /** Name of the social platform */
  name: "GitHub" | "LinkedIn" | "Instagram" | "Threads" | "Email";
  /** Icon for the social platform
   * The icons are a part of "src/resources/icons.ts" file.
   * If you need a different icon, import it there and reference it everywhere else
   */
  icon: IconName;
  /**
   * The link to the social platform
   *
   * The link is not validated by code, make sure it's correct
   */
  link: string;
  /** Whether this social link is essential and should be displayed on the about page */
  essential?: boolean;
}>;

/**
 * Skills configuration.
 */
export type Skills = Array<{
  /** Name of the skill/technology */
  name:
    | "Typescript"
    | "Javascript"
    | "React"
    | "Rust"
    | "Golang"
    | "NixOS"
    | "Bash"
    | "Git"
    | "Vue";
  /** Icon for the social platform
   * The icons are a part of "src/resources/icons.ts" file.
   * If you need a different icon, import it there and reference it everywhere else
   */
  color: string;
  icon: IconName;
  level: "pro" | "hobby";
  /** Whether this social link is essential and should be displayed on the about page */
  essential?: boolean;
}>;

/**
 * Base interface for page configuration with common properties.
 */
export interface BasePageConfig {
  /** Path to the page
   *
   * The path should be relative to the public directory
   */
  path: `/${string}` | string;
  /** Label for navigation or display */
  label: string;
  /** Title of the page */
  title: string;
  /** Description for SEO and metadata */
  description: string;
  /** OG Image should be put inside `public/images` folder */
  image?: `/images/${string}` | string;
}

/**
 * Home page configuration.
 */
export interface Home extends BasePageConfig {
  /** The image to be displayed in metadata
   *
   * The image needs to be put inside `/public/images/` directory
   */
  image: `/images/${string}` | string;
  /** The headline of the home page */
  headline: (text1: string, text2: string, text3: string, text4: string) => React.ReactNode;
  /** Featured badge, which appears above the headline */
  featured: {
    display: boolean;
    title: React.ReactNode;
    href: string;
  };
  /** The sub text which appears below the headline */
  subline: (text1?: string, rotate?: boolean) => React.ReactNode;
}

/**
 * About page configuration.
 * @description Configuration for the About page, including sections for table of contents, avatar, calendar, introduction, work experience, studies, and technical skills.
 */
export interface About extends BasePageConfig {
  /** Table of contents configuration */
  tableOfContent: {
    /** Whether to display the table of contents */
    display: boolean;
    /** Whether to show sub-items in the table of contents */
    subItems: boolean;
  };
  /** Avatar section configuration */
  avatar: {
    /** Whether to display the avatar */
    display: boolean;
  };
  /** Calendar section configuration */
  calendar: {
    /** Whether to display the calendar */
    display: boolean;
    /** Link to the calendar */
    link: string;
  };
  /** Introduction section */
  intro: {
    /** Whether to display the introduction */
    display: boolean;
    /** Title of the introduction section */
    title: string;
    /** Description of the introduction section */
    description: React.ReactNode;
  };
  /** Work experience section */
  work: {
    /** Whether to display work experience */
    display: boolean;
    /** Title for the work experience section */
    title: string;
    /** List of work experiences */
    experiences: Array<{
      /** Company name */
      company: string;
      /** Timeframe of employment */
      timeframe: string;
      /** Role or job title */
      role: string;
      /** Achievements at the company */
      achievements: React.ReactNode[];
      /** Images related to the experience */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
  /** Studies/education section */
  studies: {
    /** Whether to display studies section */
    display: boolean;
    /** Title for the studies section */
    title: string;
    /** List of institutions attended */
    institutions: Array<{
      /** Institution name */
      name: string;
      /** Description of studies */
      description: React.ReactNode;
      /** Logo path (SVG) */
      logoWordmark: `${string}.svg`;
      /**Official title of degree */
      title: string;
    }>;
    images?: Array<{
      /** Image source path */
      src: string;
      /** Image alt text */
      alt: string;
      /** Image width ratio */
      width: number;
      /** Image height ratio */
      height: number;
    }>;
  };
  /** Technical skills section */
  technical: {
    /** Whether to display technical skills section */
    display: boolean;
    /** Title for the technical skills section */
    title: string;
    /** List of technical skills */
    skills: Array<{
      /** Skill title */
      title: string;
      /** Skill description */
      description?: React.ReactNode;
      /** Skill tags */
      tags?: Array<{
        name: string;
        icon?: string;
      }>;
      /** Images related to the skill */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
}

/**
 * Blog page configuration.
 * @description Configuration for the Blog page, including metadata and navigation label.
 */
export interface Blog extends BasePageConfig {
  custom?: unknown;
}

/**
 * Work/projects page configuration.
 * @description Configuration for the Work/Projects page, including metadata and navigation label.
 */
export interface Work extends BasePageConfig {
  custom?: unknown;
}

/**
 * Achievements page configuration.
 * @description Configuration for the Work/Projects page, including metadata and navigation label.
 */
export interface AchievementPage extends BasePageConfig {
  custom?: unknown;
}
/**
 * Gallery page configuration.
 * @description Configuration for the Gallery page, including metadata, navigation label, and image list.
 */
export interface Gallery extends BasePageConfig {
  /** List of images in the gallery */
  images: Array<{
    /** Image source path */
    src: string;
    /** Image alt text */
    alt: string;
    /** Image orientation (horizontal/vertical) */
    orientation: string;
  }>;
}

export type AchievementTitle =
  | "New Beginnings"
  | "Eos"
  | "Fashion Police"
  | "Snoopy Detective"
  | "Social Stalker"
  | "Test"
  | "Out of Bounds"
  | "Woah! Hacker"
  | "Sand Mandala"
  | "Go Touch Grass"
  | "Puzzle Master"
  | "Night Owl"
  | "Speedophile";

export type Achievement<TAchievementTitle extends AchievementTitle = AchievementTitle> =
  | {
      id: number;
      title: AchievementTitle;
      image?: {
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      };
      description: string;
      rarity: "common" | "uncommon" | "rare" | "legendary" | "mythic";
      split?: TAchievementTitle extends "Speedophile" ? number : never;
      isUnlocked: true;
      unlockedAt: Date;
      noOfAchievementsRequiredToUnlock?: number;
    }
  | {
      id: number;
      title: AchievementTitle;
      image?: {
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      };
      description: string;
      rarity: "common" | "uncommon" | "rare" | "legendary" | "mythic";
      isUnlocked: false;
      noOfAchievementsRequiredToUnlock?: number;
    };

export type TerminalCommandType = {
  exit: (
    window: Window & typeof globalThis,
    inputAreaElement: HTMLElement,
    argument: string | "-y",
  ) => void;
  start: (setIsStartInitializedStateAndCookie: (state: boolean) => void) => void;
  help: (inputAreaElement: HTMLElement) => void;
  history: (
    inpuAreaElement: HTMLElement,
    allUserCommands: (string | TerminalCommandTypeKeyType)[],
    argument: string | `${number}`,
  ) => void;
  fastfetch: (inputAreaElement: HTMLElement) => void;
  echo: (argument: string, inputAreaElement: HTMLElement) => void;
  ls: (pathName: string, inputAreaElement: HTMLElement) => void;
  clear: (elementsToRemove: Element[], inputAreaElement: HTMLElement) => void;
  y: (
    previousMessage: TerminalCommandTypeKeyType | string,
    inputAreaElement: HTMLElement,
    window: Window & typeof globalThis,
  ) => void;
  n: (previousMessage: TerminalCommandTypeKeyType | string, inputAreaElement: HTMLElement) => void;
};

export type TerminalCommandTypeKeyType = keyof TerminalCommandType;

export interface Achievements extends BasePageConfig {
  achievements: Array<Achievement>;
}

export type WMOCodeDescriptionsType = typeof WMOCodeDescriptions;
export type WMOCodes = keyof typeof WMOCodeDescriptions;
