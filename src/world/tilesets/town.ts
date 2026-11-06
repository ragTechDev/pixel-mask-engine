import { defineTileSet } from "../tileset";

/**
 * Outdoor tileset: grass, paths, water and building walls.
 * Block keys: g grass, G tall grass, p path, w water, s shore, h wall.
 * Trees, fences, flowers, doors and windows are objects placed on top.
 */
export const townTileset = defineTileSet({
    id: "town",
    blocks: {
        g: [["grass", "grass"], ["grass", "grass"]],
        G: [["tall_grass", "tall_grass"], ["tall_grass", "tall_grass"]],
        p: [["path", "path"], ["path", "path"]],
        w: [["water", "water"], ["water", "water"]],
        s: [["shore", "shore"], ["water", "water"]],
        h: [["wall", "wall"], ["wall", "wall"]]
    },
    solid: ["water", "wall"],
    water: ["water"],
    grass: ["tall_grass"]
});
