#!/usr/bin/env node
// Zero-dependency release helper. Reads the conventional commits since the last
// version tag and drafts the next CHANGELOG.md section and version bump.
//
//   node scripts/changelog.mjs                 print the suggested bump and a draft section
//   node scripts/changelog.mjs --write         insert the draft section into CHANGELOG.md
//   node scripts/changelog.mjs --notes 0.2.0   print one version's notes (used by the release workflow)
//
// Commit format: `type(scope): subject`. A breaking change is marked with `!`
// after the scope (`refactor(world)!: ...`) or a `BREAKING CHANGE:` footer.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Commit types that reach the changelog, and the section each belongs to. */
const SECTIONS = { feat: "Added", fix: "Fixed", perf: "Changed", refactor: "Changed", revert: "Changed" };
const ORDER = ["Breaking changes", "Added", "Changed", "Fixed"];
export const MARKER = "<!-- next-release -->";

export function parseCommit(subject, body = "") {
    const match = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(subject);
    if (!match) return null;
    const [, type, scope, bang, text] = match;
    return { type, scope, text, breaking: Boolean(bang) || /^BREAKING[ -]CHANGE:/m.test(body) };
}

const releasable = (commit) => commit.breaking || commit.type in SECTIONS;

/** "major", "minor", "patch" or null. Before 1.0 a breaking change bumps the minor. */
export function suggestBump(commits, version) {
    const list = commits.filter(releasable);
    if (list.length === 0) return null;
    if (list.some((c) => c.breaking)) return Number(version.split(".")[0]) >= 1 ? "major" : "minor";
    return list.some((c) => c.type === "feat") ? "minor" : "patch";
}

export function nextVersion(version, bump) {
    const [major, minor, patch] = version.split(".").map(Number);
    if (bump === "major") return `${major + 1}.0.0`;
    if (bump === "minor") return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
}

export function renderSection(version, date, commits) {
    const groups = new Map(ORDER.map((name) => [name, []]));
    for (const commit of commits.filter(releasable)) {
        const group = commit.breaking ? "Breaking changes" : SECTIONS[commit.type];
        const line = `- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.text}${commit.sha ? ` (${commit.sha})` : ""}`;
        groups.get(group).push(line);
    }
    const parts = [`## [${version}] - ${date}`];
    for (const [name, lines] of groups) if (lines.length) parts.push(`### ${name}\n${lines.join("\n")}`);
    return parts.join("\n\n") + "\n";
}

/** The body of one version's section, or null when it is missing or empty. */
export function extractNotes(changelog, version) {
    const lines = changelog.split("\n");
    const start = lines.findIndex((line) => line.startsWith(`## [${version.replace(/^v/, "")}]`));
    if (start === -1) return null;
    let end = lines.findIndex((line, i) => i > start && line.startsWith("## ["));
    if (end === -1) end = lines.length;
    const body = lines.slice(start + 1, end).join("\n").trim();
    return body === "" ? null : body;
}

function git(...args) {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function lastTag() {
    try {
        return git("describe", "--tags", "--abbrev=0", "--match", "v[0-9]*");
    } catch {
        return null;
    }
}

function readCommits(tag) {
    const range = tag ? [`${tag}..HEAD`] : [];
    const raw = execFileSync("git", ["log", ...range, "--format=%h%x1f%s%x1f%b%x1e"], { encoding: "utf8" });
    return raw
        .split("\x1e")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const [sha, subject, body] = entry.split("\x1f");
            const commit = parseCommit(subject, body);
            return commit && { ...commit, sha };
        })
        .filter(Boolean);
}

function main(args) {
    const changelog = readFileSync("CHANGELOG.md", "utf8");

    if (args[0] === "--notes") {
        const notes = args[1] && extractNotes(changelog, args[1]);
        if (!notes) {
            console.error(`CHANGELOG.md has no notes for version ${args[1] ?? "(none given)"}.`);
            process.exit(1);
        }
        console.log(notes);
        return;
    }

    const { version } = JSON.parse(readFileSync("package.json", "utf8"));
    const tag = lastTag();
    const commits = readCommits(tag);
    const bump = suggestBump(commits, version);
    if (!bump) {
        console.error(`No releasable commits (feat, fix, perf, refactor, revert or breaking) since ${tag ?? "the start"}.`);
        process.exit(1);
    }
    const next = nextVersion(version, bump);
    const section = renderSection(next, new Date().toLocaleDateString("en-CA"), commits);

    if (args[0] === "--write") {
        if (!changelog.includes(MARKER)) throw new Error(`CHANGELOG.md has no ${MARKER} marker.`);
        if (changelog.includes(`## [${next}]`)) throw new Error(`CHANGELOG.md already has a ${next} section.`);
        writeFileSync("CHANGELOG.md", changelog.replace(MARKER, `${MARKER}\n\n${section}`));
        console.error(`Wrote the ${next} section to CHANGELOG.md. Edit it, commit it, then run: pnpm version ${bump}`);
        return;
    }

    console.log(`Last tag: ${tag ?? "(none)"}  |  ${commits.length} conventional commits`);
    console.log(`Suggested bump: ${bump} -> ${next}\n`);
    console.log(section);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        main(process.argv.slice(2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
