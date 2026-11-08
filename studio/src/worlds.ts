import { defineMap, houseTileset, townTileset, type ObjectId, type PlacedObject } from "../../src";

const at = (id: ObjectId, ...spots: [number, number][]): PlacedObject[] => spots.map(([x, y]) => ({ id, x, y }));

// Terrain is one character per 2x2-tile block. Objects are placed in tile coordinates on top and shaded automatically.
export const townMap = defineMap(townTileset, [
    "gggggggggg",
    "gg<==>gggg",
    "gg[__]gggg",
    "gggpggggtt",
    "gggpgABCgt",
    "gggpgDEFgt",
    "gggpgGHIgt",
    "gggpsssssg",
    "gggpwwwwwg"
], [
    ...at("tree", [0, 0], [2, 0], [17, 0], [19, 0], [1, 8], [16, 10]),
    ...at("window", [5, 4], [10, 4]),
    ...at("door", [7, 5]),
    ...at("fence", [10, 6], [11, 6], [12, 6], [13, 6]),
    ...at("flower", [2, 7], [3, 10], [4, 13], [18, 2])
]);

export const houseMap = defineMap(houseTileset, [
    "hhhhhhhh",
    "ffffffff",
    "ffffffff",
    "ffffffff",
    "ffffffff",
    "hhhhhhhh"
], [
    ...at("window", [3, 1], [11, 1]),
    ...at("bookshelf", [1, 2], [2, 2], [13, 2], [14, 2]),
    ...at("counter", [5, 4], [7, 4], [9, 4]),
    ...at("rug", [7, 7]),
    ...at("door", [7, 11])
]);

export const worlds = { Town: townMap, House: houseMap } as const;
export type WorldName = keyof typeof worlds;

/** A small town that fits in a card: a house, a path, a tree and some flowers (160x96 px). */
export const miniTown = defineMap(townTileset, [
    "k<=>k",
    "g[_]g",
    "ggpgg"
], [
    ...at("tree", [0, 2]),
    ...at("window", [2, 2], [6, 2]),
    ...at("door", [4, 3]),
    ...at("flower", [8, 4])
]);
