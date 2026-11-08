import type { IconId, ObjectId, TileId } from "../../src";

export const idLabel = (id: string) => id.replaceAll("_", " ");

/** Tiles come in families (a nine-patch roof, pavement, wall); everything else is plain terrain. */
export function tileGroup(id: TileId): string {
    if (id.startsWith("roof")) return "Roofs";
    if (id.startsWith("beige_pavement")) return "Pavement";
    if (id.startsWith("wall")) return "Walls";
    return "Terrain";
}
export const tileGroups = ["Terrain", "Pavement", "Roofs", "Walls"] as const;

export const objectLabel: Record<ObjectId, string> = {
    tree: "Tree", fence: "Fence", door: "Door", window: "Window",
    counter: "Counter", bookshelf: "Bookshelf", rug: "Rug", flower: "Flowers"
};
export const categoryLabel = (c: string) => c.replaceAll("-", " & ");
export type { IconId };
