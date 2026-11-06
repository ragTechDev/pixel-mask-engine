# CLAUDE.md — pixel-mask-engine

This repo will be **open source**. Write everything in it (code, comments, commit messages, docs, sample data) as if it is already public.

## What this is

A TypeScript library that composes and renders pixel-art avatars (and, next, tiles, furniture and small decor) from string-based masks and fixed palettes.

## Current state (core and Sprite refactor done)

- Entries: `@ragtechdev/pixel-mask-engine` (pure core: `buildAvatar`, `buildTile`, `avatarKey`, `createCache`, `toSvg*`, style and palette tables), `@ragtechdev/pixel-mask-engine/canvas` (`paintRaster`, `drawRaster`) and `@ragtechdev/pixel-mask-engine/react` (`Avatar`, `Tile`, `PixelImage`). React is an optional peer.
- `Sprite` (`src/core/sprite.ts`) is the single image primitive: palette-slot indices plus an origin. Avatar shape masks are still `"0"`/`"1"` strings, auto-shaded by `shadeMask` using `src/core/lighting.ts`. Tile masks are 16×16 text rows resolved through the fixed `tilePalette`. `composeSprites` (internal) produces a colour-resolved `Raster`.
- `resolveAvatarConfig` replaces any value that isn't in the fixed tables with its default.
- Size baseline before the refactor: the whole bundle was about 3.3 KB gzipped. After it, an avatar-only import is about 3.28 KB, the full core entry is about 4.25 KB (it now includes tiles), and the react and canvas entries add about 0.46 KB and 0.45 KB.

- Worlds (`src/world/`): terrain tiles, tilesets, maps and objects.
  - `defineTileSet` (2×2-tile blocks plus `solid`/`water`/`grass` tile-id lists), `defineMap` (one character per block, plus placed objects), `buildMap` (memoised raster), `queryCell` and `tileAt`. Built-in tilesets are `townTileset` and `houseTileset`.
  - Art is one `*.mask.ts` file per mask under `src/world/masks/`, like the avatar masks: `masks/tiles/<tile>.mask.ts` for terrain, and `masks/objects/<object>/<part>.mask.ts` for objects (a directory when an object has several masks, a single file otherwise). Terrain masks are 16×16 text rows (`parseRows`, palette characters `1-9a-z`). Assembly lives in `src/world/tiles.ts` (tiles) and `src/world/objects/objectParts.ts` (which mask, ramp and offset each object part uses).
  - Edges are tiles too: nine-patch sets (centre plus edges and corners) for `roof_*`, `beige_pavement_*` (against grass) and `wall_*` (left, right, base). `townTileset` blocks assemble them with phone-keypad keys (`1`-`9` roof, `A`-`I` pavement, `l h r` and `[ _ ]` wall). Edge tiles keep their base tile's pattern away from the edge, which the tests check.
  - Things that stand on terrain (tree, fence, door, window, counter, bookshelf, rug, flower) are **objects**, not tiles: `"0"/"1"` shape masks, auto-shaded by `shadeMask` with the fixed `objectRamps`, with footprint and behaviour in `objectInfo`. This is the base for furniture, decor and a pet.
  - All town and object masks are **drafts** that the maintainer will redraw. The layering (tile, block, tileset behaviour lists, map) follows pret/pokered, with none of its art or data.

Next: more objects and a pet on `Sprite`; final art for the draft tiles and objects; more tile types; a Web Worker only if measurements show it's needed.

## Target design

1. **Zero-dependency, tree-shakeable ESM core** (pure TypeScript, no React, no DOM types in the core entry). The React/Preact component is a separate optional entry point (for example `@ragtechdev/pixel-mask-engine/react`), with React as an optional peer dependency.
2. **One `Sprite` abstraction** shared by avatars, tiles, furniture, decor and a pet: a palette-indexed mask plus size and anchor. Replace the three mask formats with this one.
3. **Render once, reuse.** Paint each unique config to an offscreen canvas or sprite sheet, cache by a hash of the config, and draw with `image-rendering: pixelated`. Keep a plain SVG path for non-canvas use if it is cheap. Move batch generation into a Web Worker with `OffscreenCanvas` only if it measurably blocks the main thread.
4. **Framework-agnostic API.** The consumer app mounts a canvas module outside its UI framework, so the core must be callable without any framework.
5. Stay in TypeScript. Rust/WASM is not justified for compositing small masks.

## Hard rules

- **Constrained customization only.** Avatars and rooms are built from fixed masks and fixed palettes. Never add an API that accepts user-supplied art, arbitrary colours or arbitrary images.
- **Human-made art only.** All masks are authored by the maintainers. Never generate or add AI-generated art assets, and never add assets whose origin you cannot state.
- **Safe gestures only** if you add animation or gestures: non-contact (wave, sparkle, tip a hat). Nothing contact-based or sexualizable (no hugs, kisses, etc.).
- **No new dependency without checking its size and licence first.** Report the gzipped size delta. The core target is zero runtime dependencies.
- **No secrets**, API keys, `.env` files or personal data anywhere in the repo or its history.
- **Do not break the published API silently.** If an export changes, say so and update the README.
- **Licences:** code is MIT (`LICENSE`). Art is CC BY 4.0 (`LICENSE-ART.md`), which covers `src/avatar/masks/**`, `src/world/masks/**` and `src/world/tilesets/**`. When you add new art files (furniture, decor, pet masks), add their paths to `LICENSE-ART.md`. Do not change either licence without asking.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm dev           # vite examples/react-demo
pnpm build         # tsup (tsup.config.ts): index, canvas, react entries
pnpm typecheck     # tsc on everything + no-DOM check of the core entry (tsconfig.core.json)
pnpm test          # builds, then node:test against dist (test/*.test.mjs)
pnpm size          # gzipped size per entry (scripts/size.mjs)
```

Tests use the built-in `node:test` runner (no test dependency). `test/golden.test.mjs` checks `buildAvatar` pixel-for-pixel against fingerprints recorded from the original React renderer (commit db0a2c2). Add tests for each module you refactor.

## Supply chain

The package manager is pnpm (pinned in `packageManager`); do not use npm or commit `package-lock.json`. Hardening lives in `pnpm-workspace.yaml`:
- Dependency install scripts never run (`onlyBuiltDependencies: []`). esbuild is explicitly ignored. If pnpm warns that a new dependency wants a build script, review it; do not allow it by reflex.
- `minimumReleaseAge` delays brand-new versions by 3 days.
- `trustPolicy: no-downgrade` rejects versions that lost provenance. Exceptions go in `trustPolicyExclude`, exact version only, with a comment saying why. Never add one without reviewing the package (maintainer, repo, publish history).
- Always install with `--frozen-lockfile` in CI. Add a dependency only after checking its size and licence.
- Publishing happens only from `.github/workflows/release.yml` via npm trusted publishing (OIDC, with provenance). No npm token is stored anywhere. The npm trusted-publisher entry needs the **npm publish** permission (not "stage publish"), and its owner, repo, workflow and environment must match GitHub's spelling exactly (`ragTechDev`, `pixel-mask-engine`, `release.yml`, `npm-publish`).
- A release needs a manual approval: the `npm-publish` GitHub environment has a required reviewer and only allows `v*` tags.
- GitHub Actions are pinned to commit SHAs. Repo policy (Settings -> Actions) requires SHA pinning and allows only GitHub-owned actions plus `pnpm/action-setup`. To use a new action, review it first, then add it to that allow-list.
- Dependabot (`.github/dependabot.yml`) proposes weekly updates for Actions and dev dependencies, skipping versions younger than 3 days. Review each PR: check the changelog, and treat any new install-script warning or trust-policy failure as a stop sign, not something to exclude by reflex.

## Measuring size

Build with tsup (ESM, minified, React external) and gzip the output. Report gzipped bytes for: the core entry alone, the React entry alone, and the whole thing. Compare to the 3.3 KB baseline above.

## Working agreement

Start by proposing a short plan (steps, API sketch, what breaks) and wait for approval before refactoring. Keep one logical change per commit, with a message in the form `type(scope): subject`. Keep answers concise and ask at most one question at a time.

## Definition of done

Typecheck passes, the demo runs, the build succeeds, gzipped sizes are reported against the baseline, tests exist for changed modules, and the README matches the real API.
