import type { Raster } from "../../src";
import { colorsOf, norm, type ColorMap } from "./recolor";

/**
 * Studio-only: change any single colour of what you are looking at, such as a door knob or a roof
 * edge. It changes the preview and the PNG or SVG you save, not the code. Whole palettes (Palette
 * option) and an item's main colour (hex) are in the library and its snippets.
 */
export function CustomColours({ raster, map, onChange }: { raster: Raster; map: ColorMap; onChange: (map: ColorMap) => void }) {
    const own = colorsOf(raster);
    const changed = Object.keys(map).length;

    return (
        <details className="custom-colours">
            <summary>Edit single colours{changed ? <b> · {changed} changed</b> : null} <span className="muted">(saved images only)</span></summary>
            <div className="stack" style={{ marginTop: 10 }}>
                <p className="muted">Pick any colour in this image. It changes the preview and the PNG or SVG you save, not the code. For code, use the main colour hex field or the Palette option.</p>
                <div className="cc-colors" aria-label="Colours in this image">
                    {own.map((color) => (
                        <label key={color} className="cc-item" title={color}>
                            <input type="color" value={map[color] ?? color} onChange={(e) => onChange({ ...map, [color]: norm(e.target.value) })} aria-label={`Colour ${color}`} />
                            <span>{map[color] ?? color}</span>
                        </label>
                    ))}
                </div>
                <div className="row">
                    <button className="btn" onClick={() => onChange({})} disabled={!changed}>Reset</button>
                </div>
            </div>
        </details>
    );
}
