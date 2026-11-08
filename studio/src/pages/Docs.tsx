import type { ReactNode } from "react";
import { Avatar, Icon, Tile, WorldObject } from "../../../src/react";
import { clothesPalettes, colorDepths, eyePalettes, hairPalettes, iconColors, objectColors, paletteNames, skinPalettes, tileThemes, variantSizes } from "../../../src";
import { CodeBlock } from "../ui";

/** The Docs subtopics, shown in the second-level menu. */
export const docSections = [
    ["start", "Getting started"],
    ["icons", "Icons"],
    ["avatars", "Avatars"],
    ["worlds", "Tiles, objects and worlds"],
    ["variants", "Sizes and colour depths"],
    ["together", "Using assets together"],
    ["colours", "Colours and palettes"],
    ["outside-react", "CSS, SVG and canvas"],
    ["rules", "Design rules"]
] as const;

function Demo({ children }: { children: ReactNode }) {
    return <div className="demo">{children}</div>;
}

export type DocId = (typeof docSections)[number][0];

/** One page per topic. */
const pages: Record<DocId, () => ReactNode> = {
    start: () => (
        <>
            <p>
                Art is drawn as small text masks, shading is worked out by code, and colours come from fixed palettes. Everything you build is a <code>Raster</code>:
                a small grid of pixels you can show as a React component, an inline SVG, a CSS background or a canvas.
            </p>
            <CodeBlock code="npm install @ragtechdev/pixel-mask-engine" />
            <p>There are three entries. The core has no dependencies and no DOM. React is an optional peer.</p>
            <table>
                <tbody>
                    <tr><td><code>@ragtechdev/pixel-mask-engine</code></td><td>builders such as <code>buildIcon</code>, <code>toSvg</code>, <code>toVariant</code></td></tr>
                    <tr><td><code>…/react</code></td><td><code>Icon</code>, <code>Avatar</code>, <code>Tile</code>, <code>WorldObject</code>, <code>World</code>, <code>PixelImage</code></td></tr>
                    <tr><td><code>…/canvas</code></td><td><code>paintRaster</code>, <code>drawRaster</code></td></tr>
                </tbody>
            </table>
        </>
    ),
    icons: () => (
        <>
            <p>Pick an id from <code>iconIds</code> (the Icons page lists them with their categories). <code>pixelSize</code> is how many screen pixels each icon pixel takes.</p>
            <Demo><Icon id="heart" pixelSize={4} title="Like" /><Icon id="heart_empty" pixelSize={4} /><Icon id="cottage" pixelSize={4} /></Demo>
            <CodeBlock code={`import { Icon } from "@ragtechdev/pixel-mask-engine/react";

<Icon id="heart" pixelSize={4} title="Like" />`} />
            <p>
                Some icons (<code>idleIconIds</code> lists them) have a faded look for something that is off or not the current page. It is an option, not a separate icon. Icons without one ignore it.
            </p>
            <Demo><Icon id="cottage" pixelSize={4} /><Icon id="cottage" idle pixelSize={4} /><Icon id="envelope" pixelSize={4} /><Icon id="envelope" idle pixelSize={4} /></Demo>
            <CodeBlock code={`<Icon id="cottage" idle />

// or, without React
buildIcon("cottage", { idle: true });`} />
        </>
    ),
    avatars: () => (
        <>
            <p>An avatar is plain data: ids from fixed tables. Unknown values fall back to a default, so configs loaded from storage are always safe.</p>
            <Demo><Avatar pixelSize={4} skinTone="medium" hairColor="black" topStyle="shirt" /></Demo>
            <CodeBlock code={`<Avatar skinTone="medium" hairColor="black" topStyle="shirt" pixelSize={4} />`} />
        </>
    ),
    worlds: () => (
        <>
            <p>Tiles recolour with a palette (<code>spring</code>, <code>summer</code> as the default, <code>autumn</code>, <code>winter</code>). Objects stand on terrain, and trees and flowers change with the palette too. A map is one character per block of terrain plus placed objects.</p>
            <Demo>{tileThemes.map((t) => <Tile key={t} id="grass" theme={t} pixelSize={4} />)}</Demo>
            <CodeBlock code={`import { World, Tile, WorldObject } from "@ragtechdev/pixel-mask-engine/react";

<Tile id="grass" theme="autumn" />
<WorldObject id="tree" />
<World map={map} theme="winter" pixelSize={2} />`} />
        </>
    ),
    variants: () => (
        <>
            <p>
                Every asset can be shown on a {variantSizes.map((s) => `${s}x${s}`).join(" or ")} grid, and with {colorDepths.join(" or ")} bits of colour. Pass <code>size</code> and <code>bits</code> to any component,
                or call <code>toVariant</code> on a raster.
            </p>
            <Demo>
                <Icon id="heart" pixelSize={6} />
                <Icon id="heart" size={16} pixelSize={6} />
                <Icon id="heart" size={8} pixelSize={6} />
                <Icon id="heart" size={8} bits={2} pixelSize={6} />
                <Icon id="heart" size={8} bits={1} pixelSize={6} />
            </Demo>
            <ul>
                <li><code>size</code> fits the image inside the square and centres it. Shapes keep their proportions. Shrinking keeps the most common colour in each block, and small images are only enlarged by whole numbers.</li>
                <li>For <code>World</code> and <code>toMapVariant</code>, <code>size</code> is the pixels per tile (8 or 16), not the size of the whole map, so the map keeps its tiles and proportions. 16 is the original.</li>
                <li><code>bits</code> uses fixed palettes: 1 is black and white and 2 is four greys. Transparent pixels stay transparent. Leave it out for the original colours.</li>
                <li><code>palette</code> swaps in one of six fixed four-colour palettes ({paletteNames.join(", ")}) by brightness: each colour takes the palette tone for its own brightness, so an idle icon stays faded. It is applied after <code>bits</code>, for example <code>{'<Icon id="heart" bits={2} palette="game-boy" />'}</code> or <code>toVariant(raster, {"{ palette: \"sepia\" }"})</code>.</li>
                <li>Any other value is ignored and gives you the original, which keeps its own grid and its full colours. Every icon is drawn on the same 20x20 canvas, so icons share one default size.</li>
            </ul>
            <CodeBlock code={`import { buildTile, toVariant } from "@ragtechdev/pixel-mask-engine";

const retro = toVariant(buildTile("grass"), { size: 8, bits: 1 });`} />
        </>
    ),
    together: () => (
        <>
            <p>
                Each kind comes on its own grid. Tiles are 16x16 (one world tile). Objects cover whole tiles: 16x16, 16x32, 32x16 or 32x32. An avatar is 16x24. Every icon is drawn on one 20x20 canvas.
                On one surface, show them at their original size with one shared <code>pixelSize</code>. Every art pixel is then the same physical size, so mixed assets look like they belong together.
            </p>
            <Demo>
                <Tile id="path" pixelSize={4} />
                <WorldObject id="door" pixelSize={4} />
                <Avatar pixelSize={4} />
                <Icon id="cottage" pixelSize={4} />
            </Demo>
            <CodeBlock code={`const PX = 4; // one value for the whole surface

<Tile id="path" pixelSize={PX} />
<WorldObject id="door" pixelSize={PX} />
<Avatar pixelSize={PX} />
<Icon id="cottage" pixelSize={PX} />`} />
            <ul>
                <li><strong>World scenes</strong> (tiles, objects, avatars) share the 16 pixel tile grid, so they stay in proportion. An avatar is about a tile and a half tall, so it fits through a door.</li>
                <li><strong>Icons beside world art</strong> are 20 pixels against a 16 pixel tile. That reads as interface next to scenery. Do not use an icon where you mean a tile-sized object.</li>
                <li><strong><code>size</code> fits each asset into its own box</strong>, so the shrink factor differs: a 20 pixel icon at <code>size=&#123;8&#125;</code> shrinks by 0.4, a tile by 0.5 and an avatar by about 0.33. Mixed kinds at one <code>size</code> end up with different effective pixel sizes. Use <code>size</code> to pick a tier within one kind, such as all icons at 16x16.</li>
                <li><strong><code>bits</code> is safe to mix</strong>, because a 1 or 2-bit palette is the same for every kind.</li>
            </ul>
        </>
    ),
    colours: () => (
        <>
            <p>
                Every colour the library draws comes from a fixed table, so what you build is always one of the named looks below. Pick by name; there is no way to pass a colour of your own to the library.
            </p>
            <h3>Avatars</h3>
            <p>Each part has its own list. Skin: {Object.keys(skinPalettes).join(", ")}. Hair: {Object.keys(hairPalettes).join(", ")} (<code>brown</code> is brunette). Eyes: {Object.keys(eyePalettes).join(", ")}. Clothes: {Object.keys(clothesPalettes).join(", ")}. <code>clothesColor</code> colours every piece; <code>topColor</code>, <code>bottomColor</code> and <code>shoeColor</code> give one piece a colour of its own. A dress or overalls is a top (<code>topStyle="dress"</code>) that covers the bottom.</p>
            <Demo>{(["blonde", "brown", "red", "auburn", "grey", "pink"] as const).map((hairColor) => <Avatar key={hairColor} hairColor={hairColor} pixelSize={3} />)}</Demo>
            <CodeBlock code={`<Avatar skinTone="tan" hairColor="auburn" eyeColor="hazel" clothesColor="teal" />

// a different colour for single pieces
<Avatar clothesColor="blue" topColor="red" shoeColor="yellow" />`} />
            <h3>Icons and objects</h3>
            <p>
                Icons with a main colour (<code>colorableIconIds</code>) and objects with one (<code>colorableObjectIds</code>) take a common colour. Icons accept {iconColors.join(", ")}.
                Each object has its own list, for example doors: {objectColors.door?.join(", ")}; trees: {objectColors.tree?.join(", ")}. A colour replaces the main colour and leaves the rest (a door knob, a bark trunk) alone. On a tree or flower it wins over the season.
            </p>
            <Demo>
                <Icon id="heart" pixelSize={3} /><Icon id="heart" color="blue" pixelSize={3} /><Icon id="heart" color="purple" pixelSize={3} />
                <Icon id="mailbox" color="red" pixelSize={3} /><Icon id="cottage" color="teal" pixelSize={3} />
                <WorldObject id="door" color="green" pixelSize={3} /><WorldObject id="door" color="blue" pixelSize={3} /><WorldObject id="tree" color="pink" pixelSize={3} />
            </Demo>
            <CodeBlock code={`<Icon id="heart" color="blue" />
<WorldObject id="door" color="green" />

buildIcon("heart", { color: "blue" });
buildObject("door", undefined, "green");   // the second argument is the season`} />
            <p>Icons, objects and tiles also take any hex colour, written <code>#rgb</code> or <code>#rrggbb</code>. The other tones are shaded from it the same way every time.</p>
            <CodeBlock code={`<Icon id="heart" color="#e8873a" />
<WorldObject id="door" color="#336699" />
<Tile id="grass" colors={{ grass: "#5fae3c" }} />
<World map={map} colors={{ water: "#2a6f97", roof: "#7a3b8f" }} />

buildIcon("heart", { color: "#e8873a" });
buildTile("grass", "summer", { grass: "#5fae3c" });
buildMap(map, "summer", { water: "#2a6f97" });   // groups: grass, water, path, roof, pavement`} />
            <p>An unknown colour, an invalid hex value, or one that is not offered for that item is ignored and gives the original. Avatars only take their fixed presets.</p>
            <h3>Custom colours in the studio</h3>
            <p>
                In the studio you can go further: change any single colour with a colour picker, swap in a whole palette (presets such as Game Boy, or ones you save yourself), or pick a custom colour for the avatar's hair, skin, eyes or clothes.
                These change the preview and the PNG or SVG you save. Hex colours for icons, objects and tiles are also in the code (above); avatar custom colours and palette swaps are studio-only, because avatars keep to fixed palettes by design.
            </p>
        </>
    ),
    "outside-react": () => (
        <>
            <CodeBlock code={`import { buildIcon, toSvg, toSvgDataUrl } from "@ragtechdev/pixel-mask-engine";
import { drawRaster } from "@ragtechdev/pixel-mask-engine/canvas";

img.src = toSvgDataUrl(buildIcon("heart"), 4);        // 4 screen pixels per icon pixel
el.style.backgroundImage = \`url("\${toSvgDataUrl(buildIcon("heart"), 2)}")\`;
const markup = toSvg(buildIcon("heart"), 4);           // an SVG string
drawRaster(ctx, buildIcon("heart"), 0, 0, 4);          // nearest-neighbour canvas`} />
        </>
    ),
    rules: () => (
        <>
            <ul>
                <li><strong>Constrained by design.</strong> Art is fixed masks and fixed palettes. The library never accepts arbitrary images, avatars never accept arbitrary colours, and icons, objects and tiles accept only a validated hex colour.</li>
                <li><strong>Small on purpose.</strong> Each part is tree-shakeable, so you ship only what you import.</li>
                <li><strong>Made in code.</strong> No generated images or video: everything renders from code at a fraction of the resources.</li>
                <li><strong>Licences.</strong> Code is MIT. Art is CC BY 4.0.</li>
            </ul>
            <p className="muted">The full reference is in the <a href="https://github.com/ragTechDev/pixel-mask-engine#readme">README on GitHub</a>.</p>
        </>
    )
};

export function DocsPage({ topic }: { topic?: string }) {
    const id = (docSections.find(([known]) => known === topic)?.[0] ?? "start") as DocId;
    const title = docSections.find(([known]) => known === id)?.[1];
    return (
        <div className="docs">
            <article className="prose">
                <h1 className="h" style={{ fontSize: 22 }}>{title}</h1>
                {pages[id]()}
                <NextLink from={id} />
            </article>
        </div>
    );
}

/** The link at the bottom of a page that goes to the next one (the last page leads on to the library). */
function NextLink({ from }: { from: string }) {
    const i = docSections.findIndex(([id]) => id === from);
    const next = docSections[i + 1];
    const href = next ? `#/docs/${next[0]}` : "#/icons";
    const title = next ? next[1] : "Browse the library";
    return (
        <p className="next-link">
            <a href={href}>
                <span>{next ? "Next" : "Done reading?"}</span> {title} →
            </a>
        </p>
    );
}
