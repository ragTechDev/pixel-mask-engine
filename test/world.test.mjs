import assert from "node:assert/strict";
import test from "node:test";
import {
    buildMap, buildTile, defineMap, defineTileSet, houseTileset, mapTileSize,
    queryCell, tileAt, tileIds, tilePalette, townTileset
} from "../dist/index.js";

test("every tile is 16×16 and only uses palette colours", () => {
    assert.ok(tileIds.length >= 18);
    for (const id of tileIds) {
        const tile = buildTile(id);
        assert.equal(tile.width, 16, id);
        assert.equal(tile.height, 16, id);
        for (const color of tile.colors.slice(1)) assert.ok(tilePalette.includes(color), `${id}: ${color}`);
    }
});

test("new town tiles are fully opaque", () => {
    for (const id of ["grass", "tree", "water", "wall", "floor", "door", "counter", "rug", "bookshelf"]) {
        assert.ok(buildTile(id).px.every((p) => p !== 0), id);
    }
});

const rows = ["TTTT", "gGpw", "fhWd"];

test("defineMap and buildMap size the raster from blocks and tiles", () => {
    const map = defineMap(townTileset, rows);
    assert.deepEqual(mapTileSize(map), { width: 8, height: 6 });
    const raster = buildMap(map);
    assert.equal(raster.width, 8 * 16);
    assert.equal(raster.height, 6 * 16);
    assert.equal(buildMap(map), raster, "memoised per map");
});

test("queryCell reads behaviour from tile id lists", () => {
    const map = defineMap(townTileset, rows);
    assert.equal(tileAt(map, 0, 0), "tree");
    assert.equal(queryCell(map, 0, 0).solid, true);
    assert.equal(queryCell(map, 2, 2).grass, true); // block G at (1,1)
    assert.equal(queryCell(map, 4, 3).solid, false); // path
    assert.equal(queryCell(map, 6, 2).water, true); // block w
    assert.equal(queryCell(map, 7, 5).door, true); // block d, bottom row
    assert.equal(queryCell(map, 7, 5).solid, false);
    assert.equal(queryCell(map, -1, 0), undefined);
    assert.equal(queryCell(map, 8, 0), undefined);
    assert.equal(queryCell(map, 0, 6), undefined);
    assert.equal(queryCell(map, 0.5, 0), undefined);
});

test("interior tileset has counters and solid furniture", () => {
    const map = defineMap(houseTileset, ["hhhh", "cbrf", "ffdf"]);
    assert.equal(queryCell(map, 0, 2).counter, true);
    assert.equal(queryCell(map, 0, 2).solid, true);
    assert.equal(queryCell(map, 0, 3).solid, false); // floor in front of the counter
    assert.equal(queryCell(map, 2, 2).solid, true); // bookshelf
    assert.equal(queryCell(map, 4, 2).solid, false); // rug
});

test("validation rejects bad input", () => {
    assert.throws(() => defineMap(townTileset, []), /at least one row/);
    assert.throws(() => defineMap(townTileset, ["gg", "g"]), /expected 2/);
    assert.throws(() => defineMap(townTileset, ["gz"]), /no block "z"/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { ab: [["grass", "grass"], ["grass", "grass"]] } }), /one character/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { a: [["grass"]] } }), /2×2/);
    assert.throws(() => defineTileSet({ id: "x", blocks: { a: [["nope", "grass"], ["grass", "grass"]] } }), /unknown tile/);
    assert.throws(() => defineTileSet({ id: "x", blocks: {}, solid: ["nope"] }), /unknown tile/);
    assert.throws(() => defineTileSet({ id: "x", blocks: {}, blockSize: 0 }), /blockSize/);
});
