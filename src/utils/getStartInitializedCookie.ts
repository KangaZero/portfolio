export function getStartInitializedCookie() {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(/(?:^|; )START=([^;]*)/);
  //WARNING: The user can manually change the cookie, so to make sure no funny business happens this check is added
  return !!(match && match[1] === "1");
}
