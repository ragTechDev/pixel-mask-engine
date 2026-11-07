import type { Raster } from "../core/compose";
import { toSvg } from "../core/svg";
import { iconMasks } from "./masks";

export type IconId = "heart" | "heart_outline" | "repost" | "comment";

export const iconIds: IconId[] = ["heart", "heart_outline", "repost", "comment"];

/** The icon's pixels as rows of "0" and "1". The caller paints the "1" cells in its own text colour. */
export function iconMask(id: IconId): readonly string[] {
    const mask = iconMasks[id];
    if (!mask) throw new Error(`Unknown icon: ${String(id)}`);
    return mask;
}

/**
 * Standalone SVG markup, scaled by `scale` CSS pixels per icon pixel. Icons are one colour and
 * take it from the surrounding text colour (`fill="currentColor"`), so there is no colour option.
 */
export function iconSvg(id: IconId, scale = 1): string {
    const rows = iconMask(id);
    const width = rows[0]?.length ?? 0;
    const px = new Uint8Array(width * rows.length);
    rows.forEach((row, y) => {
        for (let x = 0; x < width; x += 1) px[y * width + x] = row[x] === "1" ? 1 : 0;
    });
    const raster: Raster = { width, height: rows.length, colors: ["", "currentColor"], px };
    return toSvg(raster, scale);
}
