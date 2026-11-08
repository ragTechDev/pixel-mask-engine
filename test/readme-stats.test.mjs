import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the README counts match the built package (run `pnpm stats` after adding art)", () => {
    const run = spawnSync(process.execPath, ["scripts/stats.mjs", "--check"], { encoding: "utf8" });
    assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});
