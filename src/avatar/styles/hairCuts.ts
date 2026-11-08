import type { PixelMask } from "../../core/maskUtils";

/** How the ends of loose hair are cut. */
export type HairCut = "blunt" | "v" | "u";

/** How many pixels a rounded cut trims from each side, bottom row first, for a run of hair this wide. */
function roundedTrim(width: number): readonly number[] {
    if (width >= 11) return [3, 2, 1];
    if (width >= 7) return [2, 1];
    if (width >= 5) return [1];
    return [];
}

const done = new Map<HairCut, WeakMap<PixelMask, PixelMask>>();

/**
 * Cuts the bottom of a hair mask. `rows` is how many rows hang below the head, which is as far up as the cut
 * can reach. Blunt is the mask as drawn; U rounds the bottom corners; V carves both sides in towards the
 * middle, so the hair is longest in the centre. Each run of hair is cut on its own, so strands come to a
 * point or a curve too. Memoised, so the same mask always gives the same object.
 */
export function cutMask(mask: PixelMask, cut: HairCut, rows: number): PixelMask {
    if (cut === "blunt") return mask;
    let masks = done.get(cut);
    if (!masks) done.set(cut, (masks = new WeakMap()));
    let result = masks.get(mask);
    if (!result) {
        const out = mask.map((row) => [...row]);
        // A V is only three rows deep, so its sides slope gently instead of dropping to a spike.
        const depth = cut === "v" ? Math.min(rows, 3) : rows;
        for (let i = 0; i < Math.min(depth, out.length); i += 1) {
            const row = out[out.length - 1 - i];
            for (const match of mask[mask.length - 1 - i].matchAll(/1+/g)) {
                const start = match.index!;
                const width = match[0].length;
                const room = Math.floor((width - 1) / 2);
                const trim = cut === "v" ? Math.floor((room * (depth - i)) / depth + 0.5) : roundedTrim(width)[i] ?? 0;
                const t = Math.min(trim, room);
                for (let k = 0; k < t; k += 1) {
                    row[start + k] = "0";
                    row[start + width - 1 - k] = "0";
                }
            }
        }
        result = out.map((row) => row.join(""));
        masks.set(mask, result);
    }
    return result;
}
