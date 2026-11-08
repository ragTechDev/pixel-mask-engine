import type { PixelMask } from "../../core/maskUtils";

/** How the hair falls, from straight to the tightest coils. Straight leaves the hair masks as drawn. */
export const hairTextures = { straight: 1, wavy: 1, curly: 1, coiled: 1 } as const;
export type HairTexture = keyof typeof hairTextures;

/** Columns added to each side of a textured mask, to make room for the extra pixels. */
const PAD = 2;

/** Extra pixels at the left and right edge of each row, repeating down the hair. */
const patterns: Record<Exclude<HairTexture, "straight">, readonly (readonly [number, number])[]> = {
    // The edges swing from one side to the other, like an S.
    wavy: [[1, 0], [1, 0], [0, 1], [0, 1]],
    // Round bumps on both edges, two rows tall.
    curly: [[1, 1], [1, 1], [0, 0]],
    // Tight, full coils.
    coiled: [[2, 2], [1, 1], [2, 2]]
};

/** How far a texture moves the left edge of a mask, so layers can be shifted back into place. */
export const texturePad = (texture: HairTexture): number => (texture === "straight" ? 0 : PAD);

const done = new Map<HairTexture, WeakMap<PixelMask, PixelMask>>();

/** Adds a texture to the edges of a hair mask. Memoised, so the same mask always gives the same object. */
export function textureMask(mask: PixelMask, texture: HairTexture): PixelMask {
    if (texture === "straight") return mask;
    let masks = done.get(texture);
    if (!masks) done.set(texture, (masks = new WeakMap()));
    let result = masks.get(mask);
    if (!result) {
        const pattern = patterns[texture];
        result = mask.map((row, y) => {
            const cells = [..."0".repeat(PAD), ...row, ..."0".repeat(PAD)];
            const first = cells.indexOf("1");
            const last = cells.lastIndexOf("1");
            if (first < 0) return cells.join("");
            const [left, right] = pattern[y % pattern.length];
            for (let i = 1; i <= left; i += 1) cells[first - i] = "1";
            for (let i = 1; i <= right; i += 1) cells[last + i] = "1";
            return cells.join("");
        });
        masks.set(mask, result);
    }
    return result;
}
