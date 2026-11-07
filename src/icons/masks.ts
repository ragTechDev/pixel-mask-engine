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

export const envelopeMask: PixelMask = [
    "11111111111111", "11111111111111", "11111111111111", "11111111111111", "11111111111111",
    "11111111111111", "11111111111111", "11111111111111", "11111111111111"
];
export const envelopeFlap: PixelMask = [
    "10000000000001", "01000000000010", "00100000000100", "00010000001000",
    "00001000010000", "00000100100000", "00000011000000"
];
export const mailboxBody: PixelMask = [
    "00111111111100", "01111111111110", "11111111111111", "11111111111111",
    "11111111111111", "11111111111111", "11111111111111"
];
export const mailboxPost: PixelMask = ["11", "11", "11", "11"];
export const mailboxFlag: PixelMask = ["1111", "1111"];
export const mailboxPole: PixelMask = ["1", "1", "1", "1", "1", "1"];
export const mailboxSlot: PixelMask = ["11111"];
export const noteMask: PixelMask = [
    "111111111111", "111111111111", "111111111111", "111111111111", "111111111111",
    "111111111111", "111111111111", "111111111111", "111111111111"
];
export const ribbonBand: PixelMask = ["111111111111", "111111111111"];
export const ribbonKnot: PixelMask = ["1111", "1111"];
export const bookmarkMask: PixelMask = [
    "111111111", "111111111", "111111111", "111111111", "111111111", "111111111",
    "111111111", "111111111", "111111111", "111101111", "111000111", "110000011"
];
export const pinnedNote: PixelMask = [
    "11111111111", "11111111111", "11111111111", "11111111111", "11111111111",
    "11111111111", "11111111111", "11111111111", "11111111111"
];
export const noteLines: PixelMask = ["11111111", "00000000", "11111100", "00000000", "11111111"];
export const pinMask: PixelMask = ["11", "11"];
export const jarLid: PixelMask = ["11111111", "11111111"];
export const jarBody: PixelMask = [
    "0111111110", "1111111111", "1111111111", "1111111111", "1111111111", "1111111111", "0111111110"
];
export const jarJam: PixelMask = ["111111", "111111", "111111", "111111"];

// Navigation icons: a cottage, a quill and ink pot, and a wooden cog.
export const cottageChimney: PixelMask = ["11", "11", "11"];
export const cottageRoof: PixelMask = [
    "00000111100000",
    "00001111110000",
    "00011111111000",
    "00111111111100",
    "01111111111110",
    "11111111111111"
];
export const cottageWalls: PixelMask = ["111111111111", "111111111111", "111111111111", "111111111111", "111111111111"];
export const cottageDoor: PixelMask = ["111", "111", "111", "111"];
export const cottageWindow: PixelMask = ["11", "11"];

export const quillFeather: PixelMask = [
    "0000000000000",
    "0000000000000",
    "0000000111100",
    "0000011111100",
    "0000111111100",
    "0000111111100",
    "0001111111000",
    "0001111111000",
    "0011111110000",
    "0011111000000",
    "0011100000000",
    "0000000000000",
    "0000000000000"
];
/** The shaft, drawn flat along the feather's spine, ending in a nib. */
export const quillShaft: PixelMask = [
    "0000000000000",
    "0000000000010",
    "0000000000100",
    "0000000001000",
    "0000000010000",
    "0000000100000",
    "0000001000000",
    "0000010000000",
    "0000100000000",
    "0001000000000",
    "0010000000000",
    "0100000000000",
    "1000000000000"
];
export const quillInkPot: PixelMask = ["011110", "111111", "111111", "111111", "011110"];

export const cogMask: PixelMask = [
    "000000111000000",
    "000000111000000",
    "001100111001100",
    "001111111111100",
    "000111111111000",
    "000111101111000",
    "111111000111111",
    "111110000011111",
    "111111000111111",
    "000111101111000",
    "000111111111000",
    "001111111111100",
    "001100111001100",
    "000000111000000",
    "000000111000000"
];

// Feed icon candidates: a map of the willage, a row of cottages, and a notice board.
export const mapPaper: PixelMask = [
    "11111111111111", "11111111111111", "11111111111111", "11111111111111", "11111111111111",
    "11111111111111", "11111111111111", "11111111111111", "11111111111111", "11111111111111"
];
export const mapHill: PixelMask = ["0011100", "0111110", "1111111"];
export const mapRiver: PixelMask = [
    "00000000000100", "00000000001100", "00000000011000", "00000001110000", "00000011000000", "00001110000000"
];
export const mapHouseRoof: PixelMask = ["0110", "1111"];
export const mapHouseWall: PixelMask = ["1111", "1111"];
export const mapPath: PixelMask = ["1010101"];

/** A row of three small cottages, no wider than the single cottage: a taller one between two. */
export const rowSideRoof: PixelMask = ["0110", "1111"];
export const rowSideWalls: PixelMask = ["1111", "1111", "1111", "1111"];
export const rowMidRoof: PixelMask = ["001100", "011110", "111111"];
export const rowMidWalls: PixelMask = ["111111", "111111", "111111", "111111", "111111"];
export const rowDoor: PixelMask = ["1", "1"];
/** A small bush that sits in front of the joins between the houses. */
export const rowBush: PixelMask = ["010", "111"];
export const rowBushShade: PixelMask = ["000", "111"];
export const rowBushLight: PixelMask = ["010", "000"];

export const boardMask: PixelMask = [
    "11111111111111", "11111111111111", "11111111111111", "11111111111111", "11111111111111",
    "11111111111111", "11111111111111", "11111111111111"
];
export const boardPost: PixelMask = ["11", "11", "11", "11"];
export const boardNoteA: PixelMask = ["1111", "1111", "1111"];
export const boardNoteB: PixelMask = ["111", "111", "111", "111"];
export const boardNoteLines: PixelMask = ["111", "000", "111"];
