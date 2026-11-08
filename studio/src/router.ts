import { useSyncExternalStore } from "react";
import { colorDepths, paletteNames, variantSizes, type ColorDepth, type PalettePreset, type VariantOptions, type VariantSize } from "../../src";
import { colorRamps, defaultTileTheme, parseHex, tileColorGroups, tileThemes, type ColorName, type HexColor, type TileColorGroup, type TileColors, type TileTheme } from "../../src";

export interface Route {
    /** Path segments, e.g. ["icons", "heart"]. */
    path: string[];
    query: URLSearchParams;
}

function parse(hash: string): Route {
    const [rawPath, rawQuery = ""] = hash.replace(/^#\/?/, "").split("?");
    return { path: rawPath.split("/").filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(rawQuery) };
}

let current = typeof location === "undefined" ? "" : location.hash;
let route = parse(current);

function subscribe(onChange: () => void) {
    const listener = () => {
        current = location.hash;
        route = parse(current);
        onChange();
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
}

export function useRoute(): Route {
    return useSyncExternalStore(subscribe, () => route, () => route);
}

/** The view options that stay in the address, so a link shares what you were looking at. */
export const tileGroupNames = Object.keys(tileColorGroups) as TileColorGroup[];
const KEPT = ["size", "bits", "palette", "theme", "idle", "color", ...tileGroupNames.map((g) => `tile-${g}`)] as const;

export function href(path: string[], from: Route, extra: Record<string, string | undefined> = {}): string {
    const query = new URLSearchParams();
    for (const key of KEPT) {
        const value = key in extra ? extra[key] : from.query.get(key);
        if (value) query.set(key, value);
    }
    const q = query.toString();
    return `#/${path.map(encodeURIComponent).join("/")}${q ? `?${q}` : ""}`;
}

export function setQuery(from: Route, extra: Record<string, string | undefined>) {
    location.hash = href(from.path, from, extra);
}

export function variantOf(from: Route): VariantOptions {
    const size = Number(from.query.get("size"));
    const bits = Number(from.query.get("bits"));
    return {
        size: (variantSizes as readonly number[]).includes(size) ? (size as VariantSize) : undefined,
        bits: (colorDepths as readonly number[]).includes(bits) ? (bits as ColorDepth) : undefined,
        palette: (paletteNames as readonly string[]).includes(from.query.get("palette") ?? "") ? (from.query.get("palette") as PalettePreset) : undefined
    };
}

export function themeOf(from: Route): TileTheme {
    const theme = from.query.get("theme");
    return (tileThemes as readonly string[]).includes(theme ?? "") ? (theme as TileTheme) : defaultTileTheme;
}

export function idleOf(from: Route): boolean {
    return from.query.get("idle") === "1";
}

/** The colour picked for the selected item: one of the library's common colours or a hex colour. */
export function colorOf(from: Route): ColorName | HexColor | undefined {
    const color = from.query.get("color") ?? "";
    return Object.prototype.hasOwnProperty.call(colorRamps, color) ? (color as ColorName) : parseHex(color);
}

/** The custom tile colours picked for the grid or the world. */
export function tileColorsOf(from: Route): TileColors | undefined {
    const colors: TileColors = {};
    for (const group of tileGroupNames) {
        const hex = parseHex(from.query.get(`tile-${group}`));
        if (hex) colors[group] = hex;
    }
    return Object.keys(colors).length ? colors : undefined;
}
