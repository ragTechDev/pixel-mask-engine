import assert from "node:assert/strict";
import test from "node:test";
import { extractNotes, MARKER, nextVersion, parseCommit, renderSection, suggestBump } from "../scripts/changelog.mjs";

test("parseCommit reads type, scope, text and breaking markers", () => {
    assert.deepEqual(parseCommit("feat(world): add roofs"), { type: "feat", scope: "world", text: "add roofs", breaking: false });
    assert.equal(parseCommit("fix: a bug").scope, undefined);
    assert.equal(parseCommit("refactor(world)!: drop tilePalette").breaking, true);
    assert.equal(parseCommit("feat: x", "Details.\n\nBREAKING CHANGE: removed y").breaking, true);
    assert.equal(parseCommit("feat: x", "mentions BREAKING CHANGE: mid-line? no").breaking, false);
    assert.equal(parseCommit("Merge pull request #1"), null);
});

const c = (subject, body) => parseCommit(subject, body);

test("suggestBump follows semver, with breaking changes bumping the minor before 1.0", () => {
    assert.equal(suggestBump([c("fix: a")], "0.1.1"), "patch");
    assert.equal(suggestBump([c("fix: a"), c("feat: b")], "0.1.1"), "minor");
    assert.equal(suggestBump([c("refactor!: c")], "0.1.1"), "minor");
    assert.equal(suggestBump([c("refactor!: c")], "1.4.0"), "major");
    assert.equal(suggestBump([c("feat: b")], "1.4.0"), "minor");
    assert.equal(suggestBump([c("chore: x"), c("docs: y"), c("ci: z"), c("test: t")], "0.1.1"), null);
    assert.equal(suggestBump([c("chore!: x")], "0.1.1"), "minor", "a breaking chore still counts");
    assert.equal(suggestBump([], "0.1.1"), null);
});

test("nextVersion", () => {
    assert.equal(nextVersion("0.1.1", "patch"), "0.1.2");
    assert.equal(nextVersion("0.1.1", "minor"), "0.2.0");
    assert.equal(nextVersion("1.4.2", "major"), "2.0.0");
});

test("renderSection groups commits and leaves internal ones out", () => {
    const section = renderSection("0.2.0", "2026-11-07", [
        { ...c("feat(world): add roofs"), sha: "aaa1111" },
        { ...c("fix: odd seam"), sha: "bbb2222" },
        { ...c("refactor(world)!: drop tilePalette"), sha: "ccc3333" },
        { ...c("chore(deps): bump vite"), sha: "ddd4444" },
        { ...c("docs: readme"), sha: "eee5555" }
    ]);
    assert.match(section, /^## \[0\.2\.0\] - 2026-11-07/);
    assert.ok(section.indexOf("### Breaking changes") < section.indexOf("### Added"));
    assert.ok(section.indexOf("### Added") < section.indexOf("### Fixed"));
    assert.match(section, /- \*\*world:\*\* add roofs \(aaa1111\)/);
    assert.match(section, /- odd seam \(bbb2222\)/);
    assert.match(section, /drop tilePalette/);
    assert.ok(!section.includes("bump vite") && !section.includes("readme"));
    assert.ok(!section.includes("### Changed"), "empty groups are omitted");
});

test("extractNotes returns one version's body", () => {
    const log = `# Changelog\n\n${MARKER}\n\n## [0.2.0] - 2026-11-07\n\n### Added\n- a\n\n## [0.1.1] - 2026-11-01\n\n- b\n`;
    assert.equal(extractNotes(log, "0.2.0"), "### Added\n- a");
    assert.equal(extractNotes(log, "v0.1.1"), "- b");
    assert.equal(extractNotes(log, "0.3.0"), null);
    assert.equal(extractNotes("## [0.2.0] - x\n\n## [0.1.1] - y\n- b\n", "0.2.0"), null, "an empty section counts as missing");
});
