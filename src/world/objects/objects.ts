import { colorRamps, type ColorName } from "../../core/colors";
import { parseHex, rampFromHex, type HexColor } from "../../core/customColor";
import { composeSprites, type Layer, type Raster } from "../../core/compose";
import { rampSlots, shadeMask, type Sprite } from "../../core/sprite";
import { TILE_SIZE } from "../size";
import { defaultTileTheme, resolveTheme, type TileTheme } from "../tiles/palettes";
import type { ObjectId } from "../types";
import { objectParts, type ObjectPart } from "./objectParts";
import { objectRamps, type ObjectRampId } from "./ramps";

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

/** The common colours each object can be shown in, replacing its main colour (the paint, leaves, cloth or petals). */
export const objectColors: Partial<Record<ObjectId, readonly ColorName[]>> = {
    tree: ["orange", "red", "yellow", "pink", "purple"],
    door: ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "grey"],
    window: ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "grey"],
    fence: ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "grey"],
    bookshelf: ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "white", "grey"],
    rug: ["orange", "yellow", "green", "teal", "blue", "purple", "pink", "grey"],
    flower: ["orange", "pink", "purple", "blue", "white"]
};

/** The ramps of an object that `color` replaces. */
const accents: Partial<Record<ObjectId, readonly ObjectRampId[]>> = {
    tree: ["leaf"],
    door: ["wood"],
    window: ["wood"],
    fence: ["wood"],
    bookshelf: ["wood"],
    rug: ["cloth_red"],
    flower: ["flower_red", "flower_yellow"]
};

/** The objects with a main colour you can change with `color`. */
export const colorableObjectIds = objectIds.filter((id) => objectColors[id]);

/** The objects whose colours change with the season (the others look the same all year). */
export const seasonalObjectIds = objectIds.filter((id) => objectParts[id].some((part) => part.seasonal));

/** Internal: the layers of an object placed with its top-left corner at pixel (px, py). */
export function objectLayers(id: ObjectId, px: number, py: number, theme: TileTheme = defaultTileTheme, color?: ColorName | HexColor): Layer[] {
    const parts = objectParts[id];
    if (!parts) throw new Error(`Unknown object: ${String(id)}`);
    return parts.map((part) => ({
        sprite: partSprite(part),
        slots: rampSlots(color && accents[id]?.includes(part.ramp) ? (color.startsWith("#") ? rampFromHex(color as HexColor) : colorRamps[color as ColorName]) : objectRamps[part.seasonal?.[theme] ?? part.ramp]),
        x: px + part.x,
        y: py + part.y
    }));
}

const built = new Map<string, Raster>();

/**
 * Returns the (memoised) raster for an object, sized to its tile footprint. Trees and flowers
 * change with the season (`seasonalObjectIds`); `theme` is a season as in `tileThemes`, and
 * unknown values fall back to summer. `color` is one of the object's common colours
 * (`objectColors`) or any hex colour such as `"#e8873a"`; anything else is ignored.
 */
export function buildObject(id: ObjectId, theme?: string, color?: ColorName | HexColor): Raster {
    const season = resolveTheme(theme);
    const chosen = objectColors[id] && color ? (objectColors[id]!.includes(color as ColorName) ? (color as ColorName) : parseHex(color)) : undefined;
    // A colour replaces the season's colour for the same part, so it does not need a season in its key.
    const key = chosen ? `${id}:${season}:${chosen}` : seasonalObjectIds.includes(id) ? `${id}:${season}` : id;
    let raster = built.get(key);
    if (!raster) {
        const { width, height } = objectInfo[id];
        raster = composeSprites(objectLayers(id, 0, 0, season, chosen), {
            x: 0,
            y: 0,
            width: width * TILE_SIZE,
            height: height * TILE_SIZE
        });
        built.set(key, raster);
    }
    return raster;
}
