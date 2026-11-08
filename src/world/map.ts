import { composeSprites, type Layer, type Raster } from "../core/compose";
import { objectIds, objectInfo, objectLayers } from "./objects/objects";
import { TILE_SIZE } from "./size";
import { themeSlots, tileSprite } from "./tiles";
import { resolveTheme, tileColorsKey, type TileColors } from "./tiles/palettes";
import type { TileSet } from "./tileset";
import type { ObjectId, TileId } from "./types";

/** An object placed on a map. `x` and `y` are the tile coordinates of its top-left footprint tile. */
export interface PlacedObject {
    readonly id: ObjectId;
    readonly x: number;
    readonly y: number;
}

/** A map is a grid of block characters plus placed objects. One character per block keeps maps tiny. */
export interface TileMap {
    readonly tileset: TileSet;
    readonly rows: readonly string[];
    readonly objects: readonly PlacedObject[];
    /** Width in blocks. */
    readonly width: number;
    /** Height in blocks. */
    readonly height: number;
}

export interface CellInfo {
    readonly tile: TileId;
    /** The object covering this cell. A standing object wins over a ground one. */
    readonly object?: ObjectId;
    /** True for solid terrain and for solid footprint cells of standing objects. */
    readonly solid: boolean;
    readonly water: boolean;
    readonly grass: boolean;
    readonly counter: boolean;
    readonly door: boolean;
}

interface Occupant {
    readonly object: PlacedObject;
    /** Footprint character at this cell: `#` solid, `.` open. */
    readonly mark: string;
}

const occupancy = new WeakMap<TileMap, { standing: Map<number, Occupant>; ground: Map<number, Occupant> }>();

/**
 * Validates a map against its tileset. Throws on ragged rows, unknown block
 * characters or objects, objects outside the map, and objects of the same
 * layer that overlap.
 */
export function defineMap(tileset: TileSet, rows: readonly string[], objects: readonly PlacedObject[] = []): TileMap {
    if (rows.length === 0) throw new Error("A map needs at least one row");
    const width = rows[0].length;
    rows.forEach((row, y) => {
        if (row.length !== width) throw new Error(`Map row ${y} is ${row.length} wide, expected ${width}`);
        for (const ch of row) {
            if (!tileset.blocks[ch]) throw new Error(`Map row ${y}: no block "${ch}" in tileset "${tileset.id}"`);
        }
    });

    const tilesWide = width * tileset.blockSize;
    const tilesHigh = rows.length * tileset.blockSize;
    const index = { standing: new Map<number, Occupant>(), ground: new Map<number, Occupant>() };
    for (const placed of objects) {
        if (!objectIds.includes(placed.id)) throw new Error(`Unknown object "${String(placed.id)}"`);
        const info = objectInfo[placed.id];
        if (
            !Number.isInteger(placed.x) || !Number.isInteger(placed.y) ||
            placed.x < 0 || placed.y < 0 || placed.x + info.width > tilesWide || placed.y + info.height > tilesHigh
        ) {
            throw new Error(`Object "${placed.id}" at (${placed.x}, ${placed.y}) does not fit in the map`);
        }
        const cells = index[info.layer];
        for (let dy = 0; dy < info.height; dy += 1) {
            for (let dx = 0; dx < info.width; dx += 1) {
                const key = (placed.y + dy) * tilesWide + placed.x + dx;
                if (cells.has(key)) {
                    throw new Error(`Object "${placed.id}" at (${placed.x}, ${placed.y}) overlaps another ${info.layer} object`);
                }
                cells.set(key, { object: placed, mark: info.footprint[dy][dx] });
            }
        }
    }

    const map: TileMap = Object.freeze({
        tileset,
        rows: Object.freeze([...rows]),
        objects: Object.freeze([...objects]),
        width,
        height: rows.length
    });
    occupancy.set(map, index);
    return map;
}

/** Size of the map in tiles. */
export function mapTileSize(map: TileMap): { width: number; height: number } {
    return { width: map.width * map.tileset.blockSize, height: map.height * map.tileset.blockSize };
}

/** The terrain tile at tile coordinates (tx, ty), or undefined outside the map. */
export function tileAt(map: TileMap, tx: number, ty: number): TileId | undefined {
    const size = map.tileset.blockSize;
    if (!Number.isInteger(tx) || !Number.isInteger(ty) || tx < 0 || ty < 0) return undefined;
    const row = map.rows[Math.floor(ty / size)];
    if (row === undefined) return undefined;
    const ch = row[Math.floor(tx / size)];
    if (ch === undefined) return undefined;
    return map.tileset.blocks[ch][ty % size][tx % size];
}

/** Terrain and object behaviour of the cell at tile coordinates (tx, ty), or undefined outside the map. */
export function queryCell(map: TileMap, tx: number, ty: number): CellInfo | undefined {
    const tile = tileAt(map, tx, ty);
    if (tile === undefined) return undefined;
    const { solid, water, grass } = map.tileset;
    const index = occupancy.get(map);
    const key = ty * mapTileSize(map).width + tx;
    const standing = index?.standing.get(key);
    const ground = index?.ground.get(key);
    const info = standing && objectInfo[standing.object.id];
    return {
        tile,
        object: (standing ?? ground)?.object.id,
        solid: solid.has(tile) || standing?.mark === "#",
        water: water.has(tile),
        grass: grass.has(tile),
        counter: info?.counter === true,
        door: info?.door === true
    };
}

const rendered = new WeakMap<TileMap, Map<string, Raster>>();

/**
 * Renders the whole map to one raster (16 px per tile) in a fixed tile palette
 * (`tileThemes`). Memoised per map object and palette. Unknown palettes fall
 * back to summer. Seasonal objects (trees, flowers) change with it. `colors` recolours
 * groups of the palette with hex colours (`tileColorGroups`).
 */
export function buildMap(map: TileMap, theme?: string, colors?: TileColors): Raster {
    const resolved = resolveTheme(theme);
    const custom = tileColorsKey(colors);
    const cacheKey = `${resolved}|${custom}`;
    let byTheme = rendered.get(map);
    if (!byTheme) {
        byTheme = new Map();
        rendered.set(map, byTheme);
    }
    let raster = byTheme.get(cacheKey);
    if (!raster) {
        const slots = themeSlots(resolved, colors);
        const size = map.tileset.blockSize;
        const layers: Layer[] = [];
        for (let by = 0; by < map.height; by += 1) {
            for (let bx = 0; bx < map.width; bx += 1) {
                const block = map.tileset.blocks[map.rows[by][bx]];
                for (let ty = 0; ty < size; ty += 1) {
                    for (let tx = 0; tx < size; tx += 1) {
                        layers.push({
                            sprite: tileSprite(block[ty][tx]),
                            slots,
                            x: (bx * size + tx) * TILE_SIZE,
                            y: (by * size + ty) * TILE_SIZE
                        });
                    }
                }
            }
        }
        // Ground objects first, then standing ones from back to front so that a
        // tall object (a tree) covers whatever stands behind it.
        const order = (a: PlacedObject, b: PlacedObject) => {
            const layer = Number(objectInfo[a.id].layer === "standing") - Number(objectInfo[b.id].layer === "standing");
            return layer || a.y + objectInfo[a.id].height - (b.y + objectInfo[b.id].height) || a.x - b.x;
        };
        for (const placed of [...map.objects].sort(order)) {
            layers.push(...objectLayers(placed.id, placed.x * TILE_SIZE, placed.y * TILE_SIZE, resolved));
        }
        const { width, height } = mapTileSize(map);
        raster = composeSprites(layers, { x: 0, y: 0, width: width * TILE_SIZE, height: height * TILE_SIZE });
        byTheme.set(cacheKey, raster);
    }
    return raster;
}
