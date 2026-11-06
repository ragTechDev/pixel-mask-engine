# CLAUDE.md — pixel-mask-engine

This repo will be **open source**. Write everything in it (code, comments, commit messages, docs, sample data) as if it is already public.

## What this is

A TypeScript library that composes and renders pixel-art avatars (and, next, tiles, furniture and small decor) from string-based masks and fixed palettes. It is the avatar/world engine for a separate, private, safety-first social app, but it must stand on its own and know nothing about that app.

## Current state (core and Sprite refactor done)

- Entries: `pixel-mask-engine` (pure core: `buildAvatar`, `buildTile`, `avatarKey`, `createCache`, `toSvg*`, style and palette tables), `pixel-mask-engine/canvas` (`paintRaster`, `drawRaster`) and `pixel-mask-engine/react` (`Avatar`, `Tile`, `PixelImage`). React is an optional peer.
- `Sprite` (`src/core/sprite.ts`) is the single image primitive: palette-slot indices plus an origin. Avatar shape masks are still `"0"`/`"1"` strings, auto-shaded by `shadeMask` using `src/core/lighting.ts`. Tile masks are numeric grids with the fixed `tilePalette`. `composeSprites` (internal) produces a colour-resolved `Raster`.
- `resolveAvatarConfig` replaces any value that isn't in the fixed tables with its default.
- Size baseline before the refactor: the whole bundle was about 3.3 KB gzipped. After it, an avatar-only import is about 3.28 KB, the full core entry is about 4.25 KB (it now includes tiles), and the react and canvas entries add about 0.46 KB and 0.45 KB.

Next: furniture, decor and a pet on `Sprite`; more tile types; a Web Worker only if measurements show it's needed.

## Target design

1. **Zero-dependency, tree-shakeable ESM core** (pure TypeScript, no React, no DOM types in the core entry). The React/Preact component is a separate optional entry point (for example `pixel-mask-engine/react`), with React as an optional peer dependency.
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
- **Licences:** code is MIT (`LICENSE`). Art is CC BY 4.0 (`LICENSE-ART.md`), which covers `src/avatar/masks/**` and `src/world/tiles/tileMasks.ts`. When you add new art files (furniture, decor, pet masks), add their paths to `LICENSE-ART.md`. Do not change either licence without asking.

## Commands

```sh
npm install
npm run dev        # vite examples/react-demo
npm run build      # tsup (tsup.config.ts): index, canvas, react entries
npm run typecheck  # tsc on everything + no-DOM check of the core entry (tsconfig.core.json)
npm test           # builds, then node:test against dist (test/*.test.mjs)
npm run size       # gzipped size per entry (scripts/size.mjs)
```

Tests use the built-in `node:test` runner (no test dependency). `test/golden.test.mjs` checks `buildAvatar` pixel-for-pixel against fingerprints recorded from the original React renderer (commit db0a2c2). Add tests for each module you refactor.

## Measuring size

Build with tsup (ESM, minified, React external) and gzip the output. Report gzipped bytes for: the core entry alone, the React entry alone, and the whole thing. Compare to the 3.3 KB baseline above.

## Working agreement

Start by proposing a short plan (steps, API sketch, what breaks) and wait for approval before refactoring. Keep one logical change per commit, with a message in the form `type(scope): subject`. Keep answers concise and ask at most one question at a time.

## Definition of done

Typecheck passes, the demo runs, the build succeeds, gzipped sizes are reported against the baseline, tests exist for changed modules, and the README matches the real API.
