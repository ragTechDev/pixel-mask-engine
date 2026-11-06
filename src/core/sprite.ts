import { computeHighlightPixels, computeOutlinePixels, computeShadowPixels } from "./lighting";
import { forEachFilledPixel, fromPointKey, getMaskHeight, getMaskWidth, type PixelMask } from "./maskUtils";

/** A fixed four-tone colour ramp. Ramps only come from the built-in palette tables. */
export type Ramp = {
    readonly base: string;
    readonly shadow: string;
    readonly highlight: string;
    readonly outline: string;
};

/**
 * The single image primitive shared by avatars, tiles and (later) furniture,
 * decor and pets: a grid of palette-slot indices plus an origin.
 * Slot 0 is always transparent.
 */
export interface Sprite {
    readonly width: number;
    readonly height: number;
    /** Position of pixel (0,0) relative to the layer's anchor point. */
    readonly originX: number;
    readonly originY: number;
    readonly px: Uint8Array;
}

/** Slot layout produced by `shadeMask`, used with `rampSlots`. */
export const SLOT = { outline: 1, base: 2, shadow: 3, highlight: 4 } as const;

/** Maps a ramp to the slot layout used by `shadeMask`. */
export function rampSlots(ramp: Ramp): readonly string[] {
    return ["", ramp.outline, ramp.base, ramp.shadow, ramp.highlight];
}

/**
 * Turns a "0"/"1" shape mask into an auto-shaded sprite. The sprite is padded
 * by one pixel on each side so the outline fits.
 */
export function shadeMask(mask: PixelMask): Sprite {
    const width = getMaskWidth(mask) + 2;
    const height = getMaskHeight(mask) + 2;
    const px = new Uint8Array(width * height);
    const paint = (keys: Set<string>, slot: number) => {
        for (const key of keys) {
            const { x, y } = fromPointKey(key);
            px[(y + 1) * width + x + 1] = slot;
        }
    };

    // Same precedence as the original renderer's paint order.
    paint(computeOutlinePixels(mask), SLOT.outline);
    forEachFilledPixel(mask, ({ x, y }) => {
        px[(y + 1) * width + x + 1] = SLOT.base;
    });
    paint(computeShadowPixels(mask), SLOT.shadow);
    paint(computeHighlightPixels(mask), SLOT.highlight);

    return { width, height, originX: -1, originY: -1, px };
}

/** Builds a sprite from string rows, mapping each character through `legend` (unknown = transparent). */
export function defineSprite(rows: readonly string[], legend: Readonly<Record<string, number>>): Sprite {
    const width = rows[0]?.length ?? 0;
    const height = rows.length;
    const px = new Uint8Array(width * height);
    rows.forEach((row, y) => {
        for (let x = 0; x < width; x += 1) {
            px[y * width + x] = legend[row[x]] ?? 0;
        }
    });
    return { width, height, originX: 0, originY: 0, px };
}

/** Builds a sprite from a numeric index grid (0 = transparent). */
export function spriteFromGrid(grid: readonly (readonly number[])[]): Sprite {
    const width = grid[0]?.length ?? 0;
    const height = grid.length;
    const px = new Uint8Array(width * height);
    grid.forEach((row, y) => row.forEach((v, x) => (px[y * width + x] = v)));
    return { width, height, originX: 0, originY: 0, px };
}
