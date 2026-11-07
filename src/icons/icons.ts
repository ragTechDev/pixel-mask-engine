import { composeSprites, type Layer, type Raster } from "../core/compose";
import type { PixelMask } from "../core/maskUtils";
import { defineSprite, rampSlots, shadeMask, type Ramp, type Sprite } from "../core/sprite";
import {
    basketMask, basketWeave, bubbleDots, bubbleMask, doveBody, doveLegs, doveWing, heartMask,
    letterBig, letterFlapBig, letterFlapMid, letterFlapSmall, letterMid, letterSmall, loafMask,
    sealMask, wingLeft, wingRight
} from "./masks";
import { iconInk, iconRamps } from "./ramps";

export type IconId =
    | "heart"
    | "heart_empty"
    | "comment"
    | "basket"
    | "bird_letter"
    | "bird_letter_idle"
    | "bird_perch"
    | "winged_letter";

export const iconIds: IconId[] = [
    "heart",
    "heart_empty",
    "comment",
    "basket",
    "bird_letter",
    "bird_letter_idle",
    "bird_perch",
    "winged_letter"
];

type Part =
    | { readonly shaded: PixelMask; readonly ramp: Ramp; readonly x: number; readonly y: number }
    | { readonly flat: PixelMask; readonly color: string; readonly x: number; readonly y: number };

const dot: PixelMask = ["1"];
const beak: PixelMask = ["11"];

/**
 * A messenger bird carrying a letter. The letter sits behind the bird so the beak holds it. The
 * active icon is in full colour with a wax seal; the idle one is faded and unsealed.
 */
function birdWithLetter(active: boolean): readonly Part[] {
    const bird = active ? iconRamps.dove : iconRamps.dove_idle;
    const wing = active ? iconRamps.dove_wing : iconRamps.dove_wing_idle;
    const letter = active ? iconRamps.cream : iconRamps.cream_idle;
    return [
        { shaded: letterSmall, ramp: letter, x: 10, y: 1 },
        { flat: letterFlapSmall, color: active ? iconInk.flap : iconInk.flap_idle, x: 10, y: 1 },
        ...(active ? [{ flat: sealMask, color: iconInk.seal, x: 12, y: 2 } as Part] : []),
        { shaded: doveBody, ramp: bird, x: 0, y: 0 },
        { shaded: doveWing, ramp: wing, x: 2, y: 3 },
        { flat: doveLegs, color: active ? iconInk.legs : iconInk.legs_idle, x: 5, y: 8 },
        { flat: dot, color: iconInk.eye, x: 8, y: 1 },
        { flat: beak, color: iconInk.beak, x: 11, y: 2 }
    ];
}

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
    ],
    bird_letter: birdWithLetter(true),
    bird_letter_idle: birdWithLetter(false),
    // A bird perched on a sealed letter.
    bird_perch: [
        { shaded: letterBig, ramp: iconRamps.cream, x: 0, y: 9 },
        { flat: letterFlapBig, color: iconInk.flap, x: 0, y: 9 },
        { flat: sealMask, color: iconInk.seal, x: 6, y: 12 },
        { shaded: doveBody, ramp: iconRamps.dove, x: 1, y: 0 },
        { shaded: doveWing, ramp: iconRamps.dove_wing, x: 3, y: 3 },
        { flat: dot, color: iconInk.eye, x: 9, y: 1 },
        { flat: dot, color: iconInk.beak, x: 12, y: 2 }
    ],
    // A sealed letter with a wing on each side.
    winged_letter: [
        { shaded: wingLeft, ramp: iconRamps.dove_wing, x: 0, y: 0 },
        { shaded: wingRight, ramp: iconRamps.dove_wing, x: 13, y: 0 },
        { shaded: letterMid, ramp: iconRamps.cream, x: 4, y: 4 },
        { flat: letterFlapMid, color: iconInk.flap, x: 4, y: 4 },
        { flat: sealMask, color: iconInk.seal, x: 8, y: 7 }
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
