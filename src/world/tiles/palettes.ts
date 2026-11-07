// Tile colours. Tile art only refers to colours by name, never by value, so the
// whole tile world can be recoloured by choosing another fixed palette.

const defaultColors = {
    roadBase: "#726962",
    roadCurb: "#8A7D78",
    roadLine: "#FFFFFF",
    pavementBase: "#E9BFA7",
    pavementShade: "#C4A090",
    pavementLight: "#F5D0BA",
    pavementGrout: "#D4C4B4",
    brickBase: "#6B4548",
    brickMortar: "#3E2830",
    brickLight: "#8C6870",
    grass: "#8FB36A",
    grassShade: "#6E9450",
    grassLight: "#A8C682",
    water: "#6FA3C7",
    waterLight: "#A9D0E6",
    waterShade: "#4F7FA6",
    wall: "#C9BFB0",
    wallShade: "#A09585",
    wallFoundation: "#7C7364",
    floor: "#D8C8A8",
    floorLine: "#BFAE8C",
    path: "#D1B48A",
    pathShade: "#B8996D",
    pathLight: "#E3CBA5",
    roof: "#B0604A",
    roofShade: "#864637",
    roofLight: "#CC7E64",
    roofEdge: "#5E2F28",
    roofCast: "#A09585", // shadow an eave casts on the wall below it
    sky: "#BFDDEB",
    skyLight: "#D3E9F3"
} as const;

export type TileColor = keyof typeof defaultColors;

/** Every colour name in a fixed order. A tile's pixels index into this list. */
export const tileColorNames = Object.keys(defaultColors) as TileColor[];

type Palette = Readonly<Record<TileColor, string>>;

/**
 * Fixed palettes for the whole tile world. Only these can be chosen; tiles never
 * accept arbitrary colours. These are drafts.
 */
export const tilePalettes = {
    default: defaultColors,
    autumn: {
        ...defaultColors,
        grass: "#B59B47",
        grassShade: "#93803A",
        grassLight: "#D1BC66",
        water: "#6A9AA8",
        waterLight: "#A3C7CE",
        waterShade: "#4D7886",
        path: "#C49A64",
        pathShade: "#A87F4D",
        pathLight: "#DDB98A",
        roof: "#8E4B3A",
        roofShade: "#6B372B",
        roofLight: "#AD6650",
        sky: "#EAD7B9",
        skyLight: "#F3E6CF"
    },
    winter: {
        ...defaultColors,
        grass: "#E4ECEF",
        grassShade: "#C3D1D8",
        grassLight: "#FFFFFF",
        water: "#8DB4CE",
        waterLight: "#C6DDEA",
        waterShade: "#6C94B0",
        path: "#D9D3C7",
        pathShade: "#B9B1A3",
        pathLight: "#EFEAE0",
        roof: "#D8DEE4",
        roofShade: "#AEB8C2",
        roofLight: "#FFFFFF",
        roofEdge: "#5F6B77",
        sky: "#D5DFE8",
        skyLight: "#E8EFF5"
    }
} as const satisfies Record<string, Palette>;

export type TileTheme = keyof typeof tilePalettes;

export const tileThemes = Object.keys(tilePalettes) as TileTheme[];

/** Unknown themes fall back to the default, like unknown avatar options. */
export function resolveTheme(theme: string | undefined): TileTheme {
    return theme !== undefined && Object.prototype.hasOwnProperty.call(tilePalettes, theme) ? (theme as TileTheme) : "default";
}
