export function getLocaleCookieFromClient() {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  // WARNING: The user can manually change the cookie, so validate the value
  return match && (match[1] === "ja" || match[1] === "en") ? (match[1] as "ja" | "en") : undefined;
}

export function setLocaleCookie(locale: "en" | "ja") {
  if (typeof document === "undefined") return;
  if (locale !== "en" && locale !== "ja") return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
}

export function getStartInitializedCookie() {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(?:^|; )START=([^;]*)/);
  // WARNING: The user can manually change the cookie, so validate the value
  return !!(match && match[1] === "1");
}

/**
 * Gets the visit count from the VISIT_COUNT cookie on the client side.
 * Returns undefined if the cookie is not set, not a number, or is invalid.
 */
export function getVisitCountCookieFromClient() {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(?:^|; )VISIT_COUNT=([^;]*)/);
  // WARNING: The user can manually change the cookie, so validate the value
  if (!match) return undefined;
  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Sets a cookie to track the number of visits.
 * If visits is provided, sets the cookie to that value, otherwise sets it to 1.
 */
export function setVisitCountCookie(visits?: number) {
  if (typeof document === "undefined") return;
  document.cookie = `VISIT_COUNT=${visits ?? 1}; path=/; max-age=31536000`; // 1 year
}
