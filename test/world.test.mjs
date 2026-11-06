import assert from "node:assert/strict";
import test from "node:test";
import {
    buildMap, buildObject, buildTile, defineMap, defineTileSet, houseTileset, mapTileSize,
    objectIds, objectInfo, objectRamps, queryCell, tileAt, tileIds, tilePalette, townTileset
} from "../dist/index.js";

test("every tile is 16×16, opaque terrain, and only uses palette colours", () => {
    assert.ok(tileIds.length >= 10);
    for (const id of tileIds) {
        const tile = buildTile(id);
        assert.equal(tile.width, 16, id);
        assert.equal(tile.height, 16, id);
        for (const color of tile.colors.slice(1)) assert.ok(tilePalette.includes(color), `${id}: ${color}`);
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
