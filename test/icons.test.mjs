import assert from "node:assert/strict";
import test from "node:test";
import { buildIcon, iconIds, iconRamps } from "../dist/index.js";

const rampColours = new Set(Object.values(iconRamps).flatMap((ramp) => Object.values(ramp)));

test("the icon set has the like, comment and pass-it-on icons", () => {
    assert.deepEqual([...iconIds].sort(), ["basket", "comment", "heart", "heart_empty"]);
});

test("every icon is a small coloured raster with some pixels filled", () => {
    for (const id of iconIds) {
        const icon = buildIcon(id);
        assert.ok(icon.width >= 8 && icon.width <= 16, `${id} width ${icon.width}`);
        assert.ok(icon.height >= 8 && icon.height <= 16, `${id} height ${icon.height}`);
        assert.ok(icon.px.some((p) => p !== 0), `${id} is empty`);
        assert.ok(icon.colors.length > 3, `${id} should be shaded, not flat`);
    }
});

test("icons only use colours from the fixed ramps or the flat ink", () => {
    for (const id of iconIds) {
        for (const color of buildIcon(id).colors.slice(1)) {
            assert.ok(rampColours.has(color) || color === "#5A3B22", `${id}: ${color}`);
        }
    }
});

test("the filled and empty hearts have the same shape in different colours", () => {
    const filled = buildIcon("heart");
    const empty = buildIcon("heart_empty");
    assert.equal(filled.width, empty.width);
    assert.equal(filled.height, empty.height);
    const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
    assert.equal(shape(filled), shape(empty));
    assert.notDeepEqual(filled.colors, empty.colors);
});

test("icons are memoised and an unknown icon is rejected", () => {
    assert.equal(buildIcon("basket"), buildIcon("basket"));
    assert.throws(() => buildIcon("skull"), /Unknown icon/);
});
