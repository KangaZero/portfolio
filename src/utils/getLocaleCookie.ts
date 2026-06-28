// import { IncomingMessage } from "http";

// export function getLocaleCookieFromServer(req: IncomingMessage) {
//   const cookie = req.headers.cookie || "";
//   const match = cookie.match(/NEXT_LOCALE=([^;]+)/);
//   return match ? (match[1] as "ja" | "en") : undefined;
// }

export function getLocaleCookieFromClient() {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  //WARNING: The user can manually change the cookie, so to make sure no funny business happens this check is added
  return match && (match[1] === "ja" || match[1] === "en") ? (match[1] as "ja" | "en") : undefined;
}
