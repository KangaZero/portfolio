# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All tasks are wrapped in `justfile`. Prefer `just <cmd>` over raw `pnpm` equivalents.

```sh
just dev          # dev server at http://localhost:6721 (Turbopack)
just build        # production build
just format       # auto-format + safe lint fixes (Biome, writes in place)
just lint         # lint + format check, no writes
just typecheck    # tsc --noEmit
just check        # format + lint + typecheck + build (full CI gate)
just clean        # remove node_modules, .next, out/
```

No test suite exists. `just check` is the verification step.

## Environment

- **Node 26 + pnpm 11** required. Use `direnv allow` inside the repo to activate the Nix dev shell which pins both versions and installs git hooks.
- Dev server port: **6721**
- `.env.local` is optional. Only one variable is used:
  - `PAGE_ACCESS_PASSWORD` — password for routes listed in `protectedRoutes` in `once-ui.config.ts`

## Pre-commit hooks (nix-managed)

Installed by the Nix dev shell. On every commit: **Biome** (format + lint, staged files) → **tsc** → **next build**. All three must pass. Run `just pre-commit` to execute the same sequence manually.

## Path alias

`@/*` resolves to `src/*` (TypeScript + bundler).

## Architecture

### Content & config — two files govern everything

**`src/resources/content.tsx`** is the single source of truth for all portfolio content:
- `person` — name, role, location, timezone, languages, technologies
- `home`, `about`, `work`, `blog`, `gallery`, `achievements` — page config objects
- `achievementsList` — all achievement definitions (id, title, description, rarity, unlock conditions)
- `terminalCommand` — terminal command handlers as plain functions
- `skillslist`, `social` — arrays consumed by multiple pages
- `useI18nIndicator` — sentinel string `"USE I18N!"` marking values that should be replaced via i18n (consumed by `useLocaleContentOrDefaultContent` in `LocaleProvider`)

**`src/resources/once-ui.config.ts`** controls UI behaviour:
- `routes` — `{ "/about": true, "/blog": false, ... }` enables/disables pages at runtime
- `protectedRoutes` — routes gated by `PAGE_ACCESS_PASSWORD`
- `display` — boolean flags: `location`, `time`, `status`, `trophies`, `themeSwitcher`, `localeSwitcher`, `menuAccordion`
- `style`, `effects`, `fonts`, `dataStyle` — design tokens passed to providers

### Icon system

Icons live in `src/resources/icons.ts` as `iconLibrary: Record<string, IconType>`. `Providers.tsx` passes this to Once UI's `<IconProvider>`, making `<Icon name="..." />` work globally. To add an icon: import from `react-icons/*`, add a key to `iconLibrary`, then use `<Icon name="yourKey" />`. The `IconName` type is `keyof typeof iconLibrary` — TypeScript will catch invalid names.

### i18n

- **Client components**: `const { translate, locale, useLocaleContentOrDefaultContent } = useLocale()` from `LocaleProvider`
- **Server components**: `import { t } from "@/lib/i18n"` then `t("key", lang)` with explicit locale from `params`
- Translation keys use dot-notation: `translate("person.role")` — `TranslationKey` is fully inferred so typos are caught at compile time
- Locale is stored in the `NEXT_LOCALE` cookie; the middleware in `src/proxy.ts` enforces `/[lang]/` prefix in URLs

### API routes — non-standard location

Routes live in `src/api/*/route.ts`, **not** `src/app/api/`. The Next.js middleware in `src/proxy.ts` rewrites `/api/*` requests to these handlers. Do not create new API routes under `src/app/api/`.

### MDX content

`getPosts(pathSegments: string[])` in `src/utils/utils.ts` reads `.mdx` files from a given directory, parses YAML frontmatter with gray-matter, and returns `{ metadata, slug, content }[]`. Blog posts live in `src/app/[lang]/blog/posts/`, work projects in `src/app/[lang]/work/projects/`. Supported frontmatter keys: `title`, `subtitle`, `publishedAt`, `summary`, `image`, `images`, `tag`, `team`, `link`.

### Achievements

`unlockAchievement(title, splitTime?)` from `useAchievements()` — checks `isUnlocked`, updates state, auto-persists to `localStorage["achievements"]`. Achievements are defined entirely in `content.tsx`. A browser console API is registered by `ConsoleCommandProvider` as `window.portfolio` (`help()`, `unlock(title)`, `reset()`, etc.).

### Once UI responsive props

Once UI components accept breakpoint override objects:

```tsx
<Flex s={{ hide: true }} m={{ columns: "2" }} />
// s = small (mobile), m = medium (tablet), l = large, xl = extra-large
```

### Hydration

- Theme is initialized before hydration via `<Script strategy="beforeInteractive">` in `layout.tsx`, reading from `localStorage` and system preference.
- `suppressHydrationWarning` is applied to the root `<html>` element and a few components where server/client state legitimately differs (theme attribute, locale).
- `LayoutBackgroundMaple` is a `"use cache"` server component — do not introduce `Math.random()` or other non-deterministic calls inside it.
