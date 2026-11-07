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

export const loafMask: PixelMask = ["0011111100", "0111111110", "1111111111", "1111111111", "1111111111"];

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
export const basketWeave: PixelMask = ["1010101010", "0101010101", "1010101010"];

/** A dove facing right: tail on the left, head on the right. */
export const doveBody: PixelMask = [
    "000000011100",
    "000000111110",
    "000001111110",
    "011111111110",
    "111111111110",
    "011111111100",
    "001111111000",
    "000011110000"
];
export const doveWing: PixelMask = ["011110", "111111", "011100"];
export const doveLegs: PixelMask = ["1010"];

/** A small letter the bird carries, and its flap. */
export const letterSmall: PixelMask = ["111111", "111111", "111111", "111111"];
export const letterFlapSmall: PixelMask = ["100001", "010010", "001100"];

/** A larger letter for the bird to perch on, its flap, and the seal. */
export const letterBig: PixelMask = [
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111"
];
export const letterFlapBig: PixelMask = [
    "10000000000001",
    "01000000000010",
    "00100000000100",
    "00010000001000",
    "00001000010000",
    "00000110110000"
];
export const sealMask: PixelMask = ["11", "11"];

/** A letter with a wing on each side. */
export const wingLeft: PixelMask = ["00011", "00111", "01111", "11110", "11100"];
export const wingRight: PixelMask = ["11000", "11100", "11110", "01111", "00111"];
export const letterMid: PixelMask = ["1111111111", "1111111111", "1111111111", "1111111111", "1111111111"];
export const letterFlapMid: PixelMask = ["1000000001", "0100000010", "0010000100", "0001001000", "0000110000"];
