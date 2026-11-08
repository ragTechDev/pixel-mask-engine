import { composeSprites, type Layer, type Raster } from "../core/compose";
import type { PixelMask } from "../core/maskUtils";
import { defineSprite, rampSlots, shadeMask, type Sprite } from "../core/sprite";
import { iconCategories, type IconCategory } from "./categories";
import type { Part } from "./parts";

type Categories = typeof iconCategories;
export type IconId = { [C in IconCategory]: keyof Categories[C] }[IconCategory];

export const iconIds = Object.values(iconCategories).flatMap((icons) => Object.keys(icons)) as IconId[];

const iconParts = Object.assign({}, ...Object.values(iconCategories)) as Record<IconId, readonly Part[]>;


const shadedSprites = new WeakMap<PixelMask, Sprite>();

function layerOf(part: Part): Layer {
    if ("shaded" in part) {
        let sprite = shadedSprites.get(part.shaded);
        if (!sprite) {
            sprite = shadeMask(part.shaded);
            shadedSprites.set(part.shaded, sprite);
        }
        return { sprite, slots: rampSlots(part.ramp), x: part.x, y: part.y };
    }
    return { sprite: defineSprite(part.flat, { "1": 1 }), slots: ["", part.color], x: part.x, y: part.y };
}

const built = new Map<IconId, Raster>();

/** Returns the (memoised) coloured, shaded raster for an icon. Colours come from fixed ramps. */
export function buildIcon(id: IconId): Raster {
    let raster = built.get(id);
    if (!raster) {
        const parts = iconParts[id];
        if (!parts) throw new Error(`Unknown icon: ${String(id)}`);
        raster = composeSprites(parts.map(layerOf));
        built.set(id, raster);
    }
    return raster;
}
