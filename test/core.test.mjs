// Runs against the built package (npm test builds first), so no test runner dependency is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
    avatarKey,
    buildAvatar,
    buildTile,
    clothesPalettes,
    configKey,
    createCache,
    defaultAvatarConfig,
    eyePalettes,
    hairPalettes,
    resolveAvatarConfig,
    skinPalettes,
    tileIds,
    tilePalettes,
    toSvgPaths
} from "../dist/index.js";

const allPaletteColors = new Set(
    [skinPalettes, hairPalettes, eyePalettes, clothesPalettes].flatMap((t) =>
        Object.values(t).flatMap((r) => Object.values(r))
    )
);

test("configKey ignores key order and undefined values", () => {
    assert.equal(configKey({ b: "2", a: "1", c: undefined }), configKey({ a: "1", b: "2" }));
    assert.notEqual(configKey({ a: "1" }), configKey({ a: "2" }));
});

test("avatarKey normalises defaults", () => {
    assert.equal(avatarKey({}), avatarKey(defaultAvatarConfig));
    assert.notEqual(avatarKey({}), avatarKey({ hairColor: "black" }));
});

test("resolveAvatarConfig replaces unknown values with defaults", () => {
    const resolved = resolveAvatarConfig({ skinTone: "#ff0000", hairColor: "__proto__", eyeColor: "green" });
    assert.equal(resolved.skinTone, defaultAvatarConfig.skinTone);
    assert.equal(resolved.hairColor, defaultAvatarConfig.hairColor);
    assert.equal(resolved.eyeColor, "green");
});

test("createCache builds once per key and evicts least recently used", () => {
    const cache = createCache(2);
    let builds = 0;
    const build = () => ++builds;
    cache.get("a", build);
    cache.get("a", build);
    assert.equal(builds, 1);
    cache.get("b", build);
    cache.get("a", build); // a is now most recent
    cache.get("c", build); // evicts b
    assert.equal(cache.size, 2);
    cache.get("a", build);
    assert.equal(builds, 3);
    cache.get("b", build);
    assert.equal(builds, 4);
});

test("buildAvatar only uses fixed palette colours and keeps colour", () => {
    const raster = buildAvatar({ skinTone: "brown", hairColor: "blonde" });
    assert.ok(raster.colors.slice(1).every((c) => allPaletteColors.has(c)));
    for (const tone of Object.values(skinPalettes.brown)) assert.ok(raster.colors.includes(tone), tone);
    assert.ok(raster.colors.includes(hairPalettes.blonde.base));
    assert.ok(raster.px.some((v) => v !== 0));
});

test("buildAvatar is deterministic and size is stable across poses", () => {
    const a = buildAvatar({ armPose: "down" });
    const b = buildAvatar({ armPose: "down" });
    const c = buildAvatar({ armPose: "forward", legPose: "step" });
    assert.deepEqual(a.px, b.px);
    assert.deepEqual([a.width, a.height], [c.width, c.height]);
});

test("buildTile resolves the fixed tile palette", () => {
    for (const id of tileIds) {
        const raster = buildTile(id);
        assert.deepEqual([raster.width, raster.height], [16, 16]);
        assert.ok(raster.colors.slice(1).every((c) => Object.values(tilePalettes.summer).includes(c)));
        assert.equal(buildTile(id), raster, "memoised");
    }
});

test("toSvgPaths covers exactly the opaque pixels", () => {
    const raster = buildAvatar({});
    const opaque = raster.px.filter((v) => v !== 0).length;
    const covered = toSvgPaths(raster)
        .flatMap((p) => [...p.d.matchAll(/h(\d+)v1/g)])
        .reduce((sum, m) => sum + Number(m[1]), 0);
    assert.equal(covered, opaque);
});

test("each piece of clothing can have its own colour, following clothesColor when it has none", () => {
    const has = (raster, name) => Object.values(clothesPalettes[name]).some((c) => raster.colors.includes(c));
    const plain = buildAvatar({ clothesColor: "red" });
    assert.ok(has(plain, "red") && !has(plain, "blue"), "every piece follows clothesColor");

    const mixed = buildAvatar({ clothesColor: "red", topColor: "blue", bottomColor: "green", shoeColor: "yellow" });
    for (const name of ["blue", "green", "yellow"]) assert.ok(has(mixed, name), `${name} piece is drawn`);
    assert.ok(!has(mixed, "red"), "nothing is left in the clothes colour once every piece has its own");

    const shoesOnly = buildAvatar({ shoeColor: "red" });
    assert.ok(has(shoesOnly, "red") && has(shoesOnly, "blue"), "only the shoes change");
    const shape = (r) => Array.from(r.px, (p) => (p === 0 ? 0 : 1)).join("");
    assert.equal(shape(shoesOnly), shape(buildAvatar()), "the shape is the same");

    const dress = buildAvatar({ topStyle: "dress", topColor: "pink", bottomColor: "green" });
    assert.ok(has(dress, "pink") && !has(dress, "green"), "a dress takes the top colour, and the bottom colour has nothing to colour");
});

test("piece colours that match clothesColor, or are unknown, change nothing", () => {
    assert.equal(avatarKey({ clothesColor: "red", topColor: "red" }), avatarKey({ clothesColor: "red" }));
    assert.equal(avatarKey({ topColor: "plaid" }), avatarKey());
    assert.equal(avatarKey({ topColor: "toString" }), avatarKey(), "inherited keys are not colours");
    assert.notEqual(avatarKey({ topColor: "red" }), avatarKey());
    assert.deepEqual(resolveAvatarConfig({ topColor: "red" }).topColor, "red");
    assert.equal("topColor" in resolveAvatarConfig({ topColor: "blue" }), false, "blue is the clothes colour here");
    assert.deepEqual(buildAvatar({ topColor: "blue" }), buildAvatar(), "the default avatar's pixels are unchanged");
});

test("a dress or overalls is a top that covers the bottom", () => {
    for (const topStyle of ["dress", "overalls"]) {
        assert.deepEqual(buildAvatar({ topStyle, bottomStyle: "skirt" }), buildAvatar({ topStyle, bottomStyle: "none" }), `${topStyle} hides the bottom`);
        assert.notDeepEqual(buildAvatar({ topStyle }), buildAvatar({ topStyle: "shirt" }), `${topStyle} is not a shirt`);
    }
    assert.notDeepEqual(buildAvatar({ topStyle: "shirt", bottomStyle: "skirt" }), buildAvatar({ topStyle: "shirt", bottomStyle: "none" }), "a shirt does not");
});

test("the old fullOutfitStyle and outfitColor options are gone", () => {
    const resolved = resolveAvatarConfig({ fullOutfitStyle: "dress", outfitColor: "pink" });
    assert.equal("fullOutfitStyle" in resolved, false);
    assert.equal("outfitColor" in resolved, false);
    assert.deepEqual(buildAvatar({ fullOutfitStyle: "dress" }), buildAvatar());
});

test("black is not a clothes colour", () => {
    assert.equal("black" in clothesPalettes, false);
    assert.equal(resolveAvatarConfig({ clothesColor: "black" }).clothesColor, defaultAvatarConfig.clothesColor, "it falls back to the default");
    assert.equal("topColor" in resolveAvatarConfig({ topColor: "black" }), false);
});
