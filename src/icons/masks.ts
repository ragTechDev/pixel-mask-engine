import type { PixelMask } from "../core/maskUtils";

// DRAFT icon parts, to be redrawn by hand. "1" is filled, "0" is empty; the outline, highlight and
// shadow are added automatically, as for avatar and object parts.

export const heartMask: PixelMask = [
    "0011100011100",
    "0111110111110",
    "1111111111111",
    "1111111111111",
    "1111111111111",
    "0111111111110",
    "0011111111100",
    "0001111111000",
    "0000111110000",
    "0000011100000",
    "0000001000000"
];

export const bubbleMask: PixelMask = [
    "0111111111110",
    "1111111111111",
    "1111111111111",
    "1111111111111",
    "1111111111111",
    "0111111111110",
    "0011111000000",
    "0001110000000",
    "0001100000000",
    "0001000000000"
];

/** Three dots, drawn flat (not shaded) so each stays a single pixel. */
export const bubbleDots: PixelMask = ["10101"];

export const loafMask: PixelMask = [
    "0011111100",
    "0111111110",
    "1111111111",
    "1111111111",
    "1111111111"
];

export const basketMask: PixelMask = [
    "11111111111111",
    "11111111111111",
    "01111111111110",
    "01111111111110",
    "00111111111100",
    "00111111111100",
    "00011111111000"
];

/** Weave marks across the basket, drawn flat. */
export const basketWeave: PixelMask = [
    "1010101010",
    "0101010101",
    "1010101010"
];
