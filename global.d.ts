import type { Console } from "@/types/console.types";

declare global {
  interface Window {
    portfolio: Console;
    __portfolioConsoleWelcomeLogged: boolean;
  }
}
