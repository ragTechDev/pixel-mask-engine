// Runs against the built package (npm test builds first), so no test runner dependency is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
    avatarKey,
    backHairStylesFor,
    buildAvatar,
    buildTile,
    clothesPalettes,
    configKey,
    createCache,
    defaultAvatarConfig,
    eyePalettes,
    hairAccessories,
    hairDrapes,
    hairPalettes,
    hairTextures,
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

test("each head orientation draws its own view", () => {
    const grid = (o, extra = {}) => {
        const r = buildAvatar({ headOrientation: o, backHairStyle: "looseBlunt", hairLength: "ear", ...extra });
        return { r, g: Array.from(r.px, (ci) => (ci ? r.colors[ci] : ".")).join(",") };
    };
    const views = ["front", "left", "right", "back"].map((o) => grid(o).g);
    assert.equal(new Set(views).size, 4);
});

test("facing left is facing right flipped", () => {
    const silhouette = (o) => {
        const { width, height, px } = buildAvatar({ headOrientation: o, backHairStyle: "looseBlunt", hairLength: "ear" });
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (px[y * width + x] ? 1 : 0)));
    };
    assert.deepEqual(silhouette("left"), silhouette("right").map((row) => row.reverse()));
});

test("hairLength falls back to shoulder length and each length draws different loose hair", () => {
    assert.equal(resolveAvatarConfig({ hairLength: "nope" }).hairLength, "shoulder");
    assert.equal(defaultAvatarConfig.hairLength, "shoulder");
    const lengths = ["ear", "chin", "shoulder", "armpit", "midBack"];
    for (const headOrientation of ["front", "left", "right", "back"]) {
        // From behind, hair over the shoulders is in front of the body and mostly hidden, so use hair down the back.
        const hairDrape = headOrientation === "back" ? "behindShoulder" : "overShoulder";
        const pictures = lengths.map((hairLength) => {
            const r = buildAvatar({ headOrientation, backHairStyle: "looseBlunt", hairLength, hairDrape });
            return Array.from(r.px, (ci) => (ci ? r.colors[ci] : ".")).join(",");
        });
        assert.equal(new Set(pictures).size, 5, headOrientation);
    }
});

test("a longer hair length makes a longer ponytail", () => {
    const pixels = (hairLength) => buildAvatar({ backHairStyle: "lowPonytailRight", hairLength }).px.filter(Boolean).length;
    // Ear length is a palm tuft rather than a short tail, so the tails start at chin length.
    const sizes = ["chin", "shoulder", "armpit", "midBack"].map(pixels);
    assert.deepEqual(sizes, [...sizes].sort((a, b) => a - b));
});

test("ear length hair can only be loose", () => {
    for (const backHairStyle of ["highPonytailRight", "lowPonytailLeft", "highPonytailMiddle", "highPigtails", "lowPigtails"]) {
        assert.equal(resolveAvatarConfig({ hairLength: "ear", backHairStyle }).backHairStyle, "looseBlunt");
        assert.equal(resolveAvatarConfig({ hairLength: "chin", backHairStyle }).backHairStyle, backHairStyle);
    }
    assert.deepEqual(backHairStylesFor("ear"), ["looseBlunt"]);
    assert.equal(backHairStylesFor("chin").length, 9);
    assert.equal(avatarKey({ hairLength: "ear", backHairStyle: "lowPigtails" }), avatarKey({ hairLength: "ear", backHairStyle: "looseBlunt" }));
});

test("the head has no outline where loose hair frames it", () => {
    const outline = skinPalettes[defaultAvatarConfig.skinTone].outline;
    const outlinePixels = (backHairStyle) => {
        const r = buildAvatar({ backHairStyle, hairLength: "shoulder" });
        const i = r.colors.indexOf(outline);
        return r.px.filter((ci) => ci === i).length;
    };
    assert.ok(outlinePixels("looseBlunt") < outlinePixels("lowPonytailRight"));
});

test("bald draws no hair at all", () => {
    const hairColours = new Set(Object.values(hairPalettes[defaultAvatarConfig.hairColor]));
    const colours = (config) => buildAvatar({ hairColor: defaultAvatarConfig.hairColor, ...config }).colors;
    assert.ok(colours({ hairLength: "shoulder" }).some((c) => hairColours.has(c)));
    for (const headOrientation of ["front", "left", "right", "back"]) {
        assert.ok(!colours({ headOrientation, hairLength: "bald" }).some((c) => hairColours.has(c)), headOrientation);
    }
    assert.deepEqual(backHairStylesFor("bald"), ["looseBlunt"]);
    assert.equal(avatarKey({ hairLength: "bald", backHairStyle: "lowPigtails" }), avatarKey({ hairLength: "bald", backHairStyle: "looseBlunt" }));
});

test("hair texture defaults to straight and each texture draws different hair", () => {
    assert.equal(defaultAvatarConfig.hairTexture, "straight");
    assert.equal(resolveAvatarConfig({ hairTexture: "frizzy" }).hairTexture, "straight");
    assert.deepEqual(Object.keys(hairTextures), ["straight", "wavy", "curly", "coiled"]);
    assert.equal(avatarKey({}), avatarKey({ hairTexture: "straight" }));
    const count = (hairTexture) => buildAvatar({ backHairStyle: "looseBlunt", hairLength: "shoulder", hairTexture }).px.filter(Boolean).length;
    const sizes = Object.keys(hairTextures).map(count);
    assert.equal(new Set(sizes).size, sizes.length);
    assert.ok(count("coiled") > count("straight"));
});

test("a bald head is the same in every texture", () => {
    const grid = (hairTexture) => Array.from(buildAvatar({ hairLength: "bald", hairTexture }).px).join(",");
    assert.equal(new Set(Object.keys(hairTextures).map(grid)).size, 1);
});

test("hair can fall over the shoulders, hang behind them, or have some of each", () => {
    assert.equal(defaultAvatarConfig.hairDrape, "overShoulder");
    assert.deepEqual(Object.keys(hairDrapes), ["overShoulder", "behindShoulder", "overAndBehindShoulder"]);
    assert.equal(resolveAvatarConfig({ hairDrape: "nope" }).hairDrape, "overShoulder");
    const grid = (config) => {
        const r = buildAvatar(config);
        return Array.from(r.px, (ci) => (ci ? r.colors[ci] : ".")).join(",");
    };
    for (const backHairStyle of ["looseBlunt", "lowPigtails"]) {
        // In profile a tail hangs behind the head and never reaches the body, so only loose hair differs.
        for (const headOrientation of backHairStyle === "looseBlunt" ? ["front", "right", "back"] : ["front", "back"]) {
            const base = { backHairStyle, hairLength: "armpit", headOrientation };
            assert.notEqual(grid({ ...base, hairDrape: "overShoulder" }), grid({ ...base, hairDrape: "behindShoulder" }), `${backHairStyle} ${headOrientation}`);
        }
    }
    // Some of each is a strand over the shoulder with the rest behind. From behind the strand is hidden by the body.
    for (const headOrientation of ["front", "right"]) {
        const base = { backHairStyle: "looseBlunt", hairLength: "armpit", headOrientation };
        const some = grid({ ...base, hairDrape: "overAndBehindShoulder" });
        assert.notEqual(some, grid({ ...base, hairDrape: "overShoulder" }), `${headOrientation} some vs over`);
        assert.notEqual(some, grid({ ...base, hairDrape: "behindShoulder" }), `${headOrientation} some vs behind`);
    }
});

test("a tail has no hair left to hang behind, so some of each is over the shoulder", () => {
    for (const backHairStyle of ["highPonytailRight", "lowPigtails"]) {
        const some = { backHairStyle, hairLength: "armpit", hairDrape: "overAndBehindShoulder" };
        assert.equal(avatarKey(some), avatarKey({ ...some, hairDrape: "overShoulder" }), backHairStyle);
    }
    assert.notEqual(avatarKey({ hairLength: "armpit", backHairStyle: "looseBlunt", hairDrape: "overAndBehindShoulder" }), avatarKey({ hairLength: "armpit", backHairStyle: "looseBlunt" }));
});

test("hair above the shoulders has no drape to choose", () => {
    for (const hairLength of ["bald", "ear", "chin"]) {
        assert.equal(avatarKey({ hairLength, hairDrape: "behindShoulder" }), avatarKey({ hairLength, hairDrape: "overShoulder" }), hairLength);
    }
    assert.notEqual(avatarKey({ hairLength: "shoulder", hairDrape: "behindShoulder" }), avatarKey({ hairLength: "shoulder" }));
});

test("loose hair can be cut blunt, in a V or in a U", () => {
    const grid = (config) => {
        const r = buildAvatar(config);
        return Array.from(r.px, (ci) => (ci ? r.colors[ci] : ".")).join(",");
    };
    for (const hairLength of ["shoulder", "armpit", "midBack"]) {
        for (const headOrientation of ["right", "back"]) {
            const base = { hairLength, hairDrape: "behindShoulder", headOrientation };
            const cuts = ["looseBlunt", "looseV", "looseU"].map((backHairStyle) => grid({ ...base, backHairStyle }));
            assert.equal(new Set(cuts).size, 3, `${hairLength} ${headOrientation}`);
        }
    }
    // The cuts need hair that hangs below the head.
    for (const hairLength of ["bald", "ear", "chin"]) {
        for (const backHairStyle of ["looseV", "looseU"]) {
            assert.equal(resolveAvatarConfig({ hairLength, backHairStyle }).backHairStyle, "looseBlunt", `${hairLength} ${backHairStyle}`);
        }
    }
    assert.deepEqual(backHairStylesFor("shoulder").filter((id) => id.startsWith("loose")), ["looseBlunt", "looseV", "looseU"]);
    assert.ok(!backHairStylesFor("chin").includes("looseV"));
});

test("a ponytail can be on the right, on the left or in the middle", () => {
    const grid = (config) => {
        const r = buildAvatar(config);
        return Array.from(r.px, (ci) => (ci ? r.colors[ci] : ".")).join(",");
    };
    assert.equal(defaultAvatarConfig.backHairStyle, "lowPonytailRight");
    for (const height of ["high", "low"]) {
        for (const headOrientation of ["front", "back"]) {
            const pictures = ["Right", "Left", "Middle"].map((side) =>
                grid({ headOrientation, hairLength: "armpit", backHairStyle: `${height}Ponytail${side}` })
            );
            assert.equal(new Set(pictures).size, 3, `${height} ${headOrientation}`);
        }
    }
    // The left ponytail is the right one flipped, so from the front it sits on the other side.
    const silhouette = (backHairStyle, headOrientation) => {
        const { width, height, px } = buildAvatar({ headOrientation, hairLength: "armpit", backHairStyle });
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (px[y * width + x] ? 1 : 0)));
    };
    assert.deepEqual(silhouette("highPonytailLeft", "front"), silhouette("highPonytailRight", "front").map((row) => row.reverse()));
    // A middle tail hangs behind the head, so it has no shoulder to fall over.
    assert.equal(avatarKey({ backHairStyle: "lowPonytailMiddle", hairLength: "armpit", hairDrape: "behindShoulder" }), avatarKey({ backHairStyle: "lowPonytailMiddle", hairLength: "armpit" }));
});

test("a ponytail or pigtails can have a hairtie, a scrunchie or a bow in a colour", () => {
    assert.equal(defaultAvatarConfig.hairAccessory, "none");
    assert.deepEqual(Object.keys(hairAccessories), ["none", "hairtie", "scrunchie", "bow"]);
    assert.equal(resolveAvatarConfig({ backHairStyle: "lowPigtails", hairAccessory: "feather" }).hairAccessory, "none");
    const red = Object.values(clothesPalettes.red);
    const reds = (config) => {
        const r = buildAvatar({ clothesColor: "blue", topStyle: "none", bottomStyle: "none", shoeStyle: "none", ...config });
        return r.px.filter((ci) => ci && red.includes(r.colors[ci])).length;
    };
    for (const backHairStyle of ["highPonytailRight", "lowPonytailLeft", "highPonytailMiddle", "lowPigtails"]) {
        for (const headOrientation of ["front", "back", "right"]) {
            const base = { backHairStyle, hairLength: "armpit", headOrientation, hairAccessoryColor: "red" };
            assert.equal(reds({ ...base, hairAccessory: "none" }), 0, `${backHairStyle} ${headOrientation} none`);
            // From behind a high ponytail falls over its tie, so a hairtie can be hidden there; the wider ones still peek out.
            const hidden = headOrientation === "back" && backHairStyle.startsWith("high") && backHairStyle.includes("Ponytail");
            for (const hairAccessory of hidden ? ["scrunchie", "bow"] : ["hairtie", "scrunchie", "bow"]) {
                assert.ok(reds({ ...base, hairAccessory }) > 0, `${backHairStyle} ${headOrientation} ${hairAccessory}`);
            }
            if (hidden) assert.ok(reds({ ...base, hairAccessory: "hairtie" }) < reds({ ...base, hairAccessory: "scrunchie" }), `${backHairStyle} hairtie is mostly hidden`);
        }
    }
    assert.ok(reds({ hairLength: "armpit", backHairStyle: "lowPigtails", hairAccessory: "bow", hairAccessoryColor: "red" }) > reds({ hairLength: "armpit", backHairStyle: "lowPigtails", hairAccessory: "hairtie", hairAccessoryColor: "red" }));
});

test("only tied hair has an accessory, and with none its colour does not count", () => {
    for (const config of [{ backHairStyle: "looseBlunt", hairLength: "armpit" }, { backHairStyle: "lowPigtails", hairLength: "ear" }, { backHairStyle: "lowPigtails", hairLength: "bald" }]) {
        assert.equal(resolveAvatarConfig({ ...config, hairAccessory: "bow" }).hairAccessory, "none", JSON.stringify(config));
        assert.equal(avatarKey({ ...config, hairAccessory: "bow", hairAccessoryColor: "red" }), avatarKey(config));
    }
    const tied = { backHairStyle: "lowPigtails", hairLength: "armpit" };
    assert.equal(avatarKey({ ...tied, hairAccessory: "none", hairAccessoryColor: "red" }), avatarKey(tied));
    assert.notEqual(avatarKey({ ...tied, hairAccessory: "bow", hairAccessoryColor: "red" }), avatarKey({ ...tied, hairAccessory: "bow" }));
    // The accessory follows the clothes colour until it has a colour of its own.
    assert.equal(avatarKey({ ...tied, hairAccessory: "bow", hairAccessoryColor: "blue" }), avatarKey({ ...tied, hairAccessory: "bow", clothesColor: "blue" }));
});
