# KangaZero Portfolio

A feature-rich, interactive portfolio built on [Next.js](https://nextjs.org). Goes well beyond a standard portfolio — interactive terminal, gamified achievements, live user context, WebGL backgrounds, and a drawing canvas, all served in English and Japanese.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 · SASS · CSS modules |
| Animations | GSAP 3 (ScrollTrigger, Flip) · Motion · OGL (WebGL) |
| Content | MDX · gray-matter |
| Maps | Leaflet · React Leaflet |
| Drag & drop | dnd-kit |
| Data fetching | TanStack React Query 5 |
| UI primitives | Radix UI · lucide-react |
| Icons | react-icons 5 |
| Lint / format | Biome 2 |
| Package manager | pnpm 11 |
| Runtime | Node.js 24 |

---

## Project Structure

```
src/
├── app/
│   └── [lang]/               # Dynamic locale routing (en · ja)
│       ├── page.tsx           # Home — MagicBento grid
│       ├── about/             # CV / About
│       ├── work/              # Work index + [slug] MDX pages
│       ├── blog/              # Blog index + [slug] MDX pages
│       ├── gallery/           # Image gallery
│       └── achievements/      # Achievement / trophy system
├── api/
│   ├── authenticate/          # Password-protected route auth
│   ├── check-auth/
│   ├── og/                    # Dynamic OG image generation + proxy
│   ├── queries/               # React Query server endpoints
│   └── rss/                   # RSS feed
├── components/
│   ├── MagicBento.tsx         # Draggable animated bento grid
│   ├── RippleGrid.tsx         # WebGL ripple grid background
│   ├── DrawingPanel.tsx       # Interactive drawing canvas
│   ├── StartTerminal.tsx      # Terminal emulator
│   ├── AchievementsProvider.tsx
│   ├── UserInfoProvider.tsx   # Client device / fingerprint context
│   ├── Header.tsx             # Map · live time · trophy count
│   ├── ui/                    # Primitive UI components
│   └── home/ about/ blog/ work/ gallery/
├── lib/
│   └── i18n/                  # Type-safe translations (en · ja)
├── resources/
│   ├── content.tsx            # Person, pages, social, terminal, bento config
│   ├── content.achievements.ts# Achievement definitions and trophy mapping
│   ├── content.weather.ts     # WMO weather code descriptions
│   ├── once-ui.config.ts      # Routes, theme, fonts
│   └── icons.ts               # Custom icon library
├── types/                     # Shared TypeScript types
└── utils/                     # Helpers, cookies, user tracking, animations
```

---

## Features

### MagicBento
Draggable bento grid on the home page with spotlight effects, particle animations, tilt, and magnetism. Built with dnd-kit and GSAP.

### Interactive Terminal
Fully interactive terminal emulator with commands: `help`, `clear`, `echo`, `fastfetch`, `history`, `start`, `exit`, `ls`. Displays live device info (OS icon, battery, Bluetooth) in the status bar.

### Drawing Panel
Canvas-based drawing tool supporting free-draw lines, rectangles, circles, text, and image insertion with colour and line-width controls.

### WebGL Ripple Grid
OGL-powered animated grid background that reacts to mouse movement.

### Achievements System
Gamified unlock system with five rarity tiers — common, uncommon, rare, legendary, mythic. Achievements persist in localStorage and surface via toast notifications.

### User Context & Fingerprinting
`UserInfoProvider` collects device platform, battery status, Bluetooth support, and timezone. `getUserFingerprint` gathers browser/OS/canvas/WebGL identifiers. `getUserBehavior` tracks scroll depth, click patterns, and time spent.

### Header with Map
The header shows an interactive Leaflet map centred on the developer's location. A locate control lets visitors jump to their own position. The clock shows time in the developer's timezone.

### Internationalisation
URL-based locale (`/en/…` · `/ja/…`). Type-safe translation with dot-notation keys and English fallback. Locale persisted in a cookie. Static generation for both locales via `generateStaticParams`.

### SEO & RSS
Dynamic Open Graph image generation (`/api/og/generate`), automatic schema/metadata from the content config, and a generated RSS feed at `/api/rss`.

### Password Protection
Individual routes can be gated — configure protected paths in `once-ui.config.ts` and set `PAGE_ACCESS_PASSWORD` in `.env.local`. Enforced by `/api/authenticate` and `/api/check-auth`.

---

## Content

All content is authored in two places:

**`src/resources/content.tsx`** — person metadata (name, avatar, location, timezone, languages, technologies), social links, skills, terminal commands, and MagicBento card data.

**`src/resources/content.achievements.ts`** — achievement definitions, rarity tiers, trophy mapping, and `LOCAL_STORAGE_KEY`.

**`src/resources/content.weather.ts`** — WMO weather code descriptions and icon mappings.

**MDX files** — long-form content lives alongside the routes:
- `src/app/[lang]/blog/posts/*.mdx`
- `src/app/[lang]/work/projects/*.mdx`

Supported frontmatter keys: `title`, `subtitle`, `publishedAt`, `summary`, `image`, `images`, `tag`, `team`, `link`.

**`src/resources/once-ui.config.ts`** — controls which routes are enabled, protected routes, theme tokens, and fonts (Geist · DotGothic16 · Geist Mono).

---

## Getting Started

### Requirements

- Node.js 24
- pnpm 11

The easiest way to get the right versions is via the included Nix dev shell (see below).

### Manual setup

```sh
pnpm install
pnpm dev          # http://localhost:6721
```

### Nix + direnv (recommended)

```sh
direnv allow      # activates the dev shell and installs git hooks
```

This drops you into a shell with the exact Node/pnpm/just versions pinned in `flake.nix` and wires up the pre-commit hooks automatically.

### Environment variables

Copy `.env.example` to `.env.local`:

```sh
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `PAGE_ACCESS_PASSWORD` | Password for any protected routes defined in `once-ui.config.ts` |

---

## Development Commands

Common tasks are wrapped in a `justfile`. Run `just` to list them.

| Command | Description |
|---|---|
| `just dev` | Dev server on port 6721 (Turbopack) |
| `just build` | Production build |
| `just start` | Serve the production build |
| `just lint` | Lint without auto-fixing |
| `just format` | Auto-format + safe lint fixes (Biome) |
| `just typecheck` | Full TypeScript check |
| `just check` | Full CI gate: lint + typecheck + build |
| `just upgrade` | Upgrade all deps to latest |
| `just outdated` | Show available updates |
| `just clean` | Remove `node_modules`, `.next`, `out/` |

Equivalent pnpm scripts are also available (`pnpm dev`, `pnpm build`, etc.).

---

## Git Hooks (nix-managed)

The pre-commit hook runs four checks in sequence:

1. **Biome** — format + lint with auto-fix on staged files
2. **check-imports** — ensures no `../` relative imports (enforces `@/*` alias)
3. **tsc** — full type-check
4. **next build** — full production build

Inside the nix dev shell these are managed by `git-hooks.nix`. Outside nix, run `just pre-commit` to execute the same checks manually before pushing.

---

## Linting & Formatting

[Biome](https://biomejs.dev) handles both linting and formatting (replaces ESLint + Prettier).

- Line width: 100 chars
- Indent: 2 spaces
- Quotes: double
- Import organisation: automatic
- Accessibility (`a11y`) and security warnings enabled

Config: `biome.json`

---

## Deployment

Tested on [Vercel](https://vercel.com). A GitHub Actions workflow (`.github/workflows/nextjs.yml`) handles CI and deployment to GitHub Pages as an alternative target.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKangaZero%2Fportfolio)

---

## License

Distributed under the **CC BY-NC 4.0** License — attribution required, commercial use not permitted. See `LICENSE`.

Base template: [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) — built with [Once UI](https://once-ui.com) by Lorant One.
