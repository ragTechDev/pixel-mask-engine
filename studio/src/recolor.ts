import type { Raster } from "../../src";

/** Original colour (lowercase #rrggbb) to the colour to show instead, for the studio's saved images. */
export type ColorMap = Record<string, string>;

export const norm = (color: string) => color.toLowerCase();

const parse = (hex: string): [number, number, number] => {
    let h = hex.slice(1);
    if (h.length === 3) h = h.replace(/./g, "$&$&");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: readonly number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;

export const luma = (hex: string) => {
    const [r, g, b] = parse(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** A copy of the raster with its colours replaced; colours that end up the same are merged. */
export function recolor(source: Raster, map: ColorMap): Raster {
    if (Object.keys(map).length === 0) return source;
    const colors: string[] = [""];
    const indexOf = new Map<string, number>();
    const remap = source.colors.map((color, i) => {
        if (i === 0) return 0;
        const next = map[norm(color)] ?? color;
        let ci = indexOf.get(norm(next));
        if (ci === undefined) {
            ci = colors.length;
            colors.push(next);
            indexOf.set(norm(next), ci);
        }
        return ci;
    });
    return { ...source, colors, px: source.px.map((ci) => remap[ci]) };
}

/** Distinct colours of a raster, darkest first. */
export const colorsOf = (raster: Raster) => [...new Set(raster.colors.slice(1).map(norm))].sort((a, b) => luma(a) - luma(b));

/** A four-tone ramp from one picked colour, made the same way as the library's own ramps. */
export function rampFromBase(base: string) {
    const c = parse(base);
    const scale = (k: number) => toHex(c.map((v) => v * k));
    return { base: norm(base), shadow: scale(0.72), highlight: toHex(c.map((v) => v + (255 - v) * 0.3)), outline: scale(0.4) };
}

/**
 * Keeps only the pixels drawn in the given colours (within the rows `from` up to `to`, if given)
 * and crops to them. Returns null when none of those colours are there.
 */
export function isolate(source: Raster, keep: readonly string[], rows?: [number, number]): Raster | null {
    const wanted = new Set(keep.map(norm));
    const fromRow = rows?.[0] ?? 0;
    const toRow = rows?.[1] ?? source.height;
    const inKeep = source.colors.map((c, i) => i > 0 && wanted.has(norm(c)));
    let minX = source.width, minY = source.height, maxX = -1, maxY = -1;
    for (let i = 0; i < source.px.length; i += 1) {
        const y = Math.floor(i / source.width);
        if (y < fromRow || y >= toRow || !inKeep[source.px[i]]) continue;
        const x = i % source.width;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    if (maxX < 0) return null;
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const px = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const ci = source.px[(minY + y) * source.width + minX + x];
            if (inKeep[ci] && minY + y >= fromRow && minY + y < toRow) px[y * width + x] = ci;
        }
    }
    return { width, height, colors: source.colors, px };
}

/** The first and last rows (as `[from, to)`) that have a pixel in one of the given colours. */
export function colorRows(source: Raster, keep: readonly string[]): [number, number] | null {
    const wanted = new Set(keep.map(norm));
    const inKeep = source.colors.map((c, i) => i > 0 && wanted.has(norm(c)));
    let first = -1;
    let last = -1;
    for (let i = 0; i < source.px.length; i += 1) {
        if (!inKeep[source.px[i]]) continue;
        const y = Math.floor(i / source.width);
        if (first < 0) first = y;
        last = y;
    }
    return first < 0 ? null : [first, last + 1];
}
