import type { PixelMask } from "../../core/maskUtils";

/** A floppy disk with its top right corner cut off. */
export const saveMask: PixelMask = [
    "11111111111100",
    "11111111111110",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111"
];

export const saveShutter: PixelMask = ["11111111", "11111111", "11111111"];

export const saveLabel: PixelMask = ["11111111", "11111111", "11111111", "11111111", "11111111"];
