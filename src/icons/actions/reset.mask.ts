import type { PixelMask } from "../../core/maskUtils";

/** A curved arrow that turns back: an arrowhead on the left, an arc that returns beneath it. */
export const resetMask: PixelMask = [
    "00001000000000",
    "00011000000000",
    "00111111111100",
    "01111111111110",
    "00111100001111",
    "00011000000111",
    "00001000000111",
    "00000000001111",
    "00000111111110",
    "00000111111100"
];
