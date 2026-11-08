import type { PixelMask } from "../../core/maskUtils";
import { bowTiltedMask } from "../masks/hair/accessories/bowTilted.mask";
import { bowMask } from "../masks/hair/accessories/bow.mask";
import { hairtieTiltedMask } from "../masks/hair/accessories/hairtieTilted.mask";
import { hairtieMask } from "../masks/hair/accessories/hairtie.mask";
import { scrunchieTiltedMask } from "../masks/hair/accessories/scrunchieTilted.mask";
import { scrunchieMask } from "../masks/hair/accessories/scrunchie.mask";

/** Something that ties up a ponytail or pigtails. Each takes a colour of its own. */
export const hairAccessories = { none: 1, hairtie: 1, scrunchie: 1, bow: 1 } as const;
export type HairAccessory = keyof typeof hairAccessories;

/**
 * A mask that slants across a sloping tail. `centre` is the column of the mask that goes on the tie, in the mask
 * as drawn for a tail that slopes down to the right, and `up` is how many rows of it are above the tie row.
 */
export type TiltedMask = { mask: PixelMask; centre: number; up: number };

/**
 * The mask of each accessory, and how many rows it reaches above the row the tail is tied on. Every accessory
 * also has a tilted mask, for a tail that slopes: it slants across the tail instead of lying flat.
 */
export const accessoryParts: Record<Exclude<HairAccessory, "none">, { mask: PixelMask; above: number; tilted: TiltedMask; outlined: boolean }> = {
    // A hairtie is a single line of pixels, so it is drawn in its colour alone: an outline would be most of it.
    hairtie: { mask: hairtieMask, above: 0, tilted: { mask: hairtieTiltedMask, centre: 1, up: 1 }, outlined: false },
    scrunchie: { mask: scrunchieMask, above: 1, tilted: { mask: scrunchieTiltedMask, centre: 2, up: 1 }, outlined: true },
    bow: { mask: bowMask, above: 1, tilted: { mask: bowTiltedMask, centre: 2, up: 2 }, outlined: true }
};
