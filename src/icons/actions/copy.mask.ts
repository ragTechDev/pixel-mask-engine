import type { PixelMask } from "../../core/maskUtils";

/** One sheet of paper with a folded top right corner. */
export const sheetMask: PixelMask = [
    "1111111110",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111",
    "1111111111"
];

export const sheetLines: PixelMask = ["11111111", "00000000", "11111111", "00000000", "11111100"];
