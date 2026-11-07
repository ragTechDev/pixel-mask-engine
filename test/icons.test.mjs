import assert from "node:assert/strict";
import test from "node:test";
import { buildIcon, iconIds, iconInk, iconRamps } from "../dist/index.js";

const allowed = new Set([...Object.values(iconRamps).flatMap((ramp) => Object.values(ramp)), ...Object.values(iconInk)]);

test("the icon set has the like, comment and message icons", () => {
    assert.deepEqual(
        [...iconIds].sort(),
        [
            "basket", "bird_letter", "bird_letter_idle", "bird_perch", "bookmark", "bookmark_idle", "cog", "cog_idle", "comment", "cottage", "cottage_idle", "cottage_row", "cottage_row_idle", "envelope", "envelope_idle",
            "heart", "heart_empty", "jar", "mailbox", "note_ribbon", "notice_board", "notice_board_idle", "pinned_note", "quill", "quill_idle", "willage_map", "willage_map_idle", "winged_letter"
        ]
    );
});

test("every icon is a small coloured raster with some pixels filled", () => {
    for (const id of iconIds) {
        const icon = buildIcon(id);
        assert.ok(icon.width >= 8 && icon.width <= 20, `${id} width ${icon.width}`);
        assert.ok(icon.height >= 8 && icon.height <= 20, `${id} height ${icon.height}`);
        assert.ok(icon.px.some((p) => p !== 0), `${id} is empty`);
        assert.ok(icon.colors.length > 3, `${id} should be shaded, not flat`);
    }
});

test("icons only use colours from the fixed ramps and inks", () => {
    for (const id of iconIds) {
        for (const color of buildIcon(id).colors.slice(1)) assert.ok(allowed.has(color), `${id}: ${color}`);
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

test("the messenger bird has an active icon with a seal and a faded idle one without", () => {
    const active = buildIcon("bird_letter");
    const idle = buildIcon("bird_letter_idle");
    assert.equal(active.width, idle.width);
    assert.equal(active.height, idle.height);
    assert.ok(active.colors.includes(iconInk.seal), "active icon has a wax seal");
    assert.ok(!idle.colors.includes(iconInk.seal), "idle icon has none");
    assert.ok(!idle.colors.includes(iconRamps.dove.base), "idle icon is faded");
});

test("icons are memoised and an unknown icon is rejected", () => {
    assert.equal(buildIcon("basket"), buildIcon("basket"));
    assert.throws(() => buildIcon("skull"), /Unknown icon/);
});

test("the empty heart, comment bubble, idle bird, unsaved bookmark and idle envelope share one soft outline colour", () => {
    const outline = iconRamps.cream_idle.outline;
    assert.equal(iconRamps.cream_soft.outline, outline);
    for (const id of ["heart_empty", "comment", "bird_letter_idle", "bookmark_idle", "envelope_idle"]) {
        assert.ok(buildIcon(id).colors.includes(outline), `${id} uses the soft outline`);
    }
    assert.ok(!buildIcon("heart_empty").colors.includes(iconRamps.cream.outline), "heart_empty no longer uses the dark outline");
});

test("the saved bookmark is coral and the unsaved one is a faded copy of the same shape", () => {
    const saved = buildIcon("bookmark");
    const unsaved = buildIcon("bookmark_idle");
    assert.equal(saved.width, unsaved.width);
    assert.equal(saved.height, unsaved.height);
    const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
    assert.equal(shape(saved), shape(unsaved));
    assert.ok(saved.colors.includes(iconRamps.coral.base));
    assert.ok(!unsaved.colors.includes(iconRamps.coral.base));
});

test("the sent envelope is sealed and the idle one is a faded, unsealed copy of the same shape", () => {
    const sent = buildIcon("envelope");
    const idle = buildIcon("envelope_idle");
    assert.equal(sent.width, idle.width);
    assert.equal(sent.height, idle.height);
    assert.ok(sent.colors.includes(iconInk.seal), "sent envelope has a seal");
    assert.ok(!idle.colors.includes(iconInk.seal), "idle envelope has none");
});

test("the mailbox has a red flag", () => {
    assert.ok(buildIcon("mailbox").colors.some((c) => Object.values(iconRamps.heart).includes(c)), "mailbox has a red flag");
});

test("each navigation icon has a coloured version and a faded copy of the same shape", () => {
    const faded = new Set([...Object.values(iconRamps.cream_idle), ...Object.values(iconRamps.dove_wing_idle), iconInk.legs_idle]);
    for (const name of ["cottage", "quill", "cog", "willage_map", "cottage_row", "notice_board"]) {
        const active = buildIcon(name);
        const idle = buildIcon(`${name}_idle`);
        assert.equal(active.width, idle.width, name);
        assert.equal(active.height, idle.height, name);
        const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
        assert.equal(shape(active), shape(idle), `${name} keeps its shape`);
        for (const color of idle.colors.slice(1)) assert.ok(faded.has(color), `${name}_idle uses only faded colours: ${color}`);
        assert.ok(active.colors.length > idle.colors.length - 1, `${name} has more colour than its faded copy`);
    }
});

test("the cottage row has a little greenery that its faded copy loses", () => {
    const greens = Object.values(iconRamps.grass);
    assert.ok(buildIcon("cottage_row").colors.some((c) => greens.includes(c)), "cottage_row has bushes");
    assert.ok(!buildIcon("cottage_row_idle").colors.some((c) => greens.includes(c)), "the faded copy has no green");
});

