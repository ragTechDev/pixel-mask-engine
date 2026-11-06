import type { Raster } from "./compose";

/** One `<path>` per colour, with horizontal runs merged. Coordinates are in raster pixels. */
export function toSvgPaths(raster: Raster): Array<{ fill: string; d: string }> {
    const { width, height, px, colors } = raster;
    const d = colors.map(() => "");
    for (let y = 0; y < height; y += 1) {
        let x = 0;
        while (x < width) {
            const ci = px[y * width + x];
            if (!ci) {
                x += 1;
                continue;
            }
            const start = x;
            while (x < width && px[y * width + x] === ci) x += 1;
            d[ci] += `M${start} ${y}h${x - start}v1h${start - x}z`;
        }
    }
    return d.flatMap((path, ci) => (ci > 0 && path ? [{ fill: colors[ci], d: path }] : []));
}

/** Standalone SVG markup, scaled by `scale` CSS pixels per raster pixel. */
export function toSvg(raster: Raster, scale = 1): string {
    const paths = toSvgPaths(raster)
        .map((p) => `<path fill="${p.fill}" d="${p.d}"/>`)
        .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${raster.width * scale}" height="${raster.height * scale}" viewBox="0 0 ${raster.width} ${raster.height}" shape-rendering="crispEdges">${paths}</svg>`;
}

export function toSvgDataUrl(raster: Raster, scale = 1): string {
    return `data:image/svg+xml,${encodeURIComponent(toSvg(raster, scale))}`;
}
