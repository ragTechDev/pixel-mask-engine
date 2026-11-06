import { tileIds } from "./tiles";
import type { TileId } from "./types";

/** A block is a square arrangement of tiles. Maps refer to blocks by a single character. */
export type Block = readonly (readonly TileId[])[];

/**
 * Terrain behaviour lives in per-tileset lists of tile ids, not in per-cell
 * flags: every cell that uses a listed tile inherits the behaviour. Objects
 * (trees, doors, furniture) carry their own behaviour, see `objectInfo`.
 */
export interface TileSetDefinition {
    id: string;
    /** Tiles per block side. Defaults to 2. */
    blockSize?: number;
    /** Block art, keyed by a single character. */
    blocks: Readonly<Record<string, Block>>;
    /** Tiles that block movement. */
    solid?: readonly TileId[];
    /** Water tiles (swim or surf). */
    water?: readonly TileId[];
    /** Tiles that can trigger encounters. */
    grass?: readonly TileId[];
}

export interface TileSet {
    readonly id: string;
    readonly blockSize: number;
    readonly blocks: Readonly<Record<string, Block>>;
    readonly solid: ReadonlySet<TileId>;
    readonly water: ReadonlySet<TileId>;
    readonly grass: ReadonlySet<TileId>;
}

function checkTiles(setId: string, list: string, ids: readonly TileId[]): ReadonlySet<TileId> {
    for (const id of ids) {
        if (!tileIds.includes(id)) throw new Error(`Tileset "${setId}": unknown tile "${id}" in ${list}`);
    }
    return new Set(ids);
}

/** Validates and freezes a tileset. Throws on unknown tiles, bad block keys or block sizes. */
export function defineTileSet(def: TileSetDefinition): TileSet {
    const blockSize = def.blockSize ?? 2;
    if (!Number.isInteger(blockSize) || blockSize < 1) {
        throw new Error(`Tileset "${def.id}": blockSize must be a positive integer`);
    }
    for (const [key, block] of Object.entries(def.blocks)) {
        if (key.length !== 1) throw new Error(`Tileset "${def.id}": block key "${key}" must be one character`);
        if (block.length !== blockSize || block.some((row) => row.length !== blockSize)) {
            throw new Error(`Tileset "${def.id}": block "${key}" must be ${blockSize}×${blockSize}`);
        }
        for (const row of block) checkTiles(def.id, `block "${key}"`, row);
    }
    return Object.freeze({
        id: def.id,
        blockSize,
        blocks: def.blocks,
        solid: checkTiles(def.id, "solid", def.solid ?? []),
        water: checkTiles(def.id, "water", def.water ?? []),
        grass: checkTiles(def.id, "grass", def.grass ?? [])
    });
}
