import type { Raster } from "./compose";
import { TILE_SIZE } from "../world/size";

export const variantSizes = [8, 16] as const;
export const colorDepths = [1, 2] as const;

/**
 * Fixed four-colour palettes that can be swapped in for an image's own colours, darkest first.
 * Like every palette in the library this is a fixed table: only these names can be chosen.
 */
export const palettePresets = {
    "game-boy": ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
    sepia: ["#2b1d0e", "#6b4a2b", "#b08a5a", "#e8d3a8"],
    pastel: ["#5a4a6a", "#a0a0d8", "#f4a8c4", "#fff0b0"],
    night: ["#0b1020", "#1f2a4a", "#4a5d8f", "#aab8e0"],
    "autumn-glow": ["#3b1f14", "#8a3f1c", "#d27a2a", "#f2c46b"],
    mint: ["#16342e", "#2f7a68", "#7cc4a8", "#e4f5e8"]
} as const satisfies Record<string, readonly string[]>;

export type PalettePreset = keyof typeof palettePresets;
export const paletteNames = Object.keys(palettePresets) as PalettePreset[];

export type VariantSize = (typeof variantSizes)[number];
export type ColorDepth = (typeof colorDepths)[number];

export interface VariantOptions {
    /** Fit the image inside a square of this many pixels, centred on a transparent background. */
    size?: VariantSize;
    /** Reduce colours: 1 is black and white, 2 is four greys. Leave out for the original colours. */
    bits?: ColorDepth;
    /** Swap in a fixed palette by brightness (see `palettePresets`): each colour takes the palette tone for its own brightness, so a faded image stays faded. Applied after `bits`. */
    palette?: PalettePreset;
}

type Rgb = readonly [number, number, number];

function parseHex(color: string): Rgb {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const luma = ([r, g, b]: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Snaps a channel to `levels` evenly spaced values and expands it back to 0-255. */
const snap = (value: number, levels: number) => Math.round((Math.round((value / 255) * (levels - 1)) * 255) / (levels - 1));

const quantizers: Record<ColorDepth, (rgb: Rgb) => Rgb> = {
    1: (rgb) => {
        const v = luma(rgb) >= 0.5 ? 255 : 0;
        return [v, v, v];
    },
    2: (rgb) => {
        const v = snap(luma(rgb) * 255, 4);
        return [v, v, v];
    }
};

const isPalette = (value: unknown): value is PalettePreset => typeof value === "string" && Object.prototype.hasOwnProperty.call(palettePresets, value);

/** The brightness range (0 to 255) that is spread over a palette: the library's darkest outlines sit at the bottom and white at the top. */
const PALETTE_DARK = 50;
const PALETTE_LIGHT = 250;

/** Each colour takes the palette tone for its own brightness, so faded images stay faded instead of being stretched to the full range. */
function applyPalette(raster: Raster, preset: PalettePreset): Raster {
    const target = palettePresets[preset].map((c) => ({ c, l: luma(parseHex(c)) })).sort((a, b) => a.l - b.l);
    const colors: string[] = [""];
    const indexOf = new Map<string, number>();
    const remap = raster.colors.map((color, i) => {
        if (i === 0) return 0;
        const t = (luma(parseHex(color)) * 255 - PALETTE_DARK) / (PALETTE_LIGHT - PALETTE_DARK);
        const tone = target[Math.min(target.length - 1, Math.max(0, Math.round(t * (target.length - 1))))].c;
        let ci = indexOf.get(tone);
        if (ci === undefined) {
            ci = colors.length;
            colors.push(tone);
            indexOf.set(tone, ci);
        }
        return ci;
    });
    return { ...raster, colors, px: raster.px.map((ci) => remap[ci]) };
}

function isOption<T extends number>(allowed: readonly T[], value: unknown): value is T {
    return typeof value === "number" && (allowed as readonly number[]).includes(value);
}

/** Draws `raster` into a canvas at the given content size, centred, keeping the most common colour per block. */
function sample(raster: Raster, canvasW: number, canvasH: number, contentW: number, contentH: number): Raster {
    const { width, height, px } = raster;
    const out = new Uint8Array(canvasW * canvasH);
    const left = Math.floor((canvasW - contentW) / 2);
    const top = Math.floor((canvasH - contentH) / 2);

    for (let dy = 0; dy < contentH; dy += 1) {
        const y0 = Math.floor((dy * height) / contentH);
        const y1 = Math.max(y0 + 1, Math.ceil(((dy + 1) * height) / contentH));
        for (let dx = 0; dx < contentW; dx += 1) {
            const x0 = Math.floor((dx * width) / contentW);
            const x1 = Math.max(x0 + 1, Math.ceil(((dx + 1) * width) / contentW));

            // The most common colour wins, so shrinking never invents a blended colour;
            // a block that is mostly empty stays empty.
            const counts = new Map<number, number>();
            let opaque = 0;
            let best = 0;
            let bestCount = 0;
            for (let y = y0; y < y1; y += 1) {
                for (let x = x0; x < x1; x += 1) {
                    const ci = px[y * width + x];
                    if (!ci) continue;
                    opaque += 1;
                    const n = (counts.get(ci) ?? 0) + 1;
                    counts.set(ci, n);
                    if (n > bestCount) {
                        best = ci;
                        bestCount = n;
                    }
                }
            }
            if (opaque * 2 >= (y1 - y0) * (x1 - x0)) out[(top + dy) * canvasW + left + dx] = best;
        }
    }
    return { width: canvasW, height: canvasH, colors: raster.colors, px: out };
}

function resize(raster: Raster, size: number): Raster {
    const { width, height } = raster;
    if (width === 0 || height === 0) return { ...raster, width: size, height: size, px: new Uint8Array(size * size) };
    const scale = Math.min(size / width, size / height);
    const up = Math.max(1, Math.floor(scale));
    const contentW = scale >= 1 ? width * up : Math.max(1, Math.round(width * scale));
    const contentH = scale >= 1 ? height * up : Math.max(1, Math.round(height * scale));
    return sample(raster, size, size, contentW, contentH);
}

function reduceColors(raster: Raster, bits: ColorDepth): Raster {
    const quantize = quantizers[bits];
    const colors: string[] = [""];
    const indexOf = new Map<string, number>();
    const remap = raster.colors.map((color, i) => {
        if (i === 0) return 0;
        const reduced = toHex(quantize(parseHex(color)));
        let ci = indexOf.get(reduced);
        if (ci === undefined) {
            ci = colors.length;
            colors.push(reduced);
            indexOf.set(reduced, ci);
        }
        return ci;
    });
    return { ...raster, colors, px: raster.px.map((ci) => remap[ci]) };
}

const variants = new WeakMap<Raster, Map<string, Raster>>();

/**
 * Returns a smaller and/or lower colour depth copy of a raster, memoised per raster.
 * Values outside `variantSizes`, `colorDepths` and `paletteNames` are ignored, so the raster comes back unchanged.
 * Transparency is kept at every depth.
 */
export function toVariant(raster: Raster, options: VariantOptions = {}): Raster {
    const size = isOption(variantSizes, options.size) ? options.size : undefined;
    const bits = isOption(colorDepths, options.bits) ? options.bits : undefined;
    const palette = isPalette(options.palette) ? options.palette : undefined;
    if (size === undefined && bits === undefined && palette === undefined) return raster;

    const key = `${size ?? ""}:${bits ?? ""}:${palette ?? ""}`;
    let byKey = variants.get(raster);
    if (!byKey) {
        byKey = new Map();
        variants.set(raster, byKey);
    }
    let result = byKey.get(key);
    if (!result) {
        result = size === undefined ? raster : resize(raster, size);
        if (bits !== undefined) result = reduceColors(result, bits);
        if (palette !== undefined) result = applyPalette(result, palette);
        byKey.set(key, result);
    }
    return result;
}

const mapVariants = new WeakMap<Raster, Map<string, Raster>>();

/**
 * Like `toVariant`, for a whole map: `size` is the pixels per tile (8 or 16), not the size of the
 * whole picture, so the map keeps its tiles and proportions. 16 is the original. `bits` works as in `toVariant`.
 */
export function toMapVariant(raster: Raster, options: VariantOptions = {}): Raster {
    const size = isOption(variantSizes, options.size) ? options.size : undefined;
    const bits = isOption(colorDepths, options.bits) ? options.bits : undefined;
    const palette = isPalette(options.palette) ? options.palette : undefined;
    if (size === undefined && bits === undefined && palette === undefined) return raster;

    const key = `${size ?? ""}:${bits ?? ""}:${palette ?? ""}`;
    let byKey = mapVariants.get(raster);
    if (!byKey) {
        byKey = new Map();
        mapVariants.set(raster, byKey);
    }
    let result = byKey.get(key);
    if (!result) {
        result = raster;
        if (size !== undefined && size < TILE_SIZE) {
            const factor = size / TILE_SIZE;
            result = sample(raster, Math.max(1, Math.round(raster.width * factor)), Math.max(1, Math.round(raster.height * factor)), Math.max(1, Math.round(raster.width * factor)), Math.max(1, Math.round(raster.height * factor)));
        }
        if (bits !== undefined) result = reduceColors(result, bits);
        if (palette !== undefined) result = applyPalette(result, palette);
        byKey.set(key, result);
    }
    return result;
}
