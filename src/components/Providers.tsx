"use client";

import {
  DataThemeProvider,
  IconProvider,
  LayoutProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { dataStyle, style } from "../resources";
import { iconLibrary } from "../resources/icons";
import { AchievementsProvider } from "./AchievementsProvider";
import { ConsoleCommandProvider } from "./ConsoleCommandProvider";
import { LocaleProvider } from "./LocaleProvider";
import { UserInfoProvider } from "./UserInfoProvider";
export function Providers({ children, lang }: { children: React.ReactNode; lang: string }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>
        <ThemeProvider
          brand={style.brand}
          accent={style.accent}
          neutral={style.neutral}
          solid={style.solid}
          solidStyle={style.solidStyle}
          border={style.border}
          surface={style.surface}
          transition={style.transition}
          scaling={style.scaling}
        >
          <DataThemeProvider
            variant={dataStyle.variant}
            mode={dataStyle.mode}
            height={dataStyle.height}
            axis={{
              stroke: dataStyle.axis.stroke,
            }}
            tick={{
              fill: dataStyle.tick.fill,
              fontSize: dataStyle.tick.fontSize,
              line: dataStyle.tick.line,
            }}
          >
            <UserInfoProvider>
              <ToastProvider>
                <LocaleProvider lang={lang}>
                  <AchievementsProvider>
                    <ConsoleCommandProvider>
                      <IconProvider icons={iconLibrary}>{children}</IconProvider>
                    </ConsoleCommandProvider>
                  </AchievementsProvider>
                </LocaleProvider>
              </ToastProvider>
            </UserInfoProvider>
          </DataThemeProvider>
        </ThemeProvider>
      </LayoutProvider>
    </QueryClientProvider>
  );
}
