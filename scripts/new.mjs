// Scaffolding wizard: pnpm new [--dry-run]
// Run it in a terminal, or pipe the answers in one per line (empty line = take the default).
// Creates the mask files for a new icon, avatar garment or hair style, world object or tile, then prints
// the edits you still have to make by hand, with the import lines and table entries filled in.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const rl = createInterface({ input: process.stdin, output: process.stdout });

// Lines are queued as they arrive, so answers piped in all at once are not lost between prompts.
const queued = [];
const waiting = [];
let closed = false;
rl.on("line", (line) => (waiting.length ? waiting.shift()(line) : queued.push(line)));
rl.on("close", () => {
  closed = true;
  waiting.splice(0).forEach((resolve) => resolve(null));
});
const readLine = (prompt) => {
  rl.setPrompt(prompt);
  rl.prompt();
  return new Promise((resolve) => (queued.length ? resolve(queued.shift()) : closed ? resolve(null) : waiting.push(resolve)));
};

// ─── Naming ─────────────────────────────────────────────────────────────────

const words = (s) => s.split(/[^a-zA-Z0-9]+/).filter(Boolean);
const camel = (s) => words(s).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w[0].toLowerCase() + w.slice(1))).join("");
const pascal = (s) => camel(s)[0].toUpperCase() + camel(s).slice(1);
const kebab = (s) => words(s).map((w) => w.toLowerCase()).join("-");

const isSnake = (s) => /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(s) || "use snake_case, e.g. paper_boat";
const isCamel = (s) => /^[a-z][a-zA-Z0-9]*$/.test(s) || "use camelCase, e.g. paperBoat";
const isNames = (s) => s.split(",").every((n) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(n.trim())) || "use comma-separated names, e.g. torso, sleeves";
const isSize = (s) => /^\d+x\d+$/.test(s) || "use WIDTHxHEIGHT, e.g. 9x5";

// ─── Prompts ────────────────────────────────────────────────────────────────

async function ask(question, { def, check = () => true } = {}) {
  for (;;) {
    const line = await readLine(`${question}${def !== undefined ? ` (${def})` : ""}: `);
    if (line === null) {
      console.error("\nInput ended before the wizard finished; nothing more was written.");
      process.exit(1);
    }
    const answer = line.trim() || def;
    const verdict = answer === undefined ? "required" : check(answer);
    if (verdict === true) return answer;
    console.log(`  ${verdict}`);
  }
}

async function select(question, options) {
  console.log(`\n${question}`);
  options.forEach((o, i) => console.log(`  ${i + 1}) ${o.label}${o.hint ? `  - ${o.hint}` : ""}`));
  const n = await ask("Choose a number", { def: "1", check: (s) => (Number(s) >= 1 && Number(s) <= options.length) || `1-${options.length}` });
  return options[Number(n) - 1].value;
}

const confirm = async (question, def = "y") => /^y/i.test(await ask(`${question} (y/n)`, { def }));

// ─── Files ──────────────────────────────────────────────────────────────────

const created = [];
const skipped = [];

function write(rel, content) {
  const file = join(root, rel);
  if (existsSync(file)) return skipped.push(rel);
  if (!dryRun) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  created.push(rel);
}

const rect = (w, h, fill) => Array.from({ length: h }, () => fill.repeat(w));

function maskFile(name, [w, h], { fill = "1", header, typed = false, depth = 0 }) {
  const rows = rect(w, h, fill);
  const body = rows.length === 1 ? `["${rows[0]}"]` : `[\n${rows.map((r) => `    "${r}"`).join(",\n")}\n]`;
  const importLine = typed ? `import type { PixelMask } from "${"../".repeat(depth)}core/maskUtils";\n\n` : "";
  return `${importLine}${header ? `// ${header}\n` : ""}export const ${name}${typed ? ": PixelMask" : ""} = ${body};\n`;
}

/**
 * Writes one mask per part. A single part is a file named after the thing; several parts go in a
 * directory with one file per part, or side by side when `flat` (avatar masks). Returns each part's export name and import path.
 */
function scaffoldMasks({ baseDir, thing, parts, size, nameOf, fileOf, flat = false, ...opts }) {
  const single = parts.length === 1;
  return parts.map((part) => {
    const exportName = nameOf(single ? "" : part);
    const stem = single ? fileOf(thing) : fileOf(part);
    const rel = single || flat ? `${baseDir}/${stem}.mask.ts` : `${baseDir}/${fileOf(thing)}/${stem}.mask.ts`;
    const depth = rel.split("/").length - 1;
    write(`src/${rel}`, maskFile(exportName, size, { ...opts, depth }));
    return { part, exportName, rel, importPath: rel.replace(/\.ts$/, "") };
  });
}

const importLines = (masks, from) =>
  masks.map((m) => `import { ${m.exportName} } from "${from(m)}";`).join("\n");

function next(title, steps) {
  console.log(`\n${dryRun ? "[dry run] would create" : "Created"}:`);
  created.forEach((f) => console.log(`  + ${f}`));
  skipped.forEach((f) => console.log(`  ! ${f} already exists, left alone`));
  console.log(`\n${title}\n`);
  steps.forEach((step, i) => {
    console.log(`${i + 1}. ${step.file}`);
    console.log(`   ${step.what}`);
    if (step.code) console.log(step.code.split("\n").map((l) => `     ${l}`).join("\n"));
    console.log("");
  });
  console.log("Then run `pnpm typecheck && pnpm check:masks && pnpm stats && pnpm test`. `pnpm stats` updates the counts and sizes in the README.");
}

// ─── Icon ───────────────────────────────────────────────────────────────────

async function icon() {
  const categories = readdirSync(join(root, "src/icons"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const picked = await select("Which category? (named after lucide.dev/icons categories)", [
    ...categories.map((c) => ({ label: c, value: c })),
    { label: "a new category", value: null }
  ]);
  const category = picked ?? kebab(await ask("New category name (a lucide category, e.g. weather)", { check: (s) => /^[a-z][a-z0-9 -]*$/.test(s) || "use lowercase words" }));
  const id = await ask("Icon id", { check: isSnake });
  const parts = (await ask("Mask parts, comma-separated (one name = one single mask)", { def: camel(id), check: isNames })).split(",").map((s) => s.trim());
  const size = (await ask("Placeholder size per mask", { def: "10x10", check: isSize })).split("x").map(Number);
  const idle = await confirm("Also add a faded idle variant (used as `idle`)?", "n");

  const masks = scaffoldMasks({
    baseDir: `icons/${category}`,
    thing: id,
    parts,
    size,
    typed: true,
    nameOf: (part) => `${camel(id)}${part ? pascal(part) : ""}Mask`,
    fileOf: (s) => (s === id ? kebab(id) : camel(s))
  });
  const records = `${camel(category)}Icons`;
  if (picked === null) {
    write(
      `src/icons/${category}/icons.ts`,
      `import type { IconParts } from "../parts";\n\nexport const ${records} = {\n} as const satisfies IconParts;\n`
    );
  }

  const partLines = masks.map((m) => `    { shaded: ${m.exportName}, ramp: iconRamps.cream, x: 0, y: 0 }`).join(",\n");
  const steps = [
    {
      file: "the new mask files",
      what: `Draw each mask: "1" is filled, "0" is empty. Outline, highlight and shadow are added for you.`
    },
    {
      file: `src/icons/${category}/icons.ts`,
      what: `Import the masks and add the icon. Colours come from iconRamps / iconInk only. Set each part's ramp, x and y.`,
      code:
        `${importLines(masks, (m) => "./" + m.importPath.slice(`icons/${category}/`.length))}\n\n` +
        (idle
          ? `// Use navIcon (import it from "../parts") so the idle copy is generated for you:\nconst ${camel(id)} = [\n${masks.map((m) => `  { mask: ${m.exportName}, ramp: iconRamps.cream, tone: "light", x: 0, y: 0 }`).join(",\n")}\n] as const;\n\n${id}: navIcon(${camel(id)}, true),\n${id}_idle: navIcon(${camel(id)}, false),`
          : `${id}: [\n${partLines}\n],`)
    }
  ];
  if (picked === null) {
    steps.push({
      file: "src/icons/categories.ts",
      what: "Register the new category.",
      code: `import { ${records} } from "./${category}/icons";\n\n"${category}": ${records},   // inside iconTables`
    });
  }
  steps.push(
    { file: "test/icons.test.mjs", what: `Add ${idle ? `"${id}" and "${id}_idle"` : `"${id}"`} to the expected id list.` },
    { file: "README.md", what: "Add the icon to the category table in the Icon list section." }
  );
  next(`Next: edit these files to add the "${id}" icon.`, steps);
}

// ─── Avatar garment ─────────────────────────────────────────────────────────

const garmentSlots = {
  top: { dir: "top", type: "TopStyle", table: "topStyles", offset: [2, 6], placement: "overBody" },
  bottom: { dir: "bottom", type: "BottomStyle", table: "bottomStyles", offset: [2, 12], placement: "overBody" },
  shoes: { dir: "shoes", type: "ShoeStyle", table: "shoeStyles", offset: [2, 16], placement: "overlay" }
};

async function garment() {
  const slot = await select("Which garment slot?", Object.keys(garmentSlots).map((s) => ({ label: s, value: s })));
  const cfg = garmentSlots[slot];
  const style = await ask("Style id", { check: isCamel });
  const parts = (await ask("Layers, comma-separated (one name = one single layer)", { def: style, check: isNames })).split(",").map((s) => s.trim());
  const size = (await ask("Placeholder size per layer", { def: "9x5", check: isSize })).split("x").map(Number);

  const masks = scaffoldMasks({
    baseDir: `avatar/masks/clothes/${cfg.dir}`,
    thing: style,
    parts,
    size,
    flat: true,
    nameOf: (part) => `${style}${part ? pascal(part) : ""}Mask`,
    fileOf: (s) => (s === style ? style : `${style}${pascal(s)}`)
  });
  // Several layers live side by side as <style><Part>.mask.ts, like shirtTorso and shirtSleeves.
  const layers = masks
    .map((m) => `{ mask: ${m.exportName}, offsetX: ${cfg.offset[0]}, offsetY: ${cfg.offset[1]}, placement: "${cfg.placement}" }`)
    .join(",\n    ");
  next(`Next: edit these files to add the "${style}" ${slot} style.`, [
    { file: "the new mask files", what: "Draw each layer. Offsets below are guesses: adjust them until it sits right on the body." },
    {
      file: "src/avatar/styles/clothesStyles.ts",
      what: `Import the masks, add "${style}" to ${cfg.type}, and add a ${cfg.table} entry.`,
      code:
        `${importLines(masks, (m) => "../" + m.importPath.replace(/^avatar\//, ""))}\n\n` +
        `export type ${cfg.type} = ... | "${style}";\n\n` +
        `${style}: {\n  slot: "${slot}",\n  byOrientation: {},\n  fallback: [\n    ${layers}\n  ]\n},   // inside ${cfg.table}`
    }
  ]);
}

// ─── Avatar hair ────────────────────────────────────────────────────────────

async function hair() {
  const side = await select("Front hair or back hair?", [
    { label: "front", value: "front", hint: "drawn over the head" },
    { label: "back", value: "back", hint: "drawn behind the head" }
  ]);
  const style = await ask("Style id", { check: isCamel });
  const size = (await ask("Placeholder size", { def: "11x8", check: isSize })).split("x").map(Number);
  const suffix = pascal(side);
  const masks = scaffoldMasks({
    baseDir: "avatar/masks/hair",
    thing: style,
    parts: [style],
    size,
    nameOf: () => `${style}${suffix}Mask`,
    fileOf: () => `${style}${suffix}`
  });
  const m = masks[0];
  const placement = side === "front" ? "front" : "behindHead";
  const typeName = side === "front" ? "FrontHairStyle" : "BackHairStyle";
  const table = side === "front" ? "frontHairStyles" : "backHairStyles";
  const constName = `${side.toUpperCase()}_${words(style).join("_").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;
  next(`Next: edit these files to add the "${style}" ${side} hair style.`, [
    { file: "the new mask file", what: "Draw the hair. It is positioned relative to the head's top-left corner, so offsetY is usually negative." },
    {
      file: "src/avatar/styles/hairStyles.ts",
      what: `Import the mask, add "${style}" to ${typeName}, add a layer constant, and register it in ${table}. If it needs a different shape per head orientation, give it a byOrientation entry like BACK_LOW_PONYTAIL.`,
      code:
        `${importLines(masks, () => "../" + m.importPath.replace(/^avatar\//, ""))}\n\n` +
        `export type ${typeName} = ... | "${style}";\n\n` +
        `const ${constName} = [{ mask: ${m.exportName}, offsetX: 1, offsetY: -5, placement: "${placement}" }] as const;\n\n` +
        `${style}: { byOrientation: {} as Partial<Record<HeadOrientation, readonly HairLayer[]>>, fallback: ${constName} },   // inside ${table}`
    }
  ]);
}

// ─── World object ───────────────────────────────────────────────────────────

async function object() {
  const id = await ask("Object id", { check: isCamel });
  const width = Number(await ask("Footprint width in tiles", { def: "1", check: (s) => /^[1-9]$/.test(s) || "1-9" }));
  const height = Number(await ask("Footprint height in tiles", { def: "1", check: (s) => /^[1-9]$/.test(s) || "1-9" }));
  const layer = await select("Layer?", [
    { label: "standing", value: "standing", hint: "trees, doors, counters" },
    { label: "ground", value: "ground", hint: "rugs, flowers; drawn first" }
  ]);
  const parts = (await ask("Parts, comma-separated (one name = one single mask)", { def: camel(id), check: isNames })).split(",").map((s) => s.trim());
  const size = (await ask("Placeholder size per part", { def: "8x8", check: isSize })).split("x").map(Number);

  const masks = scaffoldMasks({
    baseDir: "world/masks/objects",
    thing: id,
    parts,
    size,
    nameOf: (part) => `${id}${part ? pascal(part) : ""}Mask`,
    fileOf: (s) => (s === id ? id : camel(s))
  });
  const footprint = Array.from({ length: height }, () => (layer === "standing" ? "#" : ".").repeat(width));
  const partLines = masks.map((m, i) => `{ mask: ${m.exportName}, ramp: "wood", x: ${2 + i}, y: ${2 + i} }`).join(",\n  ");
  next(`Next: edit these files to add the "${id}" object.`, [
    { file: "the new mask files", what: "Draw each part. x and y below are the pixel position inside the object's tile box (16 px per tile)." },
    { file: "src/world/types.ts", what: `Add "${id}" to the ObjectId union.` },
    {
      file: "src/world/objects/objects.ts",
      what: "Add an objectInfo entry. In the footprint, # blocks movement and . is open. Add door: true or counter: true if it applies.",
      code: `${id}: { width: ${width}, height: ${height}, layer: "${layer}", footprint: [${footprint.map((r) => `"${r}"`).join(", ")}] },`
    },
    {
      file: "src/world/objects/objectParts.ts",
      what: "Import the masks and add the parts, drawn in order with later parts on top. Ramps come from src/world/objects/ramps.ts; add one there if none fits.",
      code: `${importLines(masks, (m) => "../" + m.importPath.replace(/^world\//, ""))}\n\n${id}: [\n  ${partLines}\n],`
    },
    { file: "test/world.test.mjs", what: `Add "${id}" to the expected object id list.` }
  ]);
}

// ─── World tile ─────────────────────────────────────────────────────────────

async function tile() {
  console.log("\nThis scaffolds a material tile: a base colour plus 0/1 detail layers.");
  console.log("Edge and nine-patch tiles build on edge families in src/world/tiles/tileDefs.ts and are edited by hand.");
  const id = await ask("Tile id", { check: isSnake });
  const layers = (await ask("Detail layers, bottom to top", { def: "shade, light", check: isNames })).split(",").map((s) => s.trim());
  const dir = camel(id);
  const masks = layers.map((layer) => {
    const exportName = `${dir}${pascal(layer)}Mask`;
    const rel = `world/masks/tiles/${dir}/${camel(layer)}.mask.ts`;
    write(
      `src/${rel}`,
      `// "1" is painted, "0" is left to the layer below.\n// The colour role of each layer is set in src/world/tiles/tileDefs.ts.\nexport const ${exportName} = [\n${rect(16, 16, "0").map((r) => `    "${r}"`).join(",\n")}\n];\n`
    );
    return { part: layer, exportName, importPath: rel.replace(/\.ts$/, "") };
  });
  const colors = [camel(id), ...layers.map((l) => `${camel(id)}${pascal(l)}`)];
  next(`Next: edit these files to add the "${id}" tile.`, [
    { file: "the new mask files", what: 'Draw each 16x16 layer. Start from a "1" where that layer should paint over the base colour.' },
    { file: "src/world/types.ts", what: `Add "${id}" to the TownTileId union.` },
    {
      file: "src/world/tiles/palettes.ts",
      what: "Add the colour names to defaultColors. Tiles only ever name colours; the other seasons inherit summer unless you override them.",
      code: colors.map((c) => `${c}: "#RRGGBB",`).join("\n")
    },
    {
      file: "src/world/tiles/tileDefs.ts",
      what: "Import the masks and add the tile to tileDefs.",
      code:
        `${importLines(masks, (m) => "../" + m.importPath.replace(/^world\//, ""))}\n\n` +
        `${id}: material("${colors[0]}", ${masks.map((m, i) => `[${m.exportName}, "${colors[i + 1]}"]`).join(", ")}),`
    },
    {
      file: "src/world/tilesets/town.ts or house.ts",
      what: "Use the tile in a block so maps can place it. Add it to the solid/water/grass lists if it has behaviour."
    },
    {
      file: "test/fixtures/tile-golden.json",
      what: "Add the tile's pixel fingerprint. Run `pnpm test` once: the failure prints the actual value to paste in."
    }
  ]);
}

// ─── Main ───────────────────────────────────────────────────────────────────

const kinds = [
  { label: "Icon", value: icon, hint: "interface icon in a lucide-style category" },
  { label: "Avatar garment", value: garment, hint: "top (including a dress or overalls), bottom or shoes" },
  { label: "Avatar hair", value: hair, hint: "front or back hair style" },
  { label: "World object", value: object, hint: "tree, door, rug and so on" },
  { label: "World tile", value: tile, hint: "a terrain material" }
];

try {
  console.log(`pixel-mask-engine scaffolding wizard${dryRun ? " (dry run: no files will be written)" : ""}`);
  const run = await select("What do you want to add?", kinds);
  await run();
} finally {
  rl.close();
}
