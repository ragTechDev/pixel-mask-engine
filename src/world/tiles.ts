import { composeSprites, type Raster } from "../core/compose";
import { spriteFromGrid, type Sprite } from "../core/sprite";
import { tileMasks } from "./tiles/tileMasks";
import { townMasks } from "./tiles/townMasks";
import type { TileId } from "./types";

/** Fixed tile palette, indexed by the values in the tile masks (0 = transparent). */
export const tilePalette = [
    "",
    "#726962", // 1: road dark gray
    "#8A7D78", // 2: road lighter gray (curb / edge detail)
    "#FFFFFF", // 3: white (lane markings)
    "#E9BFA7", // 4: beige pavement base
    "#C4A090", // 5: beige shadow
    "#F5D0BA", // 6: beige highlight
    "#D4C4B4", // 7: stone grout / joint lines
    "#6B4548", // 8: brick main
    "#3E2830", // 9: brick mortar / dark joints
    "#8C6870", // 10 (a): brick lighter highlight
    "#8FB36A", // 11 (b): grass
    "#6E9450", // 12 (c): grass shade
    "#A8C682", // 13 (d): grass light
    "#6FA3C7", // 14 (e): water
    "#A9D0E6", // 15 (f): water light
    "#4F7FA6", // 16 (g): water shade
    "#A8794E", // 17 (h): wood
    "#7A5434", // 18 (i): wood shade
    "#C79A6B", // 19 (j): wood light
    "#4F7A3E", // 20 (k): leaf shade
    "#D9645B", // 21 (l): flower red
    "#E8C557", // 22 (m): flower yellow
    "#C9BFB0", // 23 (n): wall
    "#A09585", // 24 (o): wall shade
    "#D8C8A8", // 25 (p): floor
    "#BFAE8C", // 26 (q): floor line
    "#A8474D", // 27 (r): rug
    "#7F3238", // 28 (s): rug shade
    "#D1B48A", // 29 (t): path
    "#B8996D", // 30 (u): path shade
    "#E3CBA5", // 31 (v): path light
    "#4A6FA5", // 32 (w): book blue
    "#9CC7DB" // 33 (x): window glass
] as const;

const allMasks: Record<TileId, number[][]> = { ...tileMasks, ...townMasks };

export const tileIds = Object.keys(allMasks) as TileId[];

const sprites = new Map<TileId, Sprite>();
const built = new Map<TileId, Raster>();

/** Internal: the (memoised) sprite for a built-in tile. Tile art is 16×16 palette-slot indices. */
export function tileSprite(id: TileId): Sprite {
    let sprite = sprites.get(id);
    if (!sprite) {
        const mask = allMasks[id];
        if (!mask) throw new Error(`Unknown tile: ${String(id)}`);
        sprite = spriteFromGrid(mask);
        sprites.set(id, sprite);
    }
    return sprite;
}

/** Returns the (memoised) raster for a built-in tile. */
export function buildTile(id: TileId): Raster {
    let raster = built.get(id);
    if (!raster) {
        raster = composeSprites([{ sprite: tileSprite(id), slots: tilePalette, x: 0, y: 0 }]);
        built.set(id, raster);
    }
    return raster;
}
