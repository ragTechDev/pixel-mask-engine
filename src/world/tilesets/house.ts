import { defineTileSet } from "../tileset";

/**
 * Interior tileset: floor and walls. Block keys: f floor, h wall.
 * Doors, windows, counters, rugs and bookshelves are objects placed on top.
 */
export const houseTileset = defineTileSet({
    id: "house",
    blocks: {
        f: [["floor", "floor"], ["floor", "floor"]],
        h: [["wall", "wall"], ["wall", "wall"]]
    },
    solid: ["wall"]
});
