import { composeSprites, type Layer, type Raster } from "../../core/compose";
import { rampSlots, shadeMask, type Sprite } from "../../core/sprite";
import { TILE_SIZE } from "../parseRows";
import type { ObjectId } from "../types";
import { objectParts, type ObjectPart } from "./objectParts";
import { objectRamps } from "./ramps";

export interface ObjectInfo {
    /** Footprint width in tiles. */
    readonly width: number;
    /** Footprint height in tiles. */
    readonly height: number;
    /** "ground" objects (rugs, flowers) sit under "standing" ones and are drawn first. */
    readonly layer: "ground" | "standing";
    /** One string per tile row. `#` blocks movement, `.` is open. */
    readonly footprint: readonly string[];
    /** A warp, such as a door. */
    readonly door?: true;
    /** Something you can interact across, such as a shop counter. */
    readonly counter?: true;
}

export const objectInfo: Record<ObjectId, ObjectInfo> = {
    tree: { width: 1, height: 2, layer: "standing", footprint: [".", "#"] },
    fence: { width: 1, height: 1, layer: "standing", footprint: ["#"] },
    door: { width: 1, height: 1, layer: "standing", footprint: ["."], door: true },
    window: { width: 1, height: 1, layer: "standing", footprint: ["#"] },
    counter: { width: 2, height: 1, layer: "standing", footprint: ["##"], counter: true },
    bookshelf: { width: 1, height: 2, layer: "standing", footprint: ["#", "#"] },
    rug: { width: 2, height: 2, layer: "ground", footprint: ["..", ".."] },
    flower: { width: 1, height: 1, layer: "ground", footprint: ["."] }
};

export const objectIds = Object.keys(objectInfo) as ObjectId[];

const partSprites = new WeakMap<ObjectPart, Sprite>();

function partSprite(part: ObjectPart): Sprite {
    let sprite = partSprites.get(part);
    if (!sprite) {
        sprite = shadeMask(part.mask);
        partSprites.set(part, sprite);
    }
    return sprite;
}

/** Internal: the layers of an object placed with its top-left corner at pixel (px, py). */
export function objectLayers(id: ObjectId, px: number, py: number): Layer[] {
    const parts = objectParts[id];
    if (!parts) throw new Error(`Unknown object: ${String(id)}`);
    return parts.map((part) => ({
        sprite: partSprite(part),
        slots: rampSlots(objectRamps[part.ramp]),
        x: px + part.x,
        y: py + part.y
    }));
}

const built = new Map<ObjectId, Raster>();

/** Returns the (memoised) raster for an object, sized to its tile footprint. */
export function buildObject(id: ObjectId): Raster {
    let raster = built.get(id);
    if (!raster) {
        const { width, height } = objectInfo[id];
        raster = composeSprites(objectLayers(id, 0, 0), {
            x: 0,
            y: 0,
            width: width * TILE_SIZE,
            height: height * TILE_SIZE
        });
        built.set(id, raster);
    }
    return raster;
}
