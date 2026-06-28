import type { IANATimeZone, Person } from "@/types";

//TODO refactor to Temporal API when widely available
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal

/**
 * Returns the current status of a person based on their timezone and the current time.
 *
 * The status is determined by the hour of the day in the specified IANA timezone:
 * - 0:00–8:59: "sleeping"
 * - 9:00–16:59: "coding" on weekdays, "relaxing" on weekends
 * - 17:00–18:59: "running"
 * - 19:00–23:59: "gaming"
 *
 * If a locale is provided and set to "ja", the status is returned as a Japanese string (in Katakana or Kanji).
 * Otherwise, the status is returned as an English status key.
 *
 * @param location - The IANA timezone string (e.g., "Asia/Tokyo") to determine the local time.
 * @param locale - (Optional) The locale code ("en" or "ja"). If "ja", returns the status in Japanese.
 * @returns The person's current status as a string: either a status key ("sleeping", "coding", etc.) or its Japanese translation.
 *
 * @example
 * getPersonsCurrentStatus("Asia/Tokyo", "en"); // "coding"
 * getPersonsCurrentStatus("Asia/Tokyo", "ja"); // "コーディング中"
 */
const getPersonsCurrentStatus = (location: IANATimeZone, locale?: "en" | "ja") => {
  const date = new Date();
  const currentTimeInUTC9 = new Date(
    date.toLocaleString("en-US", { timeZone: location || "Asia/Tokyo" }),
  );
  const currentHour = currentTimeInUTC9.getHours();
  const currentDayInNumber = currentTimeInUTC9.getDay();
  const daysMapped = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  } as const;
  const currentDay = daysMapped[currentDayInNumber as keyof typeof daysMapped];

  let status: Person["currentStatus"];

  switch (currentHour) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      status = "sleeping";
      break;
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
      if (currentDay === "Saturday" || currentDay === "Sunday") {
        status = "relaxing";
      } else {
        status = "coding";
      }
      break;
    case 17:
    case 18:
      status = "running";
      break;
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
      status = "gaming";
      break;
    default:
      status = "sleeping";
  }

  //NOTE Currently only supports En and Ja
  const mappedLocaleStatus = {
    running: "ランニング中",
    coding: "コーディング中",
    gaming: "ゲーミング中",
    relaxing: "休息中",
    sleeping: "睡眠中",
  } as const;
  return locale === "ja" ? mappedLocaleStatus[status] : status;
};

export { getPersonsCurrentStatus };
