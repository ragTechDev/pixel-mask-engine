import type { TownTileId } from "../types";
import { parseRows } from "./parseRows";

// DRAFT terrain tiles for building towns and interiors. They are first drafts,
// meant to be redrawn by hand before release. Things that stand on terrain
// (trees, fences, doors, windows, furniture) are objects, not tiles: see
// `../objects/objectMasks.ts`.
//
// 16×16 pixels, drawn as text. `.` is transparent. Characters `1-9` then `a-z`
// are slots 1 to 35 of `tilePalette` (in `../tiles.ts`):
//   b grass   c grass shade   d grass light
//   e water   f water light   g water shade
//   h wall    i wall shade
//   j floor   k floor line
//   l path    m path shade    n path light
// Tiles are fully opaque so they tile without gaps.

export const townMasks: Record<TownTileId, number[][]> = {
    // ─── Outdoor ────────────────────────────────────────────────────────────
    grass: parseRows([
        "bbbbbbbbbbbbbbbb",
        "bbbdbbbbbbbbcbbb",
        "bbbbbbbbbcbbbbbb",
        "bbbbbbbbbbbbbdbb",
        "bcbbbbdbbbbbbbbb",
        "bbbbbbbbbbbbbbbb",
        "bbbbbbbbbcbbbbbb",
        "bbdbbbbbbbbbbcbb",
        "bbbbbbbbbbbbbbbb",
        "bbbbcbbbbdbbbbbb",
        "bbbbbbbbbbbbbbbb",
        "bdbbbbbbbbbbbbbb",
        "bbbbbbbcbbbbbbdb",
        "bbbbbbbbbbbbbbbb",
        "bbcbbbbbbbbcbbbb",
        "bbbbbbbbdbbbbbbb"
    ]),
    tall_grass: parseRows([
        "bbdbbbbbbbdbbbbb",
        "bcdcbbbbbcdcbbbb",
        "bcdcbbbbbcdcbbbb",
        "cbdbcbbbcbdbcbbb",
        "bbbbbbdbbbbbbbdb",
        "bbbbcdcbbbbbcdcb",
        "bbbbcdcbbbbbcdcb",
        "bbbcbdbcbbbcbdbc",
        "bbdbbbbbbbdbbbbb",
        "bcdcbbbbbcdcbbbb",
        "bcdcbbbbbcdcbbbb",
        "cbdbcbbbcbdbcbbb",
        "bbbbbbdbbbbbbbdb",
        "bbbbcdcbbbbbcdcb",
        "bbbbcdcbbbbbcdcb",
        "bbbcbdbcbbbcbdbc"
    ]),
    path: parseRows([
        "llllllllllllllll",
        "llnllllllllmllll",
        "llllllllllllllll",
        "llllmllllnllllll",
        "llllllllllllllll",
        "lnlllllllllllmll",
        "lllllllnllllllll",
        "llllllllllllnlll",
        "lllmllllllllllll",
        "llllllllllnlllll",
        "lllllllllllllmll",
        "lnllllllllllllll",
        "llllllmlllllllll",
        "lllllllllllnllll",
        "llmlllllllllllnl",
        "llllllllllllllll"
    ]),
    water: parseRows([
        "eeeeeeeeeeeeeeee",
        "eefffeeeeeeeeeee",
        "eeeeeeeeeeeeeeee",
        "eeeeeeeeeeefffee",
        "eeeeeeeeeeeeeeee",
        "eeggeeeeeeeeggee",
        "eeeeeeeefffeeeee",
        "eeeeeeeeeeeeeeee",
        "eeeeeeeeeeeeeeee",
        "efffeeeeeeeeeeee",
        "eeeeeeeeeeeeeeee",
        "eeeeeeeeggeeeeee",
        "eeeeeeeeeeeefffe",
        "eeeeeeeeeeeeeeee",
        "eggeeeeeeeeeeeee",
        "eeeeeeeeefffeeee"
    ]),
    // Grass above, a sandy edge, then water below.
    shore: parseRows([
        "bbbbbbbbbbbbbbbb",
        "bbdbbbbbbbbbcbbb",
        "bbbbbbbbbbbbbbbb",
        "bbbbcbbbbbdbbbbb",
        "bbbbbbbbbbbbbbbb",
        "bcbbcbbbcbbcbbcb",
        "mmmmmmmmmmmmmmmm",
        "llllllllllllllll",
        "fefffefffeffefff",
        "eeeeeeeeeeeeeeee",
        "eeeggeeeeeeggeee",
        "eeeeeeeeeeeeeeee",
        "eefffeeeeeeeeeee",
        "eeeeeeeeeeeeeeee",
        "eeeeeeeeggeeeeee",
        "eeeeeeeeeeeeeeee"
    ]),
    // ─── Buildings and interiors ────────────────────────────────────────────
    wall: parseRows([
        "iiiiiiiiiiiiiiii",
        "hhhhhhhihhhhhhhi",
        "hhhhhhhihhhhhhhi",
        "hhhhhhhihhhhhhhi",
        "iiiiiiiiiiiiiiii",
        "hhhihhhhhhhihhhh",
        "hhhihhhhhhhihhhh",
        "hhhihhhhhhhihhhh",
        "iiiiiiiiiiiiiiii",
        "hhhhhhhihhhhhhhi",
        "hhhhhhhihhhhhhhi",
        "hhhhhhhihhhhhhhi",
        "iiiiiiiiiiiiiiii",
        "hhhihhhhhhhihhhh",
        "hhhihhhhhhhihhhh",
        "hhhihhhhhhhihhhh"
    ]),
    floor: parseRows([
        "kkkkkkkkkkkkkkkk",
        "jjjjjjjjkjjjjjjj",
        "jjjjjjjjkjjjjjjj",
        "jjjjjjjjkjjjjjjj",
        "kkkkkkkkkkkkkkkk",
        "jjjkjjjjjjjjjjjj",
        "jjjkjjjjjjjjjjjj",
        "jjjkjjjjjjjjjjjj",
        "kkkkkkkkkkkkkkkk",
        "jjjjjjjjkjjjjjjj",
        "jjjjjjjjkjjjjjjj",
        "jjjjjjjjkjjjjjjj",
        "kkkkkkkkkkkkkkkk",
        "jjjkjjjjjjjjjjjj",
        "jjjkjjjjjjjjjjjj",
        "jjjkjjjjjjjjjjjj"
    ])
};
