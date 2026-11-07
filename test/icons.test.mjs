import assert from "node:assert/strict";
import test from "node:test";
import { iconIds, iconMask, iconSvg } from "../dist/index.js";

test("the icon set has the like, repost and comment icons", () => {
    assert.deepEqual([...iconIds].sort(), ["comment", "heart", "heart_outline", "repost"]);
});

test("every icon is a 9 by 8 grid of 0 and 1 with some pixels filled", () => {
    for (const id of iconIds) {
        const rows = iconMask(id);
        assert.equal(rows.length, 8, id);
        for (const row of rows) assert.match(row, /^[01]{9}$/, id);
        assert.ok(rows.join("").includes("1"), `${id} is empty`);
    }
});

test("the filled heart has more pixels than its outline, and both are symmetric", () => {
    const count = (id) => iconMask(id).join("").split("1").length - 1;
    assert.ok(count("heart") > count("heart_outline"));
    for (const id of ["heart", "heart_outline"]) {
        for (const row of iconMask(id)) assert.equal(row, [...row].reverse().join(""), id);
    }
});

test("icon SVG takes its colour from the text and scales by pixel", () => {
    for (const id of iconIds) {
        const svg = iconSvg(id, 3);
        assert.match(svg, /^<svg /);
        assert.match(svg, /fill="currentColor"/);
        assert.match(svg, /width="27" height="24"/);
        assert.match(svg, /viewBox="0 0 9 8"/);
    }
});

test("an unknown icon is rejected", () => {
    assert.throws(() => iconMask("skull"), /Unknown icon/);
});
