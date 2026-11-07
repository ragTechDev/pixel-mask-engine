import type { PixelMask } from "../../core/maskUtils";
import { beigePavementGroutMask } from "../masks/tiles/beigePavement/grout.mask";
import { beigePavementLightMask } from "../masks/tiles/beigePavement/light.mask";
import { beigePavementShadeMask } from "../masks/tiles/beigePavement/shade.mask";
import { brickPavementLightMask } from "../masks/tiles/brickPavement/light.mask";
import { brickPavementMortarMask } from "../masks/tiles/brickPavement/mortar.mask";
import { curbLightMask } from "../masks/tiles/edges/curb/light.mask";
import { curbOuterMask } from "../masks/tiles/edges/curb/outer.mask";
import { curbShadeMask } from "../masks/tiles/edges/curb/shade.mask";
import { eaveCastMask } from "../masks/tiles/edges/roof/eave/cast.mask";
import { eaveEdgeMask } from "../masks/tiles/edges/roof/eave/edge.mask";
import { eaveShadeMask } from "../masks/tiles/edges/roof/eave/shade.mask";
import { rakeEdgeMask } from "../masks/tiles/edges/roof/rake/edge.mask";
import { rakeShadeMask } from "../masks/tiles/edges/roof/rake/shade.mask";
import { ridgeEdgeMask } from "../masks/tiles/edges/roof/ridge/edge.mask";
import { ridgeLightMask } from "../masks/tiles/edges/roof/ridge/light.mask";
import { ridgeShadeMask } from "../masks/tiles/edges/roof/ridge/shade.mask";
import { shoreFoamMask } from "../masks/tiles/edges/shore/foam.mask";
import { shoreOuterMask } from "../masks/tiles/edges/shore/outer.mask";
import { shoreSandMask } from "../masks/tiles/edges/shore/sand.mask";
import { shoreSandShadeMask } from "../masks/tiles/edges/shore/sandShade.mask";
import { baseFoundationMask } from "../masks/tiles/edges/wall/base/foundation.mask";
import { baseShadeMask } from "../masks/tiles/edges/wall/base/shade.mask";
import { postFoundationMask } from "../masks/tiles/edges/wall/post/foundation.mask";
import { postShadeMask } from "../masks/tiles/edges/wall/post/shade.mask";
import { floorMask } from "../masks/tiles/floor.mask";
import { grassLightMask } from "../masks/tiles/grass/light.mask";
import { grassShadeMask } from "../masks/tiles/grass/shade.mask";
import { pathLightMask } from "../masks/tiles/path/light.mask";
import { pathShadeMask } from "../masks/tiles/path/shade.mask";
import { roadCurbMask } from "../masks/tiles/road/curb.mask";
import { roadLineMask } from "../masks/tiles/road/line.mask";
import { roofLightMask } from "../masks/tiles/roof/light.mask";
import { roofShadeMask } from "../masks/tiles/roof/shade.mask";
import { skyLightMask } from "../masks/tiles/sky/light.mask";
import { tallGrassLightMask } from "../masks/tiles/tallGrass/light.mask";
import { tallGrassShadeMask } from "../masks/tiles/tallGrass/shade.mask";
import { wallMask } from "../masks/tiles/wall.mask";
import { waterLightMask } from "../masks/tiles/water/light.mask";
import { waterShadeMask } from "../masks/tiles/water/shade.mask";
import { TILE_SIZE } from "../size";
import type { TileId } from "../types";
import type { TileColor } from "./palettes";

// How every tile is built. Tile art is 0/1 masks, and colours are only named:
//
// - A material is a base colour plus detail layers. Each layer is a 16×16 mask
//   painted in one named colour over the layers below it.
// - An edge tile is an inner material with edge strips painted on the open
//   sides, so one set of strips serves every corner and side. A strip can paint
//   a colour or the pixels of another tile (the outside of a pavement is grass).
//
// Recolouring is a matter of choosing another fixed palette (see palettes.ts).

export interface Layer {
    readonly mask: PixelMask;
    readonly color: TileColor;
}

export interface Material {
    readonly base: TileColor;
    readonly layers: readonly Layer[];
}

export type Side = "top" | "bottom" | "left" | "right";

/** One strip per layer name. Strip rows run from the open edge inward and are 16 wide. */
export type Profile = Readonly<Record<string, PixelMask>>;

/** What a strip layer paints: a colour, or the pixels of another tile. */
export type Paint = TileColor | { readonly tile: TileId };

export interface EdgeFamily {
    /** Layer names, bottom to top. Where strips overlap, the later layer wins. */
    readonly order: readonly string[];
    readonly profiles: Readonly<Partial<Record<Side, Profile>>>;
    readonly paint: Readonly<Record<string, Paint>>;
}

export interface EdgeTile {
    readonly inner: TileId;
    readonly family: EdgeFamily;
    readonly sides: readonly Side[];
}

export type TileDef = Material | EdgeTile;

const material = (base: TileColor, ...layers: [PixelMask, TileColor][]): Material => ({
    base,
    layers: layers.map(([mask, color]) => ({ mask, color }))
});

const edge = (inner: TileId, family: EdgeFamily, ...sides: Side[]): EdgeTile => ({ inner, family, sides });

// ─── Edge families ──────────────────────────────────────────────────────────

const curbStrips: Profile = { outer: curbOuterMask, shade: curbShadeMask, light: curbLightMask };
/** A pavement curb on every side, with grass outside it. */
const pavementEdges: EdgeFamily = {
    order: ["light", "shade", "outer"],
    profiles: { top: curbStrips, bottom: curbStrips, left: curbStrips, right: curbStrips },
    paint: { light: "pavementLight", shade: "pavementShade", outer: { tile: "grass" } }
};

const rakeStrips: Profile = { edge: rakeEdgeMask, shade: rakeShadeMask };
/** A roof: ridge on top, eave on the bottom, rake edges on the sides. */
const roofEdges: EdgeFamily = {
    order: ["light", "shade", "cast", "edge"],
    profiles: {
        top: { edge: ridgeEdgeMask, light: ridgeLightMask, shade: ridgeShadeMask },
        bottom: { cast: eaveCastMask, edge: eaveEdgeMask, shade: eaveShadeMask },
        left: rakeStrips,
        right: rakeStrips
    },
    paint: { light: "roofLight", shade: "roofShade", cast: "roofCast", edge: "roofEdge" }
};

const postStrips: Profile = { foundation: postFoundationMask, shade: postShadeMask };
/** A house wall: corner posts on the sides and a stone foundation at the bottom. */
const wallEdges: EdgeFamily = {
    order: ["shade", "foundation"],
    profiles: {
        left: postStrips,
        right: postStrips,
        bottom: { foundation: baseFoundationMask, shade: baseShadeMask }
    },
    paint: { shade: "wallShade", foundation: "wallFoundation" }
};

/** The edge of a body of water: grass, a sandy strip, then foam on the water. */
const shoreEdges: EdgeFamily = {
    order: ["outer", "sandShade", "sand", "foam"],
    profiles: {
        top: { outer: shoreOuterMask, sandShade: shoreSandShadeMask, sand: shoreSandMask, foam: shoreFoamMask }
    },
    paint: { outer: { tile: "grass" }, sandShade: "pathShade", sand: "path", foam: "waterLight" }
};

// ─── Tiles ──────────────────────────────────────────────────────────────────

export const tileDefs: Record<TileId, TileDef> = {
    road: material("roadBase", [roadCurbMask, "roadCurb"], [roadLineMask, "roadLine"]),
    beige_pavement: material(
        "pavementBase",
        [beigePavementShadeMask, "pavementShade"],
        [beigePavementLightMask, "pavementLight"],
        [beigePavementGroutMask, "pavementGrout"]
    ),
    brick_pavement: material("brickBase", [brickPavementMortarMask, "brickMortar"], [brickPavementLightMask, "brickLight"]),
    grass: material("grass", [grassShadeMask, "grassShade"], [grassLightMask, "grassLight"]),
    tall_grass: material("grass", [tallGrassShadeMask, "grassShade"], [tallGrassLightMask, "grassLight"]),
    path: material("path", [pathShadeMask, "pathShade"], [pathLightMask, "pathLight"]),
    water: material("water", [waterLightMask, "waterLight"], [waterShadeMask, "waterShade"]),
    wall: material("wall", [wallMask, "wallShade"]),
    floor: material("floor", [floorMask, "floorLine"]),
    sky: material("sky", [skyLightMask, "skyLight"]),
    roof: material("roof", [roofShadeMask, "roofShade"], [roofLightMask, "roofLight"]),

    shore: edge("water", shoreEdges, "top"),

    beige_pavement_top: edge("beige_pavement", pavementEdges, "top"),
    beige_pavement_bottom: edge("beige_pavement", pavementEdges, "bottom"),
    beige_pavement_left: edge("beige_pavement", pavementEdges, "left"),
    beige_pavement_right: edge("beige_pavement", pavementEdges, "right"),
    beige_pavement_top_left: edge("beige_pavement", pavementEdges, "top", "left"),
    beige_pavement_top_right: edge("beige_pavement", pavementEdges, "top", "right"),
    beige_pavement_bottom_left: edge("beige_pavement", pavementEdges, "bottom", "left"),
    beige_pavement_bottom_right: edge("beige_pavement", pavementEdges, "bottom", "right"),

    roof_top_left: edge("roof", roofEdges, "top", "left"),
    roof_top: edge("roof", roofEdges, "top"),
    roof_top_right: edge("roof", roofEdges, "top", "right"),
    roof_left: edge("roof", roofEdges, "left"),
    roof_right: edge("roof", roofEdges, "right"),
    roof_bottom_left: edge("roof", roofEdges, "bottom", "left"),
    roof_bottom: edge("roof", roofEdges, "bottom"),
    roof_bottom_right: edge("roof", roofEdges, "bottom", "right"),

    wall_left: edge("wall", wallEdges, "left"),
    wall_right: edge("wall", wallEdges, "right"),
    wall_base: edge("wall", wallEdges, "bottom"),
    wall_base_left: edge("wall", wallEdges, "bottom", "left"),
    wall_base_right: edge("wall", wallEdges, "bottom", "right")
};

// ─── Resolving a tile to colour names ───────────────────────────────────────

export type ColorGrid = readonly (readonly TileColor[])[];

function checkMask(id: string, mask: PixelMask, rows: number): void {
    if (mask.length > rows || mask.some((row) => row.length !== TILE_SIZE)) {
        throw new Error(`Tile "${id}": masks must be ${TILE_SIZE} wide and at most ${rows} rows`);
    }
}

const grids = new Map<TileId, ColorGrid>();

/** The colour names of every pixel of a tile. They do not depend on the palette. Memoised. */
export function tileGrid(id: TileId): ColorGrid {
    let grid = grids.get(id);
    if (grid) return grid;
    const def = tileDefs[id];
    if (!def) throw new Error(`Unknown tile: ${String(id)}`);

    if ("base" in def) {
        const cells = Array.from({ length: TILE_SIZE }, () => Array<TileColor>(TILE_SIZE).fill(def.base));
        for (const { mask, color } of def.layers) {
            checkMask(id, mask, TILE_SIZE);
            mask.forEach((row, y) => {
                for (let x = 0; x < TILE_SIZE; x += 1) if (row[x] === "1") cells[y][x] = color;
            });
        }
        grid = cells;
    } else {
        const cells = tileGrid(def.inner).map((row) => [...row]);
        for (const name of def.family.order) {
            const paint = def.family.paint[name];
            for (const side of def.sides) {
                const strip = def.family.profiles[side]?.[name];
                if (!strip) continue;
                checkMask(id, strip, TILE_SIZE);
                for (let y = 0; y < TILE_SIZE; y += 1) {
                    for (let x = 0; x < TILE_SIZE; x += 1) {
                        // Distance from the open edge, and position along it.
                        const [depth, along] =
                            side === "top" ? [y, x] : side === "bottom" ? [TILE_SIZE - 1 - y, x]
                            : side === "left" ? [x, y] : [TILE_SIZE - 1 - x, y];
                        if (strip[depth]?.[along] === "1") {
                            cells[y][x] = typeof paint === "string" ? paint : tileGrid(paint.tile)[y][x];
                        }
                    }
                }
            }
        }
        grid = cells;
    }
    grids.set(id, grid);
    return grid;
}
