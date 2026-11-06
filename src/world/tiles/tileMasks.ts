import type { RoadTileId } from "../types";

// 16×16 pixel tile masks. Cell values map to TileRenderer's palette:
//   0 = transparent   1 = road dark gray   2 = road light gray   3 = white
//   4 = beige base    5 = beige shadow     6 = beige highlight   7 = stone grout
//   8 = brick main    9 = brick mortar    10 = brick highlight

export const tileMasks: Record<RoadTileId, number[][]> = {

  // ─── Road ──────────────────────────────────────────────────────────────────
  // Top-down asphalt road. Light curb strips along top & bottom edges,
  // white dashed centre-line in the middle four rows.
  road: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  // ─── Beige Pavement ────────────────────────────────────────────────────────
  // Running-bond flagstone pattern. Upper half: two full stones separated by a
  // vertical grout line at col 7. Lower half: offset by half a stone width
  // (grout lines at cols 3 & 11). Horizontal grout at rows 7 & 15.
  beige_pavement: [
    [4,6,4,4,4,4,4,7,4,6,4,4,4,4,4,4], // row 0 – top of upper stones, highlight corner
    [4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,4],
    [4,4,4,4,4,5,5,7,4,4,4,4,4,4,5,5], // shadow edge
    [4,4,4,4,5,5,5,7,4,4,4,4,4,5,5,5], // stronger bottom shadow
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7], // row 7 – full horizontal grout
    [4,6,4,7,4,4,4,4,4,6,4,4,7,4,4,4], // row 8 – offset stones, highlight corner
    [4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4],
    [4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4],
    [4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4],
    [4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4],
    [4,4,5,7,4,4,4,4,4,4,4,5,7,4,4,4],
    [4,5,5,7,4,4,4,4,4,4,5,5,7,4,4,4], // bottom shadow
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7], // row 15 – full horizontal grout
  ],

  // ─── Brick Pavement ────────────────────────────────────────────────────────
  // Classic running-bond brick layout. Each brick is 7 wide, 3 tall.
  // Mortar joints (value 9) at col 7 for normal rows, cols 3 & 11 for offset rows.
  // Full mortar rows at y = 3, 7, 11, 15.
  brick_pavement: [
    [8,10,8,8,8,8,8,9,8,10,8,8,8,8,8,8], // row 0 – highlight on brick top-left
    [8, 8,8,8,8,8,8,9,8, 8,8,8,8,8,8,8],
    [8, 8,8,8,8,8,8,9,8, 8,8,8,8,8,8,8],
    [9, 9,9,9,9,9,9,9,9, 9,9,9,9,9,9,9], // row 3 – mortar
    [8,10,8,9,8,8,10,8,8, 8,9,8,10,8,8,8], // row 4 – offset bricks, mortar at 3 & 10
    [8, 8,8,9,8,8, 8,8,8, 8,9,8, 8,8,8,8],
    [8, 8,8,9,8,8, 8,8,8, 8,9,8, 8,8,8,8],
    [9, 9,9,9,9,9, 9,9,9, 9,9,9, 9,9,9,9], // row 7 – mortar
    [8,10,8,8,8,8, 8,9,8,10,8,8, 8,8,8,8], // row 8 – normal bricks again
    [8, 8,8,8,8,8, 8,9,8, 8,8,8, 8,8,8,8],
    [8, 8,8,8,8,8, 8,9,8, 8,8,8, 8,8,8,8],
    [9, 9,9,9,9,9, 9,9,9, 9,9,9, 9,9,9,9], // row 11 – mortar
    [8,10,8,9,8,8,10,8,8, 8,9,8,10,8,8,8], // row 12 – offset bricks
    [8, 8,8,9,8,8, 8,8,8, 8,9,8, 8,8,8,8],
    [8, 8,8,9,8,8, 8,8,8, 8,9,8, 8,8,8,8],
    [9, 9,9,9,9,9, 9,9,9, 9,9,9, 9,9,9,9], // row 15 – mortar
  ],
}
