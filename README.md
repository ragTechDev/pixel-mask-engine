# Pixel Mask Engine

A small TypeScript library that composes pixel-art avatars, tiles and tile-based worlds from fixed, hand-authored masks and fixed palettes.

- **Zero-dependency, tree-shakeable core.** Pure TypeScript with no React and no DOM.
- **One `Sprite` primitive** shared by avatars and tiles, with furniture, decor and pets to come.
- **Render once, reuse.** Configs are pure data, so you can cache the composed `Raster` by key and draw it to canvas or SVG.
- **Constrained by design.** Options are chosen from built-in tables. The API does not accept arbitrary colours or images.

## Install

```sh
npm install @ragtechdev/pixel-mask-engine
# React is an optional peer dependency, only needed for @ragtechdev/pixel-mask-engine/react
```

## Entry points

| Import | What it contains |
| --- | --- |
| `@ragtechdev/pixel-mask-engine` | `buildAvatar`, `buildTile`, `defineTileSet`, `defineMap`, `buildMap`, `queryCell`, `avatarKey`, `createCache`, `toSvg`, style and palette tables, types |
| `@ragtechdev/pixel-mask-engine/canvas` | `paintRaster`, `drawRaster` (browser canvas / `OffscreenCanvas`) |
| `@ragtechdev/pixel-mask-engine/react` | `<Avatar>`, `<Tile>`, `<PixelImage>` |

## Usage

### Framework-free (canvas)

```ts
import { buildAvatar, avatarKey, createCache, type AvatarConfig, type Raster } from "@ragtechdev/pixel-mask-engine";
import { drawRaster } from "@ragtechdev/pixel-mask-engine/canvas";

const cache = createCache<Raster>(512);
const config: AvatarConfig = { skinTone: "medium", hairColor: "black", clothesColor: "green", topStyle: "shirt" };

const avatar = cache.get(avatarKey(config), () => buildAvatar(config));
drawRaster(ctx, avatar, x, y, 4); // 4 screen pixels per art pixel, nearest-neighbour
```

`buildAvatar` fills in defaults for missing fields. It also replaces any unknown value with the default, so a config loaded from storage can only select built-in options.

### SVG string

```ts
import { buildTile, toSvg, toSvgDataUrl } from "@ragtechdev/pixel-mask-engine";

const svg = toSvg(buildTile("brick_pavement"), 4); // one <path> per colour
element.style.backgroundImage = `url("${toSvgDataUrl(buildTile("road"), 4)}")`;
```

### React

```tsx
import { Avatar, Tile } from "@ragtechdev/pixel-mask-engine/react";

<Avatar headOrientation="front" skinTone="medium" hairColor="black" topStyle="shirt" pixelSize={4} />
<Tile id="road" pixelSize={4} />
```

`<Avatar>` caches each unique config internally.

### Worlds

Worlds use the layered design of classic tile-based games: small tiles, blocks of tiles, and maps that store one character per block.

1. **Tile:** a 16×16 mask from the fixed tile palette (`tileIds`).
2. **Block:** a square group of tiles (2×2 by default), keyed by a single character.
3. **Tileset:** the blocks plus behaviour lists of tile ids (`solid`, `water`, `grass`, `counter`, `door`). Every cell that uses a listed tile inherits the behaviour, so there are no per-cell flags to maintain.
4. **Map:** rows of block characters.

```ts
import { buildMap, defineMap, queryCell, townTileset } from "@ragtechdev/pixel-mask-engine";
import { drawRaster } from "@ragtechdev/pixel-mask-engine/canvas";

const map = defineMap(townTileset, [
  "TTTTTT",
  "TggggT",
  "ThWhgT", // h wall, W window wall
  "ThhdgT", // d door
  "TgppgT", // p path
]);

drawRaster(ctx, buildMap(map), 0, 0, 2); // memoised per map object
queryCell(map, 7, 7); // { tile: "door", solid: false, door: true, ... } in tile coordinates
```

`townTileset` (outdoor) and `houseTileset` (interior) are built in. `defineTileSet` and `defineMap` validate their input and throw on unknown tiles or block characters. Block art only references built-in tiles. The tile art for towns and interiors is in draft form and will change.

## Options

`AvatarConfig` fields (all optional): `headOrientation`, `skinTone`, `frontHairStyle`, `backHairStyle`, `hairColor`, `eyeColor`, `clothesColor`, `topStyle`, `bottomStyle`, `fullOutfitStyle`, `shoeStyle`, `armPose`, `legPose`. Valid values are the keys of the exported tables, for example `skinPalettes`, `topStyles` and `frontHairStyles`. Tile ids are listed in `tileIds`.

## Development

```sh
pnpm install
pnpm dev        # demo in examples/react-demo
pnpm typecheck  # whole project, plus a no-DOM check of the core entry
pnpm test       # builds, then runs node:test against dist
pnpm build      # tsup: ESM + .d.ts for all entries
pnpm size       # gzipped size per entry
```

## Licence

- **Code:** MIT, see [LICENSE](LICENSE).
- **Pixel-art masks** (`src/avatar/masks/**`, `src/world/tiles/tileMasks.ts`, `src/world/tiles/townMasks.ts`, `src/world/tilesets/**`): CC BY 4.0, see [LICENSE-ART.md](LICENSE-ART.md). Credit "pixel-mask-engine by Natasha Ann" when you redistribute the art or images rendered from it.
