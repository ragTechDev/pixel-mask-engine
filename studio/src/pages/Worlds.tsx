import { useState } from "react";
import { PixelImage } from "../../../src/react";
import { TILE_SIZE, defaultTileTheme, buildMap, mapTileSize, toMapVariant } from "../../../src";
import { useWidth } from "../hooks";
import { themeOf, tileColorsOf, variantOf, type Route } from "../router";
import { CustomColours } from "../CustomColours";
import { recolor, type ColorMap } from "../recolor";
import { Chips, CodeBlock, TileColours, VariantBar } from "../ui";
import { worlds, type WorldName } from "../worlds";

const MAX_FIT = 24;

export function WorldsPage({ route }: { route: Route }) {
    const [name, setName] = useState<WorldName>("Town");
    // undefined means "fit": the biggest whole number of screen pixels per art pixel that fits the screen.
    const [zoom, setZoom] = useState<number | undefined>(undefined);
    const [stage, stageWidth] = useWidth<HTMLDivElement>();
    const theme = themeOf(route);
    const variant = variantOf(route);
    const map = worlds[name];
    const colors = tileColorsOf(route);
    const full = buildMap(map, theme, colors);
    const mapped = toMapVariant(full, variant);
    // These pickers recolour the picture and what you save; the code above only has the tile colours and seasons.
    const [custom, setCustom] = useState<ColorMap>({});
    const raster = recolor(mapped, custom);
    const tiles = mapTileSize(map);

    // Zoom is measured against the full-size map, so changing the pixels per tile changes how
    // coarse the art is, not how big the map is on screen: 8 per tile is drawn at twice the pixel size.
    const coarseness = TILE_SIZE / (variant.size ?? TILE_SIZE);
    const fitted = Math.max(1, Math.min(MAX_FIT, Math.floor(stageWidth / full.width)));
    const pixelSize = (zoom ?? fitted) * coarseness;
    const overflows = pixelSize * raster.width > stageWidth && stageWidth > 0;
    const options = [variant.size && `size={${variant.size}}`, variant.bits && `bits={${variant.bits}}`, variant.palette && `palette="${variant.palette}"`].filter(Boolean) as string[];

    return (
        <div className="stack">
            <div>
                <h1 className="h" style={{ fontSize: 18 }}>Worlds</h1>
                <p className="muted" style={{ maxWidth: 720, marginTop: 4 }}>
                    A map is one character per block of terrain, with objects placed on top. A palette recolours the whole map at once.
                </p>
            </div>
            <div>
                <div className="tools" style={{ marginBottom: 8 }}>
                    <Chips label="Map" value={name} options={Object.keys(worlds) as WorldName[]} onPick={(n) => n && setName(n)} nativeLabel={false} />
                </div>
                <VariantBar route={route} themes native={{ width: 16, height: 16 }} sizeLabel="Pixels per tile" />
                <TileColours route={route} />
                <div className="tools" style={{ marginBottom: 0 }}>
                    <Chips label="Zoom" value={zoom} options={[1, 2, 3, 4] as const} show={(z) => `${z}x`} nativeLabel={`Fit (${fitted}x)`} onPick={setZoom} />
                </div>
            </div>
            <div className="panel">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                    <span className="h">{name}</span>
                    <span className="muted">{tiles.width} x {tiles.height} tiles, {raster.width} x {raster.height} px</span>
                </div>
                <div className="stage world-stage checker">
                    <div ref={stage} className="world-fit">
                        <PixelImage raster={raster} pixelSize={pixelSize} title={`${name} map`} />
                    </div>
                </div>
                {overflows && <p className="muted" style={{ marginTop: 8 }}>Drag to pan, or choose Fit to see the whole map.</p>}
            </div>
            <div className="panel">
                <CustomColours raster={mapped} map={custom} onChange={setCustom} />
            </div>
            <div className="panel stack">
                <span className="h">Code</span>
                <CodeBlock code={`import { World } from "@ragtechdev/pixel-mask-engine/react";
import { defineMap, townTileset } from "@ragtechdev/pixel-mask-engine";

const map = defineMap(townTileset, ["ggg", "gpg"], [{ id: "tree", x: 0, y: 0 }]);

<World map={map}${[theme === defaultTileTheme ? "" : `theme="${theme}"`, colors && `colors={{ ${Object.entries(colors).map(([g, hex]) => `${g}: "${hex}"`).join(", ")} }}`, ...options, `pixelSize={${pixelSize}}`].filter(Boolean).map((p) => ` ${p}`).join("")} />`} />
            </div>
        </div>
    );
}
