import { composeSprites, type Layer, type Raster } from "../core/compose";
import { TILE_SIZE } from "./tiles/parseRows";
import { tilePalette, tileSprite } from "./tiles";
import type { TileSet } from "./tileset";
import type { TileId } from "./types";

/** A map is a grid of block characters. One character per block keeps maps tiny. */
export interface TileMap {
    readonly tileset: TileSet;
    readonly rows: readonly string[];
    /** Width in blocks. */
    readonly width: number;
    /** Height in blocks. */
    readonly height: number;
}

export interface CellInfo {
    readonly tile: TileId;
    readonly solid: boolean;
    readonly water: boolean;
    readonly grass: boolean;
    readonly counter: boolean;
    readonly door: boolean;
}

/** Validates a map against its tileset. Throws on ragged rows or unknown block characters. */
export function defineMap(tileset: TileSet, rows: readonly string[]): TileMap {
    if (rows.length === 0) throw new Error("A map needs at least one row");
    const width = rows[0].length;
    rows.forEach((row, y) => {
        if (row.length !== width) throw new Error(`Map row ${y} is ${row.length} wide, expected ${width}`);
        for (const ch of row) {
            if (!tileset.blocks[ch]) throw new Error(`Map row ${y}: no block "${ch}" in tileset "${tileset.id}"`);
        }
    });
    return Object.freeze({ tileset, rows: Object.freeze([...rows]), width, height: rows.length });
}

/** Size of the map in tiles. */
export function mapTileSize(map: TileMap): { width: number; height: number } {
    return { width: map.width * map.tileset.blockSize, height: map.height * map.tileset.blockSize };
}

/** The tile at tile coordinates (tx, ty), or undefined outside the map. */
export function tileAt(map: TileMap, tx: number, ty: number): TileId | undefined {
    const size = map.tileset.blockSize;
    if (!Number.isInteger(tx) || !Number.isInteger(ty) || tx < 0 || ty < 0) return undefined;
    const row = map.rows[Math.floor(ty / size)];
    if (row === undefined) return undefined;
    const ch = row[Math.floor(tx / size)];
    if (ch === undefined) return undefined;
    return map.tileset.blocks[ch][ty % size][tx % size];
}

/** Behaviour of the cell at tile coordinates (tx, ty), or undefined outside the map. */
export function queryCell(map: TileMap, tx: number, ty: number): CellInfo | undefined {
    const tile = tileAt(map, tx, ty);
    if (tile === undefined) return undefined;
    const { solid, water, grass, counter, door } = map.tileset;
    return {
        tile,
        solid: solid.has(tile),
        water: water.has(tile),
        grass: grass.has(tile),
        counter: counter.has(tile),
        door: door.has(tile)
    };
}

const rendered = new WeakMap<TileMap, Raster>();

/** Renders the whole map to one raster (16 px per tile). Memoised per map object. */
export function buildMap(map: TileMap): Raster {
    let raster = rendered.get(map);
    if (!raster) {
        const size = map.tileset.blockSize;
        const layers: Layer[] = [];
        for (let by = 0; by < map.height; by += 1) {
            for (let bx = 0; bx < map.width; bx += 1) {
                const block = map.tileset.blocks[map.rows[by][bx]];
                for (let ty = 0; ty < size; ty += 1) {
                    for (let tx = 0; tx < size; tx += 1) {
                        layers.push({
                            sprite: tileSprite(block[ty][tx]),
                            slots: tilePalette,
                            x: (bx * size + tx) * TILE_SIZE,
                            y: (by * size + ty) * TILE_SIZE
                        });
                    }
                }
            }
        }
        const { width, height } = mapTileSize(map);
        raster = composeSprites(layers, { x: 0, y: 0, width: width * TILE_SIZE, height: height * TILE_SIZE });
        rendered.set(map, raster);
    }
    return raster;
}
