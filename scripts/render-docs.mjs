// Renders the README images into docs/images: pnpm docs:images
// Everything is drawn by the library itself from the built package, so the pictures cannot drift from the art.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs/images");
const lib = await import(pathToFileURL(join(root, "dist/index.js")).href).catch(() => {
  console.error("dist/index.js is missing. Run `pnpm build` first (or use `pnpm docs:images`, which builds).");
  process.exit(2);
});
const { buildAvatar, buildIcon, buildMap, buildObject, buildTile, defineMap, townTileset, toSvg, iconIds, tileIds, objectIds } = lib;

// ─── Compositing and encoding ───────────────────────────────────────────────

/** A blank raster to paste others into. Colours are shared, so the SVG stays small. */
function canvas(width, height) {
  return { width, height, colors: [""], px: new Uint8Array(width * height), index: new Map() };
}

function paste(dst, src, x0, y0) {
  const map = src.colors.map((color, i) => {
    if (i === 0) return 0;
    if (!dst.index.has(color)) {
      dst.index.set(color, dst.colors.length);
      dst.colors.push(color);
    }
    return dst.index.get(color);
  });
  for (let y = 0; y < src.height; y += 1) {
    for (let x = 0; x < src.width; x += 1) {
      const c = src.px[y * src.width + x];
      const tx = x0 + x;
      const ty = y0 + y;
      if (c && tx >= 0 && ty >= 0 && tx < dst.width && ty < dst.height) dst.px[ty * dst.width + tx] = map[c];
    }
  }
}

/** Lays rasters out in rows, each cell as large as the biggest raster. Returns the sheet. */
function sheet(items, { columns, gap = 4, background }) {
  const cellW = Math.max(...items.map((r) => r.width));
  const cellH = Math.max(...items.map((r) => r.height));
  const rows = Math.ceil(items.length / columns);
  const sheetRaster = canvas(columns * cellW + (columns + 1) * gap, rows * cellH + (rows + 1) * gap);
  if (background) paste(sheetRaster, solid(sheetRaster.width, sheetRaster.height, background), 0, 0);
  items.forEach((r, i) => {
    const x = gap + (i % columns) * (cellW + gap) + Math.floor((cellW - r.width) / 2);
    const y = gap + Math.floor(i / columns) * (cellH + gap) + (cellH - r.height);
    paste(sheetRaster, r, x, y);
  });
  return sheetRaster;
}

const solid = (width, height, color) => ({ width, height, colors: ["", color], px: new Uint8Array(width * height).fill(1) });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(body));
  return Buffer.concat([head, body, tail]);
};

/** A PNG with nearest-neighbour upscaling, so it stays crisp. */
function toPng(raster, scale) {
  const w = raster.width * scale;
  const h = raster.height * scale;
  const rgba = raster.colors.map((c) => (c ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).concat(255) : [0, 0, 0, 0]));
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    const row = y * (w * 4 + 1);
    for (let x = 0; x < w; x += 1) {
      const px = rgba[raster.px[Math.floor(y / scale) * raster.width + Math.floor(x / scale)]];
      raw.set(px, row + 1 + x * 4);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(w, 0);
  header.writeUInt32BE(h, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const written = [];
function save(name, raster, scale, { png = false } = {}) {
  const file = join(out, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.svg`, toSvg(raster, scale) + "\n");
  written.push(`${name}.svg`);
  if (png) {
    writeFileSync(`${file}.png`, toPng(raster, scale));
    written.push(`${name}.png`);
  }
}

// ─── Banner: avatars in a world ─────────────────────────────────────────────

// One block is 2x2 tiles of 16 px. The rows are sky, roofs, walls, a path and grass with a pond.
const scene = defineMap(
  townTileset,
  [
    "kkkkkkkkkkkkkkkkkkkk",
    "kk<=>kkkkk<=>kkkk<=>",
    "gg[_]ggtgg[_]gggg[_]",
    "pppppppppppppppppppp",
    "ggttgggwwwwgggggttgg"
  ],
  [
    { id: "window", x: 5, y: 4 }, { id: "door", x: 7, y: 5 },
    { id: "window", x: 21, y: 4 }, { id: "door", x: 23, y: 5 },
    { id: "window", x: 35, y: 4 }, { id: "door", x: 37, y: 5 },
    { id: "tree", x: 0, y: 4 }, { id: "tree", x: 14, y: 4 }, { id: "tree", x: 29, y: 4 },
    { id: "fence", x: 10, y: 5 }, { id: "fence", x: 11, y: 5 }, { id: "fence", x: 12, y: 5 },
    { id: "flower", x: 8, y: 8 }, { id: "flower", x: 30, y: 9 }, { id: "flower", x: 36, y: 8 }
  ]
);

const pick = (table, i) => Object.keys(table)[i % Object.keys(table).length];
const person = (i, extra = {}) => ({
  skinTone: pick(lib.skinPalettes, i),
  hairColor: pick(lib.hairPalettes, i + 1 + Math.floor(i / 3)),
  eyeColor: pick(lib.eyePalettes, i),
  clothesColor: pick(lib.clothesPalettes, 2 * i + 1),
  frontHairStyle: pick(lib.frontHairStyles, i),
  backHairStyle: pick(lib.backHairStyles, i + 1),
  ...extra
});

const walkers = [
  { x: 40, config: person(0, { topStyle: "shirt", bottomStyle: "shorts", shoeStyle: "boots", headOrientation: "right", legPose: "step" }) },
  { x: 128, config: person(1, { topStyle: "dress", shoeStyle: "sandals", headOrientation: "front" }) },
  { x: 200, config: person(2, { topStyle: "longSleeve", bottomStyle: "skirt", shoeStyle: "shoes", headOrientation: "left", legPose: "step" }) },
  { x: 300, config: person(3, { topStyle: "overalls", shoeStyle: "boots", headOrientation: "front" }) },
  { x: 380, config: person(4, { topStyle: "spaghetti", bottomStyle: "shorts", shoeStyle: "sandals", headOrientation: "right", legPose: "step" }) },
  { x: 470, config: person(5, { topStyle: "shirt", bottomStyle: "skirt", shoeStyle: "shoes", headOrientation: "front" }) },
  { x: 560, config: person(6, { topStyle: "longSleeve", bottomStyle: "shorts", shoeStyle: "boots", headOrientation: "left", legPose: "step" }) }
];

const world = buildMap(scene);
const banner = canvas(world.width, world.height);
paste(banner, world, 0, 0);
// The path row is pixels 96-127, so feet land a few pixels above its bottom edge.
for (const { x, config } of walkers) {
  const avatar = buildAvatar(config);
  paste(banner, avatar, x, 122 - avatar.height);
}
save("banner", banner, 2, { png: true });

// ─── Avatars ────────────────────────────────────────────────────────────────

const avatarConfigs = walkers.map((w, i) => ({ ...w.config, headOrientation: "front", legPose: "neutral", armPose: ["down", "forward", "back"][i % 3] }));
save("avatars", sheet(avatarConfigs.map((c) => buildAvatar(c)), { columns: 7, gap: 6 }), 6, { png: true });

// ─── Tiles, objects, themes ─────────────────────────────────────────────────

save("tiles", sheet(tileIds.map((id) => buildTile(id)), { columns: 11, gap: 3 }), 3, { png: true });

const backdrop = { door: "wall", window: "wall", counter: "floor", bookshelf: "floor", rug: "floor" };
const objectCards = objectIds.map((id) => {
  const object = buildObject(id);
  const card = canvas(object.width, object.height);
  const tile = buildTile(backdrop[id] ?? "grass");
  for (let y = 0; y < object.height; y += 16) for (let x = 0; x < object.width; x += 16) paste(card, tile, x, y);
  paste(card, object, 0, 0);
  return card;
});
save("objects", sheet(objectCards, { columns: 8, gap: 6 }), 4, { png: true });

const mini = defineMap(
  townTileset,
  ["kk<=>kk", "gg[_]gg", "ppppppp", "ggwwggt"],
  [{ id: "window", x: 6, y: 2 }, { id: "door", x: 4, y: 3 }, { id: "tree", x: 0, y: 2 }, { id: "flower", x: 12, y: 6 }]
);
save("themes", sheet(["spring", "summer", "autumn", "winter"].map((theme) => buildMap(mini, theme)), { columns: 4, gap: 8 }), 3, { png: true });

// ─── Icons ──────────────────────────────────────────────────────────────────

save("icons", sheet(iconIds.map((id) => buildIcon(id)), { columns: 14, gap: 4 }), 4, { png: true });

// The three README "Use it" snippets, rendered with exactly the options and scales the snippets use.
save("example-icon", buildIcon("heart"), 4);
save("example-avatar", buildAvatar({ skinTone: "medium", hairColor: "black", topStyle: "shirt" }), 4);
const exampleMap = defineMap(townTileset, ["gggg", "gwwg", "pppp"], [{ id: "tree", x: 0, y: 0 }]);
save("example-world", buildMap(exampleMap, "autumn"), 2);

console.log(`Wrote ${written.length} images to docs/images.`);
