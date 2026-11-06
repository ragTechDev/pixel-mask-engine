/** Road and pavement tiles (`src/world/masks/tiles`). */
export type RoadTileId = "road" | "beige_pavement" | "brick_pavement";

/** Terrain tiles for towns and interiors (`src/world/masks/tiles`). */
export type TownTileId = "grass" | "tall_grass" | "path" | "water" | "shore" | "wall" | "floor";

export type TileId = RoadTileId | TownTileId;

/** Things that stand on or sit over the terrain. They are shaded sprites, not tiles. */
export type ObjectId = "tree" | "fence" | "door" | "window" | "counter" | "bookshelf" | "rug" | "flower";
