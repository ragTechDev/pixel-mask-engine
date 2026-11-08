// Checks every *.mask.ts under src: pnpm check:masks [avatar|world|icons ...] [--strict]
// Errors fail the run. Warnings (blank placeholders, short tile layers, orphans, naming) fail only with --strict.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const TILE_SIZE = Number(/TILE_SIZE\s*=\s*(\d+)/.exec(readFileSync(join(src, "world/size.ts"), "utf8"))?.[1] ?? 16);
// Masks are "0"/"1" rows. These are the only files that also use a palette key (buildAvatar.ts maps H to the highlight).
const extraChars = { "avatar/masks/eyes.mask.ts": "H" };
const MAX_ICON_SIZE = 20; // test/icons.test.mjs keeps every icon between 8 and 20 pixels

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const areas = args.filter((a) => !a.startsWith("--"));
const unknown = areas.filter((a) => !["avatar", "world", "icons"].includes(a));
if (unknown.length) {
  console.error(`Unknown area: ${unknown.join(", ")}. Use avatar, world or icons.`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const rel = (file) => relative(root, file);
const cap = (s) => s[0].toUpperCase() + s.slice(1);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const all = walk(src);
const maskFiles = all.filter((f) => f.endsWith(".mask.ts")).sort();
const areaOf = (file) => relative(src, file).split("/")[0];
const picked = maskFiles.filter((f) => !areas.length || areas.includes(areaOf(f)));
const otherSource = all.filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".mask.ts")).map((f) => readFileSync(f, "utf8")).join("\n");

/** Expected export name for single-mask files, or null where the area has no single rule. */
function expectedName(file) {
  const parts = relative(src, file).replace(/\.mask\.ts$/, "").split("/");
  const name = parts.pop();
  const area = parts[0];
  if (area === "avatar") return `${name}Mask`;
  if (area === "world") {
    const parent = parts.pop();
    return `${parent && !["tiles", "objects"].includes(parent) ? parent + cap(name) : name}Mask`;
  }
  return null; // icons: names follow their icon, e.g. cottageChimney
}

function limits(file) {
  const path = relative(src, file);
  if (path.startsWith("world/masks/tiles/")) {
    const strip = path.startsWith("world/masks/tiles/edges/");
    return { width: TILE_SIZE, maxRows: TILE_SIZE, layer: !strip };
  }
  if (path.startsWith("icons/")) return { maxWidth: MAX_ICON_SIZE, maxRows: MAX_ICON_SIZE };
  return {};
}

const names = new Map();
let maskCount = 0;

for (const file of picked) {
  const label = rel(file);
  const source = readFileSync(file, "utf8").replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "").replace(/^import[^\n]*\n/gm, "");
  const exportNames = [...source.matchAll(/export\s+const\s+(\w+)/g)].map((m) => m[1]);
  if (exportNames.length === 0) {
    errors.push(`${label}: no \`export const\``);
    continue;
  }
  for (const name of exportNames) {
    if (names.has(name)) errors.push(`${label}: export ${name} is also defined in ${names.get(name)}`);
    names.set(name, label);
  }

  // Every quoted-string array is a mask. A file may hold several (headMasks has one per orientation).
  const arrays = [...source.matchAll(/\[((?:\s*"[^"]*"\s*,?)+)\s*\]/g)].map((m) => [...m[1].matchAll(/"([^"]*)"/g)].map((r) => r[1]));
  if (arrays.length === 0) errors.push(`${label}: no mask found (expected an array of "0"/"1" strings)`);
  const strayRows = source.match(/"[^"]*"/g)?.length ?? 0;
  if (strayRows !== arrays.reduce((n, a) => n + a.length, 0)) errors.push(`${label}: has quoted strings outside a mask array`);

  const single = exportNames.length === 1 && arrays.length === 1;
  const expected = expectedName(file);
  if (single && expected && exportNames[0] !== expected) warnings.push(`${label}: export is ${exportNames[0]}, expected ${expected}`);

  const lim = limits(file);
  const allowed = new RegExp(`[^01${extraChars[relative(src, file)] ?? ""}]`);
  arrays.forEach((rows, index) => {
    maskCount += 1;
    const at = arrays.length > 1 ? `${label} (mask ${index + 1})` : label;
    const width = rows[0].length;
    rows.forEach((row, y) => {
      const bad = row.match(allowed);
      if (bad) errors.push(`${at}: row ${y + 1} has "${bad[0]}", only "0" and "1" are allowed`);
      if (row.length !== width) errors.push(`${at}: row ${y + 1} is ${row.length} wide but row 1 is ${width}`);
      if (lim.width && row.length !== lim.width) errors.push(`${at}: row ${y + 1} is ${row.length} wide, must be ${lim.width}`);
    });
    if (width === 0) errors.push(`${at}: empty rows`);
    if (lim.maxRows && rows.length > lim.maxRows) errors.push(`${at}: ${rows.length} rows, at most ${lim.maxRows} allowed`);
    if (lim.maxWidth && width > lim.maxWidth) errors.push(`${at}: ${width} wide, icons are at most ${lim.maxWidth}`);
    if (lim.layer && rows.length < TILE_SIZE) {
      warnings.push(`${at}: layer has ${rows.length} rows, so the bottom ${TILE_SIZE - rows.length} stay unpainted (a layer is normally ${TILE_SIZE})`);
    }
    if (!rows.some((row) => row.includes("1"))) warnings.push(`${at}: blank, nothing is filled (a placeholder?)`);
  });

  for (const name of exportNames) {
    if (!new RegExp(`\\b${name}\\b`).test(otherSource)) warnings.push(`${label}: ${name} is not used anywhere in src (orphan)`);
  }
}

console.log(`Checked ${picked.length} mask files, ${maskCount} masks${areas.length ? ` (${areas.join(", ")})` : ""}.`);
for (const w of warnings) console.log(`  warning  ${w}`);
for (const e of errors) console.log(`  error    ${e}`);
console.log(`${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`);
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
