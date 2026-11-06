import { composeSprites, type Raster } from "../core/compose";
import { spriteFromGrid } from "../core/sprite";
import { tileMasks } from "./tiles/tileMasks";
import type { TileId } from "./types";

/** Fixed tile palette, indexed by the values in `tileMasks` (0 = transparent). */
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
    "#8C6870" // 10: brick lighter highlight
] as const;

export const tileIds = Object.keys(tileMasks) as TileId[];

const built = new Map<TileId, Raster>();

/** Returns the (memoised) raster for a built-in tile. */
export function buildTile(id: TileId): Raster {
    let raster = built.get(id);
    if (!raster) {
        const mask = tileMasks[id];
        if (!mask) throw new Error(`Unknown tile: ${String(id)}`);
        raster = composeSprites([{ sprite: spriteFromGrid(mask), slots: tilePalette, x: 0, y: 0 }]);
        built.set(id, raster);
    }
    return raster;
}
