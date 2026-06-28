# Project command runner. Run `just` to list recipes.
# Requires the dev shell (`nix develop` / direnv) which provides node, pnpm and just.

set shell := ["bash", "-cu"]

# Show all available recipes
default:
    @just --list

# Install dependencies (honors the lockfile)
install:
    pnpm install

# Start the dev server (http://localhost:6721)
dev:
    pnpm dev

# Production build
build:
    pnpm build

# Serve the production build
start:
    pnpm start

# Lint + format check (no writes) with Biome
lint:
    pnpm lint

# Auto-format and apply safe lint fixes with Biome
format:
    pnpm format

# Type-check with the TypeScript compiler
typecheck:
    pnpm typecheck

# Full local CI gate: lint, type-check, build
check: lint typecheck build

# Update every dependency to the latest version allowed by the
# 7-day minimumReleaseAge policy, then refresh the lockfile
upgrade:
    pnpm up --latest

# Show dependencies that have newer versions available
outdated:
    pnpm outdated

# What the git pre-commit hook runs (auto-format, lint, type-check, build)
pre-commit:
    pnpm format
    pnpm lint
    pnpm typecheck
    pnpm build

# Remove build artifacts and installed dependencies
clean:
    rm -rf node_modules .next out
