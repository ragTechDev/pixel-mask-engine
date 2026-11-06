import { defineTileSet } from "../tileset";

/**
 * Outdoor tileset: grass, paths, water, trees, fences and a building front.
 * Block keys: g grass, G tall grass, p path, w water, s shore, T tree,
 * f fence, F flowers, h wall, W window wall, d door wall.
 */
export const townTileset = defineTileSet({
    id: "town",
    blocks: {
        g: [["grass", "grass"], ["grass", "grass"]],
        G: [["tall_grass", "tall_grass"], ["tall_grass", "tall_grass"]],
        p: [["path", "path"], ["path", "path"]],
        w: [["water", "water"], ["water", "water"]],
        s: [["shore", "shore"], ["water", "water"]],
        T: [["tree", "tree"], ["tree", "tree"]],
        f: [["fence", "fence"], ["grass", "grass"]],
        F: [["flower", "grass"], ["grass", "flower"]],
        h: [["wall", "wall"], ["wall", "wall"]],
        W: [["wall", "window"], ["wall", "wall"]],
        d: [["wall", "wall"], ["wall", "door"]]
    },
    solid: ["tree", "fence", "wall", "window", "water"],
    water: ["water"],
    grass: ["tall_grass"],
    door: ["door"]
});
