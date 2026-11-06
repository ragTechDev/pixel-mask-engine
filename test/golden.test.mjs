// Pixel-for-pixel check against the pre-refactor React/SVG renderer.
// Fixture: per-pixel SHA-256 fingerprints recorded from commit db0a2c2.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { buildAvatar } from "../dist/index.js";

const { avatars } = JSON.parse(readFileSync(new URL("./fixtures/avatar-golden.json", import.meta.url), "utf8"));

test(`buildAvatar matches the original renderer for ${avatars.length} configs`, () => {
    for (const { config, width, height, sha256 } of avatars) {
        const r = buildAvatar(config);
        const grid = Array.from(r.px, (ci) => (ci ? r.colors[ci] : "."));
        const label = JSON.stringify(config);
        assert.deepEqual([r.width, r.height], [width, height], label);
        assert.equal(createHash("sha256").update(grid.join(",")).digest("hex"), sha256, label);
    }
});
