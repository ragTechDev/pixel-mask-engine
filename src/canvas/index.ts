import type { Raster } from "../core/compose";

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type AnyContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const painted = new WeakMap<Raster, AnyCanvas>();

function hexToRgba(color: string): [number, number, number, number] {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

/** Paints a raster once at 1:1 into an (offscreen) canvas; repeated calls reuse it. */
export function paintRaster(raster: Raster): AnyCanvas {
    const cached = painted.get(raster);
    if (cached) return cached;

    const { width, height, px, colors } = raster;
    const canvas: AnyCanvas =
        typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(width, height)
            : Object.assign(document.createElement("canvas"), { width, height });
    const ctx = canvas.getContext("2d") as AnyContext;
    const image = ctx.createImageData(width, height);
    const rgba = colors.map((c, i) => (i === 0 ? [0, 0, 0, 0] : hexToRgba(c)));
    for (let i = 0; i < px.length; i += 1) image.data.set(rgba[px[i]], i * 4);
    ctx.putImageData(image, 0, 0);

    painted.set(raster, canvas);
    return canvas;
}

/** Draws a raster with nearest-neighbour scaling. */
export function drawRaster(ctx: AnyContext, raster: Raster, x: number, y: number, scale = 1): void {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(paintRaster(raster), x, y, raster.width * scale, raster.height * scale);
}
