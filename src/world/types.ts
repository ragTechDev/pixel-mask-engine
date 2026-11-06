/** Tiles in `src/world/tiles/tileMasks.ts` (road and pavement). */
export type RoadTileId = "road" | "beige_pavement" | "brick_pavement";

/** Tiles in `src/world/tiles/townMasks.ts` (outdoor and interior building blocks). */
export type TownTileId =
    | "grass"
    | "tall_grass"
    | "path"
    | "water"
    | "shore"
    | "tree"
    | "fence"
    | "flower"
    | "wall"
    | "floor"
    | "door"
    | "window"
    | "counter"
    | "rug"
    | "bookshelf";

export type TileId = RoadTileId | TownTileId;
