import { composeSprites, type Raster } from "../core/compose";
import type { Sprite } from "../core/sprite";
import { TILE_SIZE } from "./size";
import { resolveTheme, tileColorNames, tilePalettes, type TileTheme } from "./tiles/palettes";
import { tileDefs, tileGrid } from "./tiles/tileDefs";
import type { TileId } from "./types";

export const tileIds = Object.keys(tileDefs) as TileId[];

const colorSlot = new Map(tileColorNames.map((name, index) => [name, index + 1]));
const sprites = new Map<TileId, Sprite>();

/**
 * Internal: the (memoised) sprite for a built-in tile. Pixels are slots into
 * `themeSlots`, one per colour name, so the same sprite works in every palette.
 */
export function tileSprite(id: TileId): Sprite {
    let sprite = sprites.get(id);
    if (!sprite) {
        const grid = tileGrid(id);
        const px = new Uint8Array(TILE_SIZE * TILE_SIZE);
        grid.forEach((row, y) => row.forEach((name, x) => (px[y * TILE_SIZE + x] = colorSlot.get(name) as number)));
        sprite = { width: TILE_SIZE, height: TILE_SIZE, originX: 0, originY: 0, px };
        sprites.set(id, sprite);
    }
    return sprite;
}

const slots = new Map<TileTheme, readonly string[]>();

/** Internal: the colours for `tileSprite` pixels in a palette (slot 0 is transparent). */
export function themeSlots(theme?: string): readonly string[] {
    const resolved = resolveTheme(theme);
    let list = slots.get(resolved);
    if (!list) {
        list = ["", ...tileColorNames.map((name) => tilePalettes[resolved][name])];
        slots.set(resolved, list);
    }
    return list;
}

const built = new Map<string, Raster>();

/**
 * Returns the (memoised) raster for a built-in tile in a fixed palette
 * (`tileThemes`). Unknown palettes fall back to the default.
 */
export function buildTile(id: TileId, theme?: string): Raster {
    const resolved = resolveTheme(theme);
    const key = `${resolved}:${id}`;
    let raster = built.get(key);
    if (!raster) {
        raster = composeSprites([{ sprite: tileSprite(id), slots: themeSlots(resolved), x: 0, y: 0 }]);
        built.set(key, raster);
    }
    return raster;
}
