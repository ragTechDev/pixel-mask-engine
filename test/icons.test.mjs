import assert from "node:assert/strict";
import test from "node:test";
import { ICON_SIZE, buildIcon, colorRamps, colorableIconIds, iconCategories, iconColors, iconIds, iconInk, iconRamps, idleIconIds } from "../dist/index.js";

const allowed = new Set([...Object.values(iconRamps).flatMap((ramp) => Object.values(ramp)), ...Object.values(colorRamps).flatMap((ramp) => Object.values(ramp)), ...Object.values(iconInk)]);

test("the icon set has the like, comment and message icons", () => {
    assert.deepEqual(
        [...iconIds].sort(),
        [
            "basket", "bird_letter", "bird_perch", "bookmark", "cog", "comment", "copy", "cottage", "cottage_row", "dice", "envelope",
            "heart", "heart_empty", "jar", "mailbox", "note_ribbon", "notice_board", "pinned_note", "quill", "reset", "save", "willage_map", "winged_letter"
        ]
    );
});

test("faded icons are an option, not separate ids", () => {
    assert.ok(iconIds.every((id) => !id.endsWith("_idle")));
    assert.deepEqual(
        [...idleIconIds].sort(),
        ["bird_letter", "bookmark", "cog", "cottage", "cottage_row", "envelope", "notice_board", "quill", "willage_map"]
    );
    assert.deepEqual(Object.values(iconCategories).flat().sort(), [...iconIds].sort());
    assert.throws(() => buildIcon("cog_idle"), /Unknown icon/);
});

test("idle changes the colours but not the shape, is memoised, and is ignored where there is no idle look", () => {
    const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
    for (const id of idleIconIds) {
        const idle = buildIcon(id, { idle: true });
        assert.notEqual(idle, buildIcon(id), id);
        assert.equal(buildIcon(id, { idle: true }), idle, `${id} is memoised`);
        assert.equal(buildIcon(id, { idle: false }), buildIcon(id));
        assert.equal(shape(idle), shape(buildIcon(id)), `${id} keeps its shape`);
    }
    assert.equal(buildIcon("basket", { idle: true }), buildIcon("basket"));
});

test("every icon is a small coloured raster with some pixels filled", () => {
    for (const id of iconIds) {
        const icon = buildIcon(id);
        assert.equal(icon.width, ICON_SIZE, `${id} width`);
        assert.equal(icon.height, ICON_SIZE, `${id} height`);
        assert.ok(icon.px.some((p) => p !== 0), `${id} is empty`);
        assert.ok(icon.colors.length > 3, `${id} should be shaded, not flat`);
    }
});

test("every icon sits on the same square canvas, centred, with the widest icon touching its edges", () => {
    const extent = (icon) => {
        let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
        icon.px.forEach((p, i) => {
            if (!p) return;
            const x = i % icon.width, y = Math.floor(i / icon.width);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        });
        return { w: maxX - minX + 1, h: maxY - minY + 1, left: minX, top: minY, right: ICON_SIZE - 1 - maxX, bottom: ICON_SIZE - 1 - maxY };
    };
    const boxes = iconIds.map((id) => extent(buildIcon(id)));
    assert.equal(Math.max(...boxes.map((b) => Math.max(b.w, b.h))), ICON_SIZE, "no icon is wider than the canvas, and one fills it");
    for (const b of boxes) {
        assert.ok(Math.abs(b.left - b.right) <= 1 && Math.abs(b.top - b.bottom) <= 1, "centred");
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
    const idle = buildIcon("bird_letter", { idle: true });
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
    for (const [id, idle] of [["heart_empty"], ["comment"], ["bird_letter", true], ["bookmark", true], ["envelope", true]]) {
        assert.ok(buildIcon(id, { idle }).colors.includes(outline), `${id} uses the soft outline`);
    }
    assert.ok(!buildIcon("heart_empty").colors.includes(iconRamps.cream.outline), "heart_empty no longer uses the dark outline");
});

test("the saved bookmark is coral and the unsaved one is a faded copy of the same shape", () => {
    const saved = buildIcon("bookmark");
    const unsaved = buildIcon("bookmark", { idle: true });
    assert.equal(saved.width, unsaved.width);
    assert.equal(saved.height, unsaved.height);
    const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
    assert.equal(shape(saved), shape(unsaved));
    assert.ok(saved.colors.includes(iconRamps.coral.base));
    assert.ok(!unsaved.colors.includes(iconRamps.coral.base));
});

test("the sent envelope is sealed and the idle one is a faded, unsealed copy of the same shape", () => {
    const sent = buildIcon("envelope");
    const idle = buildIcon("envelope", { idle: true });
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
        const idle = buildIcon(name, { idle: true });
        assert.equal(active.width, idle.width, name);
        assert.equal(active.height, idle.height, name);
        const shape = (r) => [...r.px].map((p) => (p === 0 ? 0 : 1)).join("");
        assert.equal(shape(active), shape(idle), `${name} keeps its shape`);
        for (const color of idle.colors.slice(1)) assert.ok(faded.has(color), `${name} idle uses only faded colours: ${color}`);
        assert.ok(active.colors.length > idle.colors.length - 1, `${name} has more colour than its faded copy`);
    }
});

test("the cottage row has a little greenery that its faded copy loses", () => {
    const greens = Object.values(iconRamps.grass);
    assert.ok(buildIcon("cottage_row").colors.some((c) => greens.includes(c)), "cottage_row has bushes");
    assert.ok(!buildIcon("cottage_row", { idle: true }).colors.some((c) => greens.includes(c)), "the faded copy has no green");
});


test("icons with a main colour can be shown in the common colours, in the same shape", () => {
    assert.deepEqual(
        [...colorableIconIds].sort(),
        ["bookmark", "cog", "cottage", "heart", "jar", "mailbox", "note_ribbon", "notice_board", "pinned_note", "quill", "willage_map"]
    );
    const shape = (r) => Array.from(r.px, (p) => (p === 0 ? 0 : 1)).join("");
    for (const id of colorableIconIds) {
        const plain = buildIcon(id);
        for (const color of iconColors) {
            const recoloured = buildIcon(id, { color });
            assert.equal(shape(recoloured), shape(plain), `${id} keeps its shape in ${color}`);
            assert.ok(Object.values(colorRamps[color]).some((c) => recoloured.colors.includes(c)), `${id} uses ${color}`);
            assert.equal(buildIcon(id, { color }), recoloured, "memoised");
        }
        assert.notDeepEqual(buildIcon(id, { color: "blue" }).colors, buildIcon(id, { color: "green" }).colors, `${id} differs between colours`);
    }
});

test("colour is ignored where an icon has no main colour, for unknown colours and on idle icons", () => {
    assert.equal(buildIcon("basket", { color: "blue" }), buildIcon("basket"));
    assert.equal(buildIcon("heart", { color: "plaid" }), buildIcon("heart"));
    assert.equal(buildIcon("cottage", { idle: true, color: "blue" }), buildIcon("cottage", { idle: true }));
    assert.equal(buildIcon("heart", { color: "toString" }), buildIcon("heart"), "inherited keys are not colours");
});
