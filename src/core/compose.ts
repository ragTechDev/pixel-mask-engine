import { SLOT, type Sprite } from "./sprite";

/**
 * A composed, colour-resolved image. `px` indexes into `colors`;
 * index 0 is transparent. Rasters are immutable and safe to cache.
 */
export interface Raster {
    readonly width: number;
    readonly height: number;
    readonly colors: readonly string[];
    readonly px: Uint8Array;
}

/** Internal: a sprite placed at (x, y) with its slots bound to fixed colours. */
export type Layer = {
    readonly sprite: Sprite;
    readonly slots: readonly string[];
    readonly x: number;
    readonly y: number;
    /** The outline is left out wherever the pixel underneath is one of these colours, so the two blend. */
    readonly noOutlineOver?: readonly string[];
    /** The same for highlights, so a layer can carry on from the one under it without a lighter edge. */
    readonly noHighlightOver?: readonly string[];
};

export type Bounds = { x: number; y: number; width: number; height: number };

export function layerBounds(layers: readonly Layer[]): Bounds {
    if (layers.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const { sprite, x, y } of layers) {
        minX = Math.min(minX, x + sprite.originX);
        minY = Math.min(minY, y + sprite.originY);
        maxX = Math.max(maxX, x + sprite.originX + sprite.width);
        maxY = Math.max(maxY, y + sprite.originY + sprite.height);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Paints layers in order (later layers on top) into a single raster. */
export function composeSprites(layers: readonly Layer[], bounds: Bounds = layerBounds(layers)): Raster {
    const { width, height } = bounds;
    const colors: string[] = [""];
    const indexOf = new Map<string, number>();
    const px = new Uint8Array(width * height);

    for (const { sprite, slots, x, y, noOutlineOver, noHighlightOver } of layers) {
        const left = x + sprite.originX - bounds.x;
        const top = y + sprite.originY - bounds.y;
        for (let sy = 0; sy < sprite.height; sy += 1) {
            const ty = top + sy;
            if (ty < 0 || ty >= height) continue;
            for (let sx = 0; sx < sprite.width; sx += 1) {
                const tx = left + sx;
                const color = slots[sprite.px[sy * sprite.width + sx]];
                if (!color || tx < 0 || tx >= width) continue;
                const slot = sprite.px[sy * sprite.width + sx];
                const under = colors[px[ty * width + tx]];
                if (noOutlineOver && slot === SLOT.outline && noOutlineOver.includes(under)) continue;
                if (noHighlightOver && slot === SLOT.highlight && noHighlightOver.includes(under)) continue;
                let ci = indexOf.get(color);
                if (ci === undefined) {
                    ci = colors.length;
                    colors.push(color);
                    indexOf.set(color, ci);
                }
                px[ty * width + tx] = ci;
            }
        }
    }

    return { width, height, colors, px };
}
