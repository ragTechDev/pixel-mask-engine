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
| `@ragtechdev/pixel-mask-engine` | `iconIds`, `buildIcon`, `buildAvatar`, `buildTile`, `defineTileSet`, `defineMap`, `buildMap`, `buildObject`, `queryCell`, `tilePalettes`, `avatarKey`, `createCache`, `toSvg`, style and palette tables, types |
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

Worlds use the layered design of classic tile-based games, plus shaded objects on top.

1. **Tile:** a 16×16 terrain tile (`tileIds`). Tiles are drawn as `"0"/"1"` layers painted in named colours, like avatar parts, and edge and corner tiles are composed from shared edge strips.
2. **Block:** a square group of tiles (2×2 by default), keyed by a single character.
3. **Tileset:** the blocks plus lists of terrain tile ids (`solid`, `water`, `grass`). Every cell that uses a listed tile inherits the behaviour, so there are no per-cell flags to maintain.
4. **Map:** rows of block characters, plus placed objects.
5. **Object:** a shaded sprite that stands on or sits over the terrain: `tree`, `fence`, `door`, `window`, `counter`, `bookshelf`, `rug`, `flower` (`objectIds`). Objects are drawn as `"0"/"1"` silhouettes and shaded automatically, like avatar parts, using fixed ramps (`objectRamps`). Each has a tile footprint, and `objectInfo` says which cells are solid and whether it is a door or a counter.

```ts
import { buildMap, defineMap, queryCell, townTileset } from "@ragtechdev/pixel-mask-engine";
import { drawRaster } from "@ragtechdev/pixel-mask-engine/canvas";

const map = defineMap(
  townTileset,
  ["gggggg", "gghhgg", "gghhgg", "ggpppp"], // g grass, h wall, p path
  [
    { id: "window", x: 4, y: 3 }, // tile coordinates of the footprint's top-left tile
    { id: "door", x: 5, y: 3 },
    { id: "tree", x: 0, y: 0 },
  ],
);

drawRaster(ctx, buildMap(map), 0, 0, 2); // memoised per map object
queryCell(map, 5, 3); // { tile: "wall", object: "door", solid: true, door: true, ... }
```

Tile colours come from fixed palettes (`tilePalettes`, listed in `tileThemes`: `default`, `autumn`, `winter`), so one choice recolours the whole terrain and the art never changes:

```ts
buildTile("grass", "winter");
buildMap(map, "autumn"); // objects keep their own colours
```

Unknown palette names fall back to `default`. Palettes are fixed tables, and the API does not accept arbitrary colours. (This replaces the old `tilePalette` colour array export, whose indices no longer exist.)

Edges and roofs use nine-patch sets: a centre tile plus edge and corner tiles for where it meets its neighbour. `townTileset` has blocks for them, keyed by a phone-keypad layout (`1`-`9` for a roof, `< = >` for a roof one block high, `A`-`I` for a beige pavement patch, `l` `h` `r` for house walls and `[` `_` `]` for a wall one block high with its foundation). The key layout is documented on `townTileset`.

`townTileset` (outdoor) and `houseTileset` (interior) are built in. `defineTileSet` and `defineMap` validate their input and throw on unknown tiles, block characters or objects, on objects outside the map, and on two objects of the same layer overlapping. `buildObject(id)` renders one object by itself. The art for towns, interiors and objects is in draft form and will change.

### Icons

Small coloured interface icons, drawn like world objects with an outline, shade and highlight in fixed colours. `iconIds` lists them. `buildIcon` returns a memoised raster you draw like any other.

| Use | Icons |
| --- | --- |
| Like | `heart_empty` (not liked), `heart` (liked) |
| Comment | `comment` |
| Pass it on | `bird_letter_idle` (not passed), `bird_letter` (passed, sealed); alternatives `basket`, `bird_perch`, `winged_letter` |
| Send to one person | `envelope_idle` (not sent), `envelope` (sent, sealed); alternatives `mailbox`, `note_ribbon` |
| Save | `bookmark_idle` (not saved), `bookmark` (saved); alternatives `pinned_note`, `jar` |

```ts
import { buildIcon, toSvgDataUrl } from "@ragtechdev/pixel-mask-engine";

img.src = toSvgDataUrl(buildIcon("bookmark_idle"), 2); // 2 screen pixels per icon pixel
```

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
- **Pixel-art masks** (`src/avatar/masks/**`, `src/world/masks/**`, `src/world/tilesets/**`): CC BY 4.0, see [LICENSE-ART.md](LICENSE-ART.md). Credit "pixel-mask-engine by Natasha Ann" when you redistribute the art or images rendered from it.
