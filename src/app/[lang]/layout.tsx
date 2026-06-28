import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
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
import { Footer, Header, Providers, RouteGuard } from "@/components";
import RippleGrid from "@/components/RippleGrid";
import { AchievementToast } from "@/components/ui/achievement-toast";
import { baseURL, dataStyle, effects, fonts, home, style } from "@/resources";
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

export default async function RootLayout({ params, children }: LayoutProps<"/[lang]">) {
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
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'system';

                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};

                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });

                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };

                  // Apply saved theme
                  const savedTheme = localStorage.getItem('data-theme');
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);

                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers lang={(await params).lang}>
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
      </Providers>
    </Flex>
  );
}
