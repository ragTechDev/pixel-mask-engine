import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildAvatar, buildIcon, buildMap, buildObject, buildTile, colorDepths, colorableIconIds, defineMap, iconIds, objectIds, tileIds, toMapVariant, toVariant, townTileset, variantSizes } from "../dist/index.js";
import { Avatar, Icon, PixelImage, Tile, World } from "../dist/react.js";

const assets = [
    ...iconIds.map((id) => [`icon ${id}`, buildIcon(id)]),
    ...tileIds.map((id) => [`tile ${id}`, buildTile(id)]),
    ...objectIds.map((id) => [`object ${id}`, buildObject(id)]),
    ["avatar", buildAvatar()]
];

const solid = (width, height, color = "#ff0000") => ({ width, height, colors: ["", color], px: new Uint8Array(width * height).fill(1) });

test("no options, or values outside the fixed lists, return the same raster", () => {
    const raster = buildIcon("heart");
    assert.equal(toVariant(raster), raster);
    assert.equal(toVariant(raster, {}), raster);
    assert.equal(toVariant(raster, { size: 12, bits: 4 }), raster);
    assert.equal(toVariant(raster, { bits: 8 }), raster, "8 and 16 bits are not options");
    assert.equal(toVariant(raster, { bits: 16 }), raster);
});

test("every asset fits 8x8 and 16x16 at 1 and 2 bits", () => {
    for (const [name, raster] of assets) {
        for (const size of variantSizes) {
            for (const bits of colorDepths) {
                const v = toVariant(raster, { size, bits });
                assert.equal(v.width, size, `${name} ${size}`);
                assert.equal(v.height, size, `${name} ${size}`);
                assert.equal(v.px.length, size * size);
                assert.ok(v.px.some((ci) => ci !== 0), `${name} ${size}x${size} ${bits}-bit is not blank`);
                assert.ok(v.colors.length - 1 <= Math.min(2 ** bits, raster.colors.length - 1), `${name} ${bits}-bit palette size`);
                assert.ok(v.px.every((ci) => ci < v.colors.length));
            }
        }
    }
});

test("size alone keeps the original colours and bits alone keeps the size", () => {
    const raster = buildIcon("cottage");
    const small = toVariant(raster, { size: 8 });
    assert.ok(small.colors.every((c) => raster.colors.includes(c)));
    const flat = toVariant(raster, { bits: 1 });
    assert.equal(flat.width, raster.width);
    assert.equal(flat.height, raster.height);
});

test("transparency is kept at every colour depth", () => {
    const raster = buildIcon("heart");
    for (const bits of colorDepths) {
        const v = toVariant(raster, { bits });
        assert.deepEqual(
            Array.from(v.px, (ci) => ci === 0),
            Array.from(raster.px, (ci) => ci === 0)
        );
    }
});

test("1-bit is black and white, 2-bit is four greys", () => {
    for (const [, raster] of assets) {
        const one = toVariant(raster, { bits: 1 });
        assert.ok(one.colors.slice(1).every((c) => c === "#000000" || c === "#ffffff"));
        const two = toVariant(raster, { bits: 2 });
        assert.ok(two.colors.slice(1).every((c) => ["#000000", "#555555", "#aaaaaa", "#ffffff"].includes(c)));
    }
});

test("shapes are centred and keep their aspect ratio", () => {
    const wide = toVariant(solid(32, 8), { size: 16 });
    const rows = (v) => Array.from({ length: v.height }, (_, y) => v.px.slice(y * v.width, (y + 1) * v.width).some(Boolean));
    assert.deepEqual(rows(wide), [...Array(6).fill(false), ...Array(4).fill(true), ...Array(6).fill(false)]);
    const small = toVariant(solid(4, 4), { size: 16 });
    assert.equal(small.px.filter(Boolean).length, 16 * 16, "a smaller image is enlarged by a whole number");
    const odd = toVariant(solid(6, 6), { size: 16 });
    assert.equal(odd.px.filter(Boolean).length, 12 * 12, "no uneven pixels from a fractional scale");
});

test("shrinking picks the most common colour and drops mostly empty blocks", () => {
    const raster = {
        width: 4,
        height: 2,
        colors: ["", "#111111", "#eeeeee"],
        px: Uint8Array.from([1, 2, 2, 0, 2, 2, 0, 0])
    };
    const v = toVariant(raster, { size: 8 });
    assert.equal(v.width, 8);
    const resized = toVariant({ ...raster, width: 16, height: 16, px: new Uint8Array(256).map((_, i) => (i % 16 < 8 ? 1 : 0)) }, { size: 8 });
    assert.equal(resized.px.filter(Boolean).length, 4 * 8);
});

test("variants are memoised per raster and do not touch the original", () => {
    const raster = buildIcon("heart");
    const before = Array.from(raster.px);
    const colors = [...raster.colors];
    const a = toVariant(raster, { size: 8, bits: 2 });
    assert.equal(toVariant(raster, { bits: 2, size: 8 }), a);
    assert.notEqual(toVariant(raster, { size: 8, bits: 1 }), a);
    assert.deepEqual(Array.from(raster.px), before);
    assert.deepEqual([...raster.colors], colors);
});

test("empty rasters become an empty square", () => {
    const v = toVariant({ width: 0, height: 0, colors: [""], px: new Uint8Array(0) }, { size: 8 });
    assert.equal(v.width, 8);
    assert.ok(v.px.every((ci) => ci === 0));
});

test("components take size and bits and match PixelImage with toVariant", () => {
    const options = { size: 8, bits: 2, pixelSize: 4 };
    assert.equal(
        renderToStaticMarkup(createElement(Icon, { id: "heart", ...options })),
        renderToStaticMarkup(createElement(PixelImage, { raster: toVariant(buildIcon("heart"), { size: 8, bits: 2 }), pixelSize: 4 }))
    );
    assert.match(renderToStaticMarkup(createElement(Tile, { id: "grass", size: 8 })), /width="32" height="32"/);
    assert.match(renderToStaticMarkup(createElement(Avatar, { size: 16, bits: 1 })), /width="64" height="64"/);
    assert.equal(
        renderToStaticMarkup(createElement(Avatar, { size: 16 })),
        renderToStaticMarkup(createElement(PixelImage, { raster: toVariant(buildAvatar(), { size: 16 }) }))
    );
});

test("a map's size is the pixels per tile, so the whole map keeps its proportions", () => {
    const map = defineMap(townTileset, ["gg", "gp"], [{ id: "tree", x: 0, y: 0 }]);
    const full = buildMap(map);
    assert.equal(full.width, 64);
    assert.equal(full.height, 64);
    assert.equal(toMapVariant(full, { size: 16 }), full, "16 pixels per tile is the original");
    const half = toMapVariant(full, { size: 8 });
    assert.equal(half.width, 32, "each 16 pixel tile becomes 8");
    assert.equal(half.height, 32);
    const rows = (r, left, top, n) =>
        Array.from({ length: n }, (_, y) => Array.from(r.px.slice((top + y) * r.width + left, (top + y) * r.width + left + n), (ci) => r.colors[ci]).join());
    const grass = toVariant(buildTile("grass"), { size: 8 });
    assert.deepEqual(rows(half, 8, 0, 8), rows(grass, 0, 0, 8), "a plain grass tile matches the 8x8 tile variant");
    assert.equal(toMapVariant(full, { size: 8 }), half, "memoised");
    const flat = toMapVariant(full, { size: 8, bits: 1 });
    assert.equal(flat.width, 32);
    assert.ok(flat.colors.slice(1).every((c) => c === "#000000" || c === "#ffffff"));
    assert.equal(toMapVariant(full, { size: 12 }), full, "other sizes are ignored");
});

test("<World> takes the pixels per tile for size", () => {
    const map = defineMap(townTileset, ["gg", "gp"], []);
    assert.match(renderToStaticMarkup(createElement(World, { map, size: 8, pixelSize: 2 })), /width="64" height="64"/);
    assert.match(renderToStaticMarkup(createElement(World, { map, pixelSize: 2 })), /width="128" height="128"/);
    assert.equal(
        renderToStaticMarkup(createElement(World, { map, size: 8, bits: 2 })),
        renderToStaticMarkup(createElement(PixelImage, { raster: toMapVariant(buildMap(map), { size: 8, bits: 2 }) }))
    );
});

test("icons, objects and tiles take a hex colour, and ignore anything else", () => {
    const plain = iconIds.find((id) => !colorableIconIds.includes(id));
    const hasColor = (raster, hex) => raster.colors.includes(hex);
    const heart = buildIcon("heart", { color: "#3366cc" });
    assert.ok(hasColor(heart, "#3366cc"), "the base tone is the colour");
    assert.equal(buildIcon("heart", { color: "#36c" }), buildIcon("heart", { color: "#3366CC" }), "shorthand and case give one memoised raster");
    for (const bad of ["red; x", "#12", "#gggggg", "rgb(1,2,3)", 5, {}]) assert.equal(buildIcon("heart", { color: bad }), buildIcon("heart"), String(bad));
    assert.equal(buildIcon(plain, { color: "#3366cc" }), buildIcon(plain), "icons without a main colour ignore it");
    assert.equal(buildIcon("cog", { color: "#3366cc", idle: true }), buildIcon("cog", { idle: true }), "idle ignores it");

    assert.ok(hasColor(buildObject("door", "summer", "#3366cc"), "#3366cc"));
    assert.equal(buildObject("door", undefined, "#nope"), buildObject("door"));
    assert.equal(buildObject("flower", undefined, "#3366cc") !== buildObject("flower"), true);

    const grass = buildTile("grass", "summer", { grass: "#112233" });
    assert.ok(hasColor(grass, "#112233"));
    assert.equal(buildTile("grass", "summer", { grass: "#123" }), buildTile("grass", "summer", { grass: "#112233" }));
    assert.equal(buildTile("grass", "summer", { grass: "javascript:1", bogus: "#112233" }), buildTile("grass"));
    assert.equal(buildTile("grass", "summer", { toString: "#112233" }), buildTile("grass"));
    const map = defineMap(townTileset, ["gg", "gp"], []);
    assert.ok(hasColor(buildMap(map, "summer", { grass: "#112233" }), "#112233"));
    assert.equal(buildMap(map, "summer", {}), buildMap(map));
    assert.match(renderToStaticMarkup(createElement(Icon, { id: "heart", color: "#3366cc" })), /#3366cc/i);
});

test("a palette preset swaps in fixed colours by brightness", () => {
    const gameBoy = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"];
    for (const [name, raster] of assets.slice(0, 40)) {
        const v = toVariant(raster, { palette: "game-boy" });
        assert.ok(v.colors.slice(1).every((c) => gameBoy.includes(c)), name);
        assert.deepEqual(Array.from(v.px, (ci) => ci === 0), Array.from(raster.px, (ci) => ci === 0), `${name} keeps its transparency`);
    }
    const raster = { width: 3, height: 1, colors: ["", "#111111", "#888888", "#eeeeee"], px: Uint8Array.from([1, 2, 3]) };
    const v = toVariant(raster, { palette: "sepia" });
    assert.deepEqual(v.colors, ["", "#2b1d0e", "#6b4a2b", "#e8d3a8"], "dark to the darkest tone, light to the lightest, by brightness");
    const used = (r) => new Set(Array.from(r.px, (ci) => ci && r.colors[ci]));
    assert.ok(used(toVariant(buildIcon("cog"), { palette: "game-boy" })).has("#0f380f"), "a normal icon uses the darkest tone for its outline");
    assert.ok(!used(toVariant(buildIcon("cog", { idle: true }), { palette: "game-boy" })).has("#0f380f"), "an idle icon stays faded: no darkest tone");
    assert.equal(toVariant(raster, { palette: "nope" }), raster, "unknown names are ignored");
    assert.equal(toVariant(raster, { palette: "toString" }), raster);
    assert.equal(toVariant(raster, { palette: "sepia" }), v, "memoised");
    const small = toVariant(buildIcon("heart"), { size: 8, bits: 2, palette: "night" });
    assert.equal(small.width, 8);
    assert.ok(small.colors.length - 1 <= 4);
    assert.equal(renderToStaticMarkup(createElement(Icon, { id: "heart", palette: "night" })), renderToStaticMarkup(createElement(PixelImage, { raster: toVariant(buildIcon("heart"), { palette: "night" }) })));
    const map = defineMap(townTileset, ["gg", "gp"], []);
    assert.ok(toMapVariant(buildMap(map), { palette: "game-boy" }).colors.slice(1).every((c) => gameBoy.includes(c)));
});
