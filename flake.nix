{
  description = "KangaZero portfolio — Next.js dev environment (Node 26 + pnpm) with nix-managed git hooks";

  inputs = {
    # Pinned to a revision whose nodejs_26 (26.3.0) + pnpm (11.5.2) are in the
    # binary cache, so the dev shell does not compile Node from source.
    nixpkgs.url = "github:NixOS/nixpkgs/9ae611a455b90cf061d8f332b977e387bda8e1ca";
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      git-hooks,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Tools available in the dev shell and to the git hooks.
        # pnpm is pinned to 11.5.2 in package.json (packageManager) and nixpkgs
        # currently ships exactly that, so no corepack shim is needed.
        nodejs = pkgs.nodejs_26;

        # nix-managed git pre-commit hook: auto-format + lint, type-check, build.
        # Each hook shells out to the project's pinned pnpm/biome/tsc so the
        # versions match CI and local installs exactly.
        pre-commit-check = git-hooks.lib.${system}.run {
          src = ./.;
          hooks = {
            biome = {
              enable = true;
              name = "biome (format + lint)";
              entry = "${pkgs.pnpm}/bin/pnpm exec biome check --write --no-errors-on-unmatched";
              files = "\\.(jsx?|tsx?|mjs|cjs|json|jsonc|css|scss)$";
              pass_filenames = true;
            };
            typecheck = {
              enable = true;
              name = "typecheck (tsc)";
              entry = "${pkgs.pnpm}/bin/pnpm typecheck";
              pass_filenames = false;
            };
            build = {
              enable = true;
              name = "next build";
              entry = "${pkgs.pnpm}/bin/pnpm build";
              pass_filenames = false;
            };
          };
        };
      in
      {
        checks.pre-commit-check = pre-commit-check;

        devShells.default = pkgs.mkShell {
          inherit (pre-commit-check) shellHook;
          buildInputs = pre-commit-check.enabledPackages ++ [
            nodejs
            pkgs.pnpm
            pkgs.just
          ];
        };
      }
    );
}
