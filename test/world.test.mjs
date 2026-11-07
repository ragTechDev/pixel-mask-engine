import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    buildMap, buildObject, buildTile, defineMap, defineTileSet, houseTileset, mapTileSize,
    objectIds, objectInfo, objectRamps, queryCell, tileAt, tileIds, tilePalettes, tileThemes, townTileset
} from "../dist/index.js";

test("every tile is 16×16, opaque terrain, and only uses palette colours", () => {
    assert.ok(tileIds.length >= 10);
    for (const id of tileIds) {
        const tile = buildTile(id);
        assert.equal(tile.width, 16, id);
        assert.equal(tile.height, 16, id);
        for (const color of tile.colors.slice(1)) assert.ok(Object.values(tilePalettes.default).includes(color), `${id}: ${color}`);
    }
    for (const id of tileIds) assert.ok(buildTile(id).px.every((p) => p !== 0), `${id} is not opaque`);
});

const colorAt = (tile, x, y) => tile.colors[tile.px[y * tile.width + x]];
const sameIn = (a, b, xs, ys) => ys.every((y) => xs.every((x) => colorAt(a, x, y) === colorAt(b, x, y)));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

test("edge tiles match their base pattern away from the edge", () => {
    const pavement = buildTile("beige_pavement");
    const inner = range(5, 10);
    for (const id of tileIds.filter((t) => t.startsWith("beige_pavement_"))) {
        const edge = buildTile(id);
        assert.ok(sameIn(edge, pavement, inner, inner), `${id} interior`);
        assert.ok(!sameIn(edge, pavement, range(0, 15), range(0, 15)), `${id} differs at its edge`);
    }
    // Only the open sides turn to grass: the top edge keeps its left, right and bottom rows.
    const top = buildTile("beige_pavement_top");
    assert.ok(sameIn(top, pavement, range(0, 15), range(5, 15)), "top edge keeps rows 5-15");
    assert.equal(colorAt(top, 8, 0), colorAt(buildTile("grass"), 8, 0), "top rows are grass");

    const wall = buildTile("wall");
    for (const id of ["wall_left", "wall_right", "wall_base", "wall_base_left", "wall_base_right"]) {
        assert.ok(sameIn(buildTile(id), wall, range(4, 11), range(4, 10)), `${id} interior`);
    }
});

test("roof pieces share the shingle pattern and differ at ridge, eave and edges", () => {
    const roof = buildTile("roof");
    const inner = range(3, 12);
    for (const id of tileIds.filter((t) => t.startsWith("roof_"))) {
        assert.ok(sameIn(buildTile(id), roof, inner, range(5, 11)), `${id} interior`);
    }
    assert.notDeepEqual(buildTile("roof_top").px, roof.px);
    assert.notDeepEqual(buildTile("roof_bottom").px, roof.px);
    assert.notDeepEqual(buildTile("roof_left").px, roof.px);
});

test("objects render at their footprint size using only fixed ramps", () => {
    const rampColors = new Set(Object.values(objectRamps).flatMap((r) => Object.values(r)));
    assert.deepEqual([...objectIds].sort(), ["bookshelf", "counter", "door", "fence", "flower", "rug", "tree", "window"]);
    for (const id of objectIds) {
        const { width, height, footprint } = objectInfo[id];
        assert.equal(footprint.length, height, id);
        assert.ok(footprint.every((row) => row.length === width && /^[#.]+$/.test(row)), id);
        const raster = buildObject(id);
        assert.equal(raster.width, width * 16, id);
        assert.equal(raster.height, height * 16, id);
        assert.ok(raster.px.some((p) => p !== 0), `${id} is empty`);
        for (const color of raster.colors.slice(1)) assert.ok(rampColors.has(color), `${id}: ${color}`);
    }
    assert.equal(buildObject("tree"), buildObject("tree"), "memoised");
});

const rows = ["gggg", "gtpw", "hhhh"];
const objects = [
    { id: "tree", x: 0, y: 0 },
    { id: "door", x: 5, y: 5 },
    { id: "window", x: 3, y: 5 },
    { id: "flower", x: 4, y: 3 },
    { id: "fence", x: 4, y: 3 }
];

test("defineMap and buildMap size the raster from blocks and tiles", () => {
    const map = defineMap(townTileset, rows, objects);
    assert.deepEqual(mapTileSize(map), { width: 8, height: 6 });
    const raster = buildMap(map);
    assert.equal(raster.width, 8 * 16);
    assert.equal(raster.height, 6 * 16);
    assert.equal(buildMap(map), raster, "memoised per map object");
});

test("objects are drawn over terrain", () => {
    const plain = buildMap(defineMap(townTileset, rows));
    const withObjects = buildMap(defineMap(townTileset, rows, objects));
    assert.notDeepEqual(withObjects.px, plain.px);
});

test("queryCell combines terrain and object behaviour", () => {
    const map = defineMap(townTileset, rows, objects);
    assert.equal(tileAt(map, 0, 0), "grass");
    assert.equal(queryCell(map, 0, 0).solid, false, "tree canopy tile is open");
    assert.equal(queryCell(map, 0, 1).solid, true, "tree trunk tile is solid");
    assert.equal(queryCell(map, 0, 1).object, "tree");
    assert.equal(queryCell(map, 2, 2).grass, true); // tall grass block
    assert.equal(queryCell(map, 6, 2).water, true);
    assert.equal(queryCell(map, 6, 2).solid, true);
    assert.equal(queryCell(map, 5, 5).door, true);
    assert.equal(queryCell(map, 5, 5).solid, true, "wall under the door is solid terrain");
    assert.equal(queryCell(map, 3, 5).solid, true);
    assert.equal(queryCell(map, 4, 3).object, "fence", "standing object wins over ground object");
    assert.equal(queryCell(map, 4, 3).solid, true);
    assert.equal(queryCell(map, -1, 0), undefined);
    assert.equal(queryCell(map, 8, 0), undefined);
    assert.equal(queryCell(map, 0, 6), undefined);
    assert.equal(queryCell(map, 0.5, 0), undefined);
});

test("the keypad blocks assemble a roof, a wall and a pavement patch", () => {
    const map = defineMap(townTileset, ["1223", "7889", "lhhr", "[__]", "ABBC", "DEEF", "GHHI"]);
    assert.equal(tileAt(map, 0, 0), "roof_top_left");
    assert.equal(tileAt(map, 7, 0), "roof_top_right");
    assert.equal(tileAt(map, 1, 1), "roof");
    assert.equal(tileAt(map, 0, 3), "roof_bottom_left");
    assert.equal(tileAt(map, 3, 3), "roof_bottom");
    assert.equal(tileAt(map, 0, 4), "wall_left");
    assert.equal(tileAt(map, 7, 5), "wall_right");
    assert.equal(tileAt(map, 2, 7), "wall_base");
    assert.equal(tileAt(map, 0, 7), "wall_base_left");
    assert.equal(tileAt(map, 7, 7), "wall_base_right");
    assert.equal(tileAt(map, 0, 8), "beige_pavement_top_left");
    assert.equal(tileAt(map, 3, 11), "beige_pavement");
    assert.equal(tileAt(map, 7, 13), "beige_pavement_bottom_right");
    assert.equal(queryCell(map, 2, 1).solid, true, "roofs are solid");
    assert.equal(queryCell(map, 2, 5).solid, true, "walls are solid");
    assert.equal(queryCell(map, 3, 11).solid, false, "pavement is walkable");
    assert.equal(queryCell(map, 0, 8).solid, false, "pavement corner is walkable");
});

test("a small house is one roof block over one wall block", () => {
    const map = defineMap(townTileset, ["<==>", "[__]"]);
    assert.deepEqual(mapTileSize(map), { width: 8, height: 4 });
    assert.equal(tileAt(map, 0, 0), "roof_top_left");
    assert.equal(tileAt(map, 1, 0), "roof_top");
    assert.equal(tileAt(map, 0, 1), "roof_bottom_left");
    assert.equal(tileAt(map, 3, 1), "roof_bottom");
    assert.equal(tileAt(map, 7, 0), "roof_top_right");
    assert.equal(tileAt(map, 7, 1), "roof_bottom_right");
    assert.equal(tileAt(map, 0, 2), "wall_left");
    assert.equal(tileAt(map, 0, 3), "wall_base_left");
    assert.equal(tileAt(map, 4, 3), "wall_base");
    assert.equal(queryCell(map, 3, 1).solid, true);
    assert.equal(queryCell(map, 3, 3).solid, true);
});

test("interior objects: counters, furniture and open rugs", () => {
    const map = defineMap(houseTileset, ["hhhh", "ffff", "ffff"], [
        { id: "counter", x: 1, y: 3 },
        { id: "bookshelf", x: 5, y: 2 },
        { id: "rug", x: 3, y: 4 },
        { id: "door", x: 3, y: 1 }
    ]);
    assert.equal(queryCell(map, 1, 3).counter, true);
    assert.equal(queryCell(map, 2, 3).counter, true, "counter spans two tiles");
    assert.equal(queryCell(map, 2, 3).solid, true);
    assert.equal(queryCell(map, 1, 4).solid, false, "floor in front of the counter");
    assert.equal(queryCell(map, 5, 3).solid, true, "second bookshelf tile");
    assert.equal(queryCell(map, 3, 4).solid, false, "rug is walkable");
    assert.equal(queryCell(map, 3, 4).object, "rug");
});

test("validation rejects bad input", () => {
    assert.throws(() => defineMap(townTileset, []), /at least one row/);
    assert.throws(() => defineMap(townTileset, ["gg", "g"]), /expected 2/);
    assert.throws(() => defineMap(townTileset, ["gz"]), /no block "z"/);
    assert.throws(() => defineMap(townTileset, ["gg"], [{ id: "nope", x: 0, y: 0 }]), /Unknown object/);
    assert.throws(() => defineMap(townTileset, ["gg"], [{ id: "tree", x: 0, y: 1 }]), /does not fit/);
    assert.throws(() => defineMap(townTileset, ["gg"], [{ id: "fence", x: 4, y: 0 }]), /does not fit/);
    assert.throws(() => defineMap(townTileset, ["gg"], [{ id: "fence", x: 0, y: 0 }, { id: "door", x: 0, y: 0 }]), /overlaps/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { ab: [["grass", "grass"], ["grass", "grass"]] } }), /one character/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { a: [["grass"]] } }), /2×2/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { a: [["nope", "grass"], ["grass", "grass"]] } }), /unknown tile/);
    assert.throws(() => defineTileSet({ id: "x", blocks: {}, solid: ["nope"] }), /unknown tile/);
    assert.throws(() => defineTileSet({ id: "x", blocks: {}, blockSize: 0 }), /blockSize/);
});

// ─── Palettes and golden pixels ──────────────────────────────────────────────
const fingerprint = (r) => createHash("sha256").update(JSON.stringify([r.width, r.height, r.colors, [...r.px]])).digest("hex").slice(0, 16);

test("tiles match the recorded pixels in the default palette", () => {
    const golden = JSON.parse(readFileSync(new URL("./fixtures/tile-golden.json", import.meta.url), "utf8"));
    assert.deepEqual(Object.keys(golden).sort(), [...tileIds].sort());
    for (const id of tileIds) assert.equal(fingerprint(buildTile(id)), golden[id], id);
});

test("every palette names the same colours", () => {
    assert.deepEqual(tileThemes, ["default", "autumn", "winter"]);
    const names = Object.keys(tilePalettes.default).sort();
    for (const theme of tileThemes) {
        assert.deepEqual(Object.keys(tilePalettes[theme]).sort(), names, theme);
        for (const color of Object.values(tilePalettes[theme])) assert.match(color, /^#[0-9A-F]{6}$/i, theme);
    }
});

test("a palette recolours tiles without changing their shape", () => {
    for (const theme of ["autumn", "winter"]) {
        let changed = 0;
        for (const id of tileIds) {
            const base = buildTile(id);
            const recoloured = buildTile(id, theme);
            assert.equal(recoloured.width, base.width, id);
            assert.equal(recoloured.height, base.height, id);
            // Each default colour maps to exactly one colour in the new palette.
            const seen = new Map();
            for (let i = 0; i < base.px.length; i += 1) {
                const from = base.colors[base.px[i]];
                const to = recoloured.colors[recoloured.px[i]];
                assert.equal(seen.get(from) ?? to, to, `${id}: ${from} maps to two colours in ${theme}`);
                seen.set(from, to);
            }
            if ([...seen].some(([from, to]) => from !== to)) changed += 1;
        }
        assert.ok(changed > 0, `${theme} changes some tiles`);
    }
    assert.notDeepEqual(buildTile("grass", "winter").colors, buildTile("grass").colors);
    assert.deepEqual(buildTile("road", "winter").colors, buildTile("road").colors, "road is not recoloured");
});

test("unknown palettes fall back to the default", () => {
    assert.equal(buildTile("grass", "nope"), buildTile("grass"));
    assert.equal(buildTile("grass", "toString"), buildTile("grass"), "inherited keys are not palettes");
});

test("buildMap takes a palette, keeps objects' colours, and memoises per palette", () => {
    const map = defineMap(townTileset, ["ggg", "g1g"], [{ id: "tree", x: 0, y: 0 }]);
    const plain = buildMap(map);
    const winter = buildMap(map, "winter");
    assert.notEqual(winter, plain);
    assert.equal(buildMap(map, "winter"), winter);
    assert.equal(buildMap(map, "nope"), plain);
    assert.equal(winter.width, plain.width);
    assert.ok(winter.colors.includes(objectRamps.leaf.base), "tree keeps its colours");
    assert.ok(winter.colors.includes(tilePalettes.winter.grass));
    assert.ok(!winter.colors.includes(tilePalettes.default.grass));
});

test("the sky tile is a pale opaque tile that changes colour with the palette", () => {
    const sky = buildTile("sky");
    assert.equal(sky.width, 16);
    assert.equal(sky.height, 16);
    assert.ok(sky.px.every((p) => p !== 0), "sky is opaque");
    assert.equal(sky.colors.length, 3, "a base colour and a lighter speckle");
    for (const theme of ["autumn", "winter"]) {
        assert.notDeepEqual(buildTile("sky", theme).colors, sky.colors, `${theme} recolours the sky`);
    }
});

test("the town tileset has a sky block", () => {
    assert.deepEqual(townTileset.blocks.k, [["sky", "sky"], ["sky", "sky"]]);
});
