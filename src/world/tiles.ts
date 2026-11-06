import { composeSprites, type Raster } from "../core/compose";
import { spriteFromGrid, type Sprite } from "../core/sprite";
import { beigePavementMask } from "./masks/tiles/beigePavement.mask";
import { beigePavementBottomMask } from "./masks/tiles/beigePavementBottom.mask";
import { beigePavementBottomLeftMask } from "./masks/tiles/beigePavementBottomLeft.mask";
import { beigePavementBottomRightMask } from "./masks/tiles/beigePavementBottomRight.mask";
import { beigePavementLeftMask } from "./masks/tiles/beigePavementLeft.mask";
import { beigePavementRightMask } from "./masks/tiles/beigePavementRight.mask";
import { beigePavementTopMask } from "./masks/tiles/beigePavementTop.mask";
import { beigePavementTopLeftMask } from "./masks/tiles/beigePavementTopLeft.mask";
import { beigePavementTopRightMask } from "./masks/tiles/beigePavementTopRight.mask";
import { brickPavementMask } from "./masks/tiles/brickPavement.mask";
import { floorMask } from "./masks/tiles/floor.mask";
import { grassMask } from "./masks/tiles/grass.mask";
import { pathMask } from "./masks/tiles/path.mask";
import { roadMask } from "./masks/tiles/road.mask";
import { roofMask } from "./masks/tiles/roof.mask";
import { roofBottomMask } from "./masks/tiles/roofBottom.mask";
import { roofBottomLeftMask } from "./masks/tiles/roofBottomLeft.mask";
import { roofBottomRightMask } from "./masks/tiles/roofBottomRight.mask";
import { roofLeftMask } from "./masks/tiles/roofLeft.mask";
import { roofRightMask } from "./masks/tiles/roofRight.mask";
import { roofTopMask } from "./masks/tiles/roofTop.mask";
import { roofTopLeftMask } from "./masks/tiles/roofTopLeft.mask";
import { roofTopRightMask } from "./masks/tiles/roofTopRight.mask";
import { shoreMask } from "./masks/tiles/shore.mask";
import { tallGrassMask } from "./masks/tiles/tallGrass.mask";
import { wallMask } from "./masks/tiles/wall.mask";
import { wallBaseMask } from "./masks/tiles/wallBase.mask";
import { wallBaseLeftMask } from "./masks/tiles/wallBaseLeft.mask";
import { wallBaseRightMask } from "./masks/tiles/wallBaseRight.mask";
import { wallLeftMask } from "./masks/tiles/wallLeft.mask";
import { wallRightMask } from "./masks/tiles/wallRight.mask";
import { waterMask } from "./masks/tiles/water.mask";
import { parseRows } from "./parseRows";
import type { TileId } from "./types";

/** Fixed tile palette, indexed by the values in the tile masks (0 = transparent). */
export const tilePalette = [
    "",
    "#726962", // 1: road dark gray
    "#8A7D78", // 2: road lighter gray (curb / edge detail)
    "#FFFFFF", // 3: white (lane markings)
    "#E9BFA7", // 4: beige pavement base
    "#C4A090", // 5: beige shadow
    "#F5D0BA", // 6: beige highlight
    "#D4C4B4", // 7: stone grout / joint lines
    "#6B4548", // 8: brick main
    "#3E2830", // 9: brick mortar / dark joints
    "#8C6870", // 10 (a): brick lighter highlight
    "#8FB36A", // 11 (b): grass
    "#6E9450", // 12 (c): grass shade
    "#A8C682", // 13 (d): grass light
    "#6FA3C7", // 14 (e): water
    "#A9D0E6", // 15 (f): water light
    "#4F7FA6", // 16 (g): water shade
    "#C9BFB0", // 17 (h): wall
    "#A09585", // 18 (i): wall shade
    "#D8C8A8", // 19 (j): floor
    "#BFAE8C", // 20 (k): floor line
    "#D1B48A", // 21 (l): path
    "#B8996D", // 22 (m): path shade
    "#E3CBA5", // 23 (n): path light
    "#B0604A", // 24 (o): roof
    "#864637", // 25 (p): roof shade
    "#CC7E64", // 26 (q): roof light
    "#5E2F28", // 27 (r): roof edge
    "#7C7364" // 28 (s): wall foundation
] as const;

const allMasks: Record<TileId, number[][]> = {
    road: parseRows(roadMask),
    beige_pavement: parseRows(beigePavementMask),
    brick_pavement: parseRows(brickPavementMask),
    grass: parseRows(grassMask),
    tall_grass: parseRows(tallGrassMask),
    path: parseRows(pathMask),
    water: parseRows(waterMask),
    shore: parseRows(shoreMask),
    wall: parseRows(wallMask),
    floor: parseRows(floorMask),
    roof_top_left: parseRows(roofTopLeftMask),
    roof_top: parseRows(roofTopMask),
    roof_top_right: parseRows(roofTopRightMask),
    roof_left: parseRows(roofLeftMask),
    roof: parseRows(roofMask),
    roof_right: parseRows(roofRightMask),
    roof_bottom_left: parseRows(roofBottomLeftMask),
    roof_bottom: parseRows(roofBottomMask),
    roof_bottom_right: parseRows(roofBottomRightMask),
    beige_pavement_top: parseRows(beigePavementTopMask),
    beige_pavement_bottom: parseRows(beigePavementBottomMask),
    beige_pavement_left: parseRows(beigePavementLeftMask),
    beige_pavement_right: parseRows(beigePavementRightMask),
    beige_pavement_top_left: parseRows(beigePavementTopLeftMask),
    beige_pavement_top_right: parseRows(beigePavementTopRightMask),
    beige_pavement_bottom_left: parseRows(beigePavementBottomLeftMask),
    beige_pavement_bottom_right: parseRows(beigePavementBottomRightMask),
    wall_left: parseRows(wallLeftMask),
    wall_right: parseRows(wallRightMask),
    wall_base: parseRows(wallBaseMask),
    wall_base_left: parseRows(wallBaseLeftMask),
    wall_base_right: parseRows(wallBaseRightMask)
};

export const tileIds = Object.keys(allMasks) as TileId[];

const sprites = new Map<TileId, Sprite>();
const built = new Map<TileId, Raster>();

/** Internal: the (memoised) sprite for a built-in tile. Tile art is 16×16 palette-slot indices. */
export function tileSprite(id: TileId): Sprite {
    let sprite = sprites.get(id);
    if (!sprite) {
        const mask = allMasks[id];
        if (!mask) throw new Error(`Unknown tile: ${String(id)}`);
        sprite = spriteFromGrid(mask);
        sprites.set(id, sprite);
    }
    return sprite;
}

/** Returns the (memoised) raster for a built-in tile. */
export function buildTile(id: TileId): Raster {
    let raster = built.get(id);
    if (!raster) {
        raster = composeSprites([{ sprite: tileSprite(id), slots: tilePalette, x: 0, y: 0 }]);
        built.set(id, raster);
    }
    return raster;
}
