import { mirrorMask, type PixelMask } from "../core/maskUtils";

export const headOrientations = { front: 1, left: 1, right: 1, back: 1 } as const;
export type HeadOrientation = keyof typeof headOrientations;

/** A part drawn once from the front and once from the side, facing right. The back view reuses the front unless it has its own. */
export interface ViewMasks {
    readonly front: PixelMask;
    readonly side: PixelMask;
    readonly back?: PixelMask;
}

/** Picks the mask for an orientation. Facing left is the side mask flipped. */
export function maskForView(masks: ViewMasks, orientation: HeadOrientation): PixelMask {
    switch (orientation) {
        case "left":
            return mirrorMask(masks.side);
        case "right":
            return masks.side;
        case "back":
            return masks.back ?? masks.front;
        default:
            return masks.front;
    }
}
