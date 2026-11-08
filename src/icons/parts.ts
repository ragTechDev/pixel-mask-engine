import type { PixelMask } from "../core/maskUtils";
import type { Ramp } from "../core/sprite";
import { iconInk, iconRamps } from "./ramps";

export type Part =
    | { readonly shaded: PixelMask; readonly ramp: Ramp; readonly x: number; readonly y: number }
    | { readonly flat: PixelMask; readonly color: string; readonly x: number; readonly y: number };

export const dot: PixelMask = ["1"];

type Tone = "light" | "dark";
type NavPart =
    | { readonly mask: PixelMask; readonly ramp: Ramp; readonly tone: Tone; readonly x: number; readonly y: number }
    | { readonly flat: PixelMask; readonly color: string; readonly x: number; readonly y: number };

/** Turns drawn parts into an active (coloured) or idle (faded, two-tone) icon. */
export function navIcon(parts: readonly NavPart[], active: boolean): readonly Part[] {
    return parts.map((part): Part => {
        if ("mask" in part) {
            const ramp = active ? part.ramp : part.tone === "light" ? iconRamps.cream_idle : iconRamps.dove_wing_idle;
            return { shaded: part.mask, ramp, x: part.x, y: part.y };
        }
        return { flat: part.flat, color: active ? part.color : iconInk.legs_idle, x: part.x, y: part.y };
    });
}

/** Parts are drawn in order, later parts on top. Positions are in icon pixels. */
export type IconParts = Readonly<Record<string, readonly Part[]>>;
