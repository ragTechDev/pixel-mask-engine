import { defineTileSet } from "../tileset";

/**
 * Interior tileset: floor, walls, a counter, a rug and bookshelves.
 * Block keys: f floor, h wall, W window wall, d door, c counter, b bookshelf, r rug.
 */
export const houseTileset = defineTileSet({
    id: "house",
    blocks: {
        f: [["floor", "floor"], ["floor", "floor"]],
        h: [["wall", "wall"], ["wall", "wall"]],
        W: [["wall", "window"], ["wall", "wall"]],
        d: [["wall", "wall"], ["wall", "door"]],
        c: [["counter", "counter"], ["floor", "floor"]],
        b: [["bookshelf", "bookshelf"], ["floor", "floor"]],
        r: [["rug", "rug"], ["rug", "rug"]]
    },
    solid: ["wall", "window", "counter", "bookshelf"],
    counter: ["counter"],
    door: ["door"]
});
