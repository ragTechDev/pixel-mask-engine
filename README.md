# Pixel Mask Engine

A small TypeScript library that composes pixel-art avatars and tiles from fixed, hand-authored masks and fixed palettes.

- **Zero-dependency, tree-shakeable core.** Pure TypeScript with no React and no DOM.
- **One `Sprite` primitive** shared by avatars and tiles, with furniture, decor and pets to come.
- **Render once, reuse.** Configs are pure data, so you can cache the composed `Raster` by key and draw it to canvas or SVG.
- **Constrained by design.** Options are chosen from built-in tables. The API does not accept arbitrary colours or images.

## Install

```sh
npm install pixel-mask-engine
# React is an optional peer dependency, only needed for pixel-mask-engine/react
```

## Entry points

| Import | What it contains |
| --- | --- |
| `pixel-mask-engine` | `buildAvatar`, `buildTile`, `avatarKey`, `createCache`, `toSvg`, style and palette tables, types |
| `pixel-mask-engine/canvas` | `paintRaster`, `drawRaster` (browser canvas / `OffscreenCanvas`) |
| `pixel-mask-engine/react` | `<Avatar>`, `<Tile>`, `<PixelImage>` |

## Usage

### Framework-free (canvas)

```ts
import { buildAvatar, avatarKey, createCache, type AvatarConfig, type Raster } from "pixel-mask-engine";
import { drawRaster } from "pixel-mask-engine/canvas";

const cache = createCache<Raster>(512);
const config: AvatarConfig = { skinTone: "medium", hairColor: "black", clothesColor: "green", topStyle: "shirt" };

const avatar = cache.get(avatarKey(config), () => buildAvatar(config));
drawRaster(ctx, avatar, x, y, 4); // 4 screen pixels per art pixel, nearest-neighbour
```

`buildAvatar` fills in defaults for missing fields. It also replaces any unknown value with the default, so a config loaded from storage can only select built-in options.

### SVG string

```ts
import { buildTile, toSvg, toSvgDataUrl } from "pixel-mask-engine";

const svg = toSvg(buildTile("brick_pavement"), 4); // one <path> per colour
element.style.backgroundImage = `url("${toSvgDataUrl(buildTile("road"), 4)}")`;
```

### React

```tsx
import { Avatar, Tile } from "pixel-mask-engine/react";

<Avatar headOrientation="front" skinTone="medium" hairColor="black" topStyle="shirt" pixelSize={4} />
<Tile id="road" pixelSize={4} />
```

`<Avatar>` caches each unique config internally.

## Options

`AvatarConfig` fields (all optional): `headOrientation`, `skinTone`, `frontHairStyle`, `backHairStyle`, `hairColor`, `eyeColor`, `clothesColor`, `topStyle`, `bottomStyle`, `fullOutfitStyle`, `shoeStyle`, `armPose`, `legPose`. Valid values are the keys of the exported tables, for example `skinPalettes`, `topStyles` and `frontHairStyles`. Tile ids are listed in `tileIds`.

## Development

```sh
npm install
npm run dev        # demo in examples/react-demo
npm run typecheck  # whole project, plus a no-DOM check of the core entry
npm test           # builds, then runs node:test against dist
npm run build      # tsup: ESM + .d.ts for all entries
npm run size       # gzipped size per entry
```

## Licence

- **Code:** MIT, see [LICENSE](LICENSE).
- **Pixel-art masks** (`src/avatar/masks/**`, `src/world/tiles/tileMasks.ts`): CC BY 4.0, see [LICENSE-ART.md](LICENSE-ART.md). Credit "pixel-mask-engine by Natasha Ann" when you redistribute the art or images rendered from it.
