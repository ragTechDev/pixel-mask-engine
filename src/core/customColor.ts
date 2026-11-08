import type { Ramp } from "./sprite";

/** A hex colour such as `#e8873a` or `#e83`. */
export type HexColor = `#${string}`;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Returns a hex colour as lowercase `#rrggbb`, or `undefined` for anything that is not a 3 or 6 digit hex colour. */
export function parseHex(value: unknown): HexColor | undefined {
    if (typeof value !== "string" || !HEX.test(value)) return undefined;
    const digits = value.slice(1).toLowerCase();
    return `#${digits.length === 3 ? [...digits].map((d) => d + d).join("") : digits}`;
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

/** Builds the four tones (outline, shadow, base, highlight) the same way for every custom colour. */
export function rampFromHex(hex: HexColor): Ramp {
    const c = channels(hex);
    const scale = (k: number) => toHex(c.map((v) => v * k));
    return { base: hex, shadow: scale(0.72), highlight: toHex(c.map((v) => v + (255 - v) * 0.3)), outline: scale(0.4) };
}
