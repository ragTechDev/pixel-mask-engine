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
        assert.ok(raster.colors.slice(1).every((c) => Object.values(tilePalettes.default).includes(c)));
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
