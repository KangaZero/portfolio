import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/styles/index.css";
import "@/app/[lang]/globals.css";
import {
  Background,
  Column,
  Flex,
  Meta,
  type opacity,
  RevealFx,
  type SpacingToken,
} from "@once-ui-system/core";
import classNames from "classnames";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Footer, Header, Providers, RouteGuard } from "@/components";
import RippleGrid from "@/components/RippleGrid";
import { AchievementToast } from "@/components/ui/achievement-toast";
import { baseURL, effects, fonts, home } from "@/resources";
import { LayoutBackgroundMaple } from "./layoutBackgroundMaple";

export async function generateMetadata(): Promise<Metadata> {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ja" }];
}

// Reads cookies() inside Suspense per https://nextjs.org/docs/messages/blocking-route
async function AppProviders({ children, lang }: { children: React.ReactNode; lang: string }) {
  const cookieStore = await cookies();
  const isStartInitialized = cookieStore.get("START")?.value === "1";
  return (
    <Providers lang={lang} isStartInitialized={isStartInitialized}>
      {children}
    </Providers>
  );
}

export default async function RootLayout({ params, children }: LayoutProps<"/[lang]">) {
  // await params is safe without Suspense when generateStaticParams provides all values
  const lang = (await params).lang as "ja" | "en";
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang={lang}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
        fonts.headingJA.variable,
      )}
    >
      <Suspense fallback={null}>
        <AppProviders lang={lang}>
          <Column
            as="body"
            background="page"
            fillWidth
            style={{ minHeight: "100dvh" }}
            margin="0"
            padding="0"
            horizontal="center"
          >
            <LayoutBackgroundMaple />
            <RevealFx fill position="absolute">
              <RippleGrid
                enableRainbow
                gridColor="#4f37ae"
                rippleIntensity={0.01}
                gridSize={17}
                gridThickness={8}
                fadeDistance={1.5}
                vignetteStrength={1}
                glowIntensity={0.1}
                opacity={0.3}
                gridRotation={55}
                mouseInteraction
                mouseInteractionRadius={0.4}
              />
              <Background
                zIndex={0}
                mask={{
                  x: effects.mask.x,
                  y: effects.mask.y,
                  radius: effects.mask.radius,
                  cursor: effects.mask.cursor,
                }}
                gradient={{
                  display: effects.gradient.display,
                  opacity: effects.gradient.opacity as opacity,
                  x: effects.gradient.x,
                  y: effects.gradient.y,
                  width: effects.gradient.width,
                  height: effects.gradient.height,
                  tilt: effects.gradient.tilt,
                  colorStart: effects.gradient.colorStart,
                  colorEnd: effects.gradient.colorEnd,
                }}
                dots={{
                  display: effects.dots.display,
                  opacity: effects.dots.opacity as opacity,
                  size: effects.dots.size as SpacingToken,
                  color: effects.dots.color,
                }}
                grid={{
                  display: effects.grid.display,
                  opacity: effects.grid.opacity as opacity,
                  color: effects.grid.color,
                  width: effects.grid.width,
                  height: effects.grid.height,
                }}
                lines={{
                  display: effects.lines.display,
                  opacity: effects.lines.opacity as opacity,
                  size: effects.lines.size as SpacingToken,
                  thickness: effects.lines.thickness,
                  angle: effects.lines.angle,
                  color: effects.lines.color,
                }}
              />
            </RevealFx>
            <Flex fillWidth minHeight="16" s={{ hide: true }} />
            <RouteGuard>
              <Header />
              <AchievementToast position="top-right" />
              <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
                <Flex horizontal="center" fillWidth minHeight="0">
                  {children}
                </Flex>
              </Flex>
            </RouteGuard>
            <Footer />
          </Column>
        </AppProviders>
      </Suspense>
    </Flex>
  );
}
