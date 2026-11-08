import { colorRamps, type ColorName } from "../core/colors";
import { parseHex, rampFromHex, type HexColor } from "../core/customColor";
import { composeSprites, layerBounds, type Layer, type Raster } from "../core/compose";
import type { PixelMask } from "../core/maskUtils";
import { defineSprite, rampSlots, shadeMask, type Ramp, type Sprite } from "../core/sprite";
import { iconTables, type IconCategory } from "./categories";
import type { Part } from "./parts";
import { iconRamps } from "./ramps";

type Tables = typeof iconTables;
type StoredId = { [C in IconCategory]: keyof Tables[C] }[IconCategory] & string;
const IDLE = "_idle";

/** Every icon is centred on a square canvas this big, so all icons share one size (the widest icon is 20 pixels). */
export const ICON_SIZE = 20;

/** The id of an icon. Faded variants are not separate icons: ask for them with `{ idle: true }`. */
export type IconId = Exclude<StoredId, `${string}${typeof IDLE}`>;

/** The common colours an icon can be shown in. */
export const iconColors = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "brown", "grey"] as const satisfies readonly ColorName[];
export type IconColor = (typeof iconColors)[number];

export interface IconOptions {
    /** The faded, unsealed look for something that is switched off or not current. Ignored for icons without one. */
    idle?: boolean;
    /**
     * Show the icon's main colour as another common colour, or as any hex colour such as `"#e8873a"`.
     * Ignored for icons without one (`colorableIconIds`) and for anything that is not one of those.
     */
    color?: IconColor | HexColor;
}

/** The ramp that makes up an icon's main colour: the one `color` replaces. */
const accents: Partial<Record<string, Ramp>> = {
    heart: iconRamps.heart,
    mailbox: iconRamps.mailbox,
    bookmark: iconRamps.coral,
    note_ribbon: iconRamps.heart,
    pinned_note: iconRamps.heart,
    jar: iconRamps.heart,
    cottage: iconRamps.roof,
    willage_map: iconRamps.roof,
    quill: iconRamps.ink_blue,
    cog: iconRamps.wicker,
    notice_board: iconRamps.wicker
};

const iconParts = Object.assign({}, ...Object.values(iconTables)) as Record<StoredId, readonly Part[]>;
const isIdleKey = (key: string) => key.endsWith(IDLE);

export const iconIds = Object.keys(iconParts).filter((key) => !isIdleKey(key)) as IconId[];

/** The icons that have a main colour you can change with `color`. */
export const colorableIconIds = iconIds.filter((id) => id in accents);

/** The ids that have an idle look. */
export const idleIconIds = iconIds.filter((id) => `${id}${IDLE}` in iconParts);

/** Icon ids grouped by category. */
export const iconCategories = Object.fromEntries(
    Object.entries(iconTables).map(([category, table]) => [category, Object.keys(table).filter((key) => !isIdleKey(key))])
) as unknown as { [C in IconCategory]: readonly IconId[] };


const shadedSprites = new WeakMap<PixelMask, Sprite>();

function layerOf(part: Part, accent?: Ramp, color?: Ramp): Layer {
    if ("shaded" in part) {
        let sprite = shadedSprites.get(part.shaded);
        if (!sprite) {
            sprite = shadeMask(part.shaded);
            shadedSprites.set(part.shaded, sprite);
        }
        const ramp = accent && color && part.ramp === accent ? color : part.ramp;
        return { sprite, slots: rampSlots(ramp), x: part.x, y: part.y };
    }
    return { sprite: defineSprite(part.flat, { "1": 1 }), slots: ["", part.color], x: part.x, y: part.y };
}

function paintedExtent({ width, height, px }: Raster) {
    let minX = width, minY = height, maxX = -1, maxY = -1;
    px.forEach((ci, i) => {
        if (!ci) return;
        const x = i % width;
        const y = Math.floor(i / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });
    return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const built = new Map<string, Raster>();

/** Returns the (memoised) coloured, shaded raster for an icon. Colours come from fixed ramps. */
export function buildIcon(id: IconId, options: IconOptions = {}): Raster {
    if (!iconParts[id] || isIdleKey(id)) throw new Error(`Unknown icon: ${String(id)}`);
    const key = options.idle && `${id}${IDLE}` in iconParts ? `${id}${IDLE}` : id;
    // The faded idle look has its own colours, so a colour only applies to the normal look.
    const wanted = options.color && key === id && id in accents ? options.color : undefined;
    const color = wanted && (iconColors as readonly string[]).includes(wanted) ? wanted : parseHex(wanted);
    const cacheKey = color ? `${key}:${color}` : key;
    let raster = built.get(cacheKey);
    if (!raster) {
        const layers = iconParts[key as StoredId].map((part) => layerOf(part, accents[id], color && (color.startsWith("#") ? rampFromHex(color as HexColor) : colorRamps[color as IconColor])));
        const own = layerBounds(layers);
        const painted = paintedExtent(composeSprites(layers, own));
        // Centre what is actually painted: sprites carry transparent padding for their outline.
        raster = composeSprites(layers, {
            x: own.x + painted.x - Math.floor((ICON_SIZE - painted.width) / 2),
            y: own.y + painted.y - Math.floor((ICON_SIZE - painted.height) / 2),
            width: ICON_SIZE,
            height: ICON_SIZE
        });
        built.set(cacheKey, raster);
    }
    return raster;
}
