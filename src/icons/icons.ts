import { composeSprites, type Layer, type Raster } from "../core/compose";
import { defineSprite, rampSlots, shadeMask, type Ramp, type Sprite } from "../core/sprite";
import { basketMask, basketWeave, bubbleDots, bubbleMask, heartMask, loafMask } from "./masks";
import { iconInk, iconRamps } from "./ramps";
import type { PixelMask } from "../core/maskUtils";

export type IconId = "heart" | "heart_empty" | "comment" | "basket";

export const iconIds: IconId[] = ["heart", "heart_empty", "comment", "basket"];

type Part =
    | { readonly shaded: PixelMask; readonly ramp: Ramp; readonly x: number; readonly y: number }
    | { readonly flat: PixelMask; readonly color: string; readonly x: number; readonly y: number };

/** Parts are drawn in order, later parts on top. Positions are in icon pixels. */
const iconParts: Record<IconId, readonly Part[]> = {
    heart: [{ shaded: heartMask, ramp: iconRamps.heart, x: 0, y: 0 }],
    heart_empty: [{ shaded: heartMask, ramp: iconRamps.cream, x: 0, y: 0 }],
    comment: [
        { shaded: bubbleMask, ramp: iconRamps.cream, x: 0, y: 0 },
        { flat: bubbleDots, color: iconInk.dark, x: 4, y: 2 }
    ],
    // A basket of bread, passed hand to hand.
    basket: [
        { shaded: loafMask, ramp: iconRamps.bread, x: 2, y: 0 },
        { shaded: basketMask, ramp: iconRamps.wicker, x: 0, y: 4 },
        { flat: basketWeave, color: iconInk.dark, x: 2, y: 7 }
    ]
};

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
