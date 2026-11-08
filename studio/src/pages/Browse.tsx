import { useMemo, useState, type ReactNode } from "react";
import { ICON_SIZE, defaultTileTheme, buildIcon, buildObject, buildTile, colorableIconIds, iconCategories, iconColors, idleIconIds, objectColors, objectIds, objectInfo, seasonalObjectIds, tileIds, toVariant, type ColorName, type HexColor, type IconId, type ObjectId, type Raster, type TileId } from "../../../src";
import { iconKeywords, objectKeywords, tileKeywords } from "../keywords";
import { categoryLabel, idLabel, objectLabel, tileGroup, tileGroups } from "../labels";
import { colorOf, href, idleOf, setQuery as setRouteQuery, themeOf, tileColorsOf, variantOf, type Route } from "../router";
import { Art, ColorDots, Detail, Popover, TileColours, VariantBar } from "../ui";

interface Item {
    id: string;
    group: string;
    search: string;
}

interface Kind {
    title: string;
    blurb: string;
    path: string;
    groups: readonly string[];
    groupLabel: (g: string) => string;
    items: Item[];
    build: (id: string, route: Route) => Raster;
    facts: (id: string) => Array<[string, ReactNode]>;
    snippets: (id: string, route: Route) => Array<{ label: string; code: string }>;
    themes: boolean;
    /** The grid every asset of this kind comes in, when they all share one. */
    native?: { width: number; height: number };
    /** Whether the faded "idle" look is an option. */
    idle?: boolean;
    /** The common colours offered for one item (none if it has no main colour to change). */
    colors?: (id: string) => readonly ColorName[];
}

function coreOptions(route: Route): string {
    const { size, bits, palette } = variantOf(route);
    const parts = [size && `size: ${size}`, bits && `bits: ${bits}`, palette && `palette: "${palette}"`].filter(Boolean);
    return parts.length ? `{ ${parts.join(", ")} }` : "";
}

/** The React and core snippets for one item. `props` and `args` are what that kind adds beyond its id. */
function snippets(component: string, builder: string, id: string, route: Route, props: string[], args: string) {
    const { size, bits, palette } = variantOf(route);
    const attrs = [...props, size && `size={${size}}`, bits && `bits={${bits}}`, palette && `palette="${palette}"`].filter(Boolean).join(" ");
    const v = coreOptions(route);
    return [
        { label: "React", code: `import { ${component} } from "@ragtechdev/pixel-mask-engine/react";\n\n<${component} id="${id}"${attrs ? ` ${attrs}` : ""} />` },
        {
            label: "Core",
            code: v
                ? `import { ${builder}, toVariant } from "@ragtechdev/pixel-mask-engine";\n\nconst raster = toVariant(${builder}("${id}"${args}), ${v});`
                : `import { ${builder} } from "@ragtechdev/pixel-mask-engine";\n\nconst raster = ${builder}("${id}"${args});`
        }
    ];
}

/** A colour applies to the item that is selected, so the grid does not turn every item the same colour. */
const colorFor = (id: string, route: Route) => (id === route.path[1] ? colorOf(route) : undefined);

/** Objects come in several sizes, so their top size option is the largest one. */
const objectNative = objectIds.reduce(
    (max, id) => {
        const { width, height } = buildObject(id);
        return { width: Math.max(max.width, width), height: Math.max(max.height, height) };
    },
    { width: 0, height: 0 }
);

const kinds: Record<"icons" | "tiles" | "objects", Kind> = {
    icons: {
        title: "Icons",
        blurb: "Small coloured objects with an outline, shade and highlight. Some have an idle look, a faded version for something that is off or not current: switch State to Idle to see it.",
        path: "icons",
        groups: Object.keys(iconCategories),
        groupLabel: categoryLabel,
        items: Object.entries(iconCategories).flatMap(([group, icons]) =>
            icons.map((id) => ({ id, group, search: `${idLabel(id)} ${group} ${iconKeywords[id as IconId]}` }))
        ),
        build: (id, route) => buildIcon(id as IconId, { idle: idleOf(route), color: colorFor(id, route) as (typeof iconColors)[number] | HexColor | undefined }),
        facts: (id) => {
            const group = Object.entries(iconCategories).find(([, icons]) => (icons as readonly string[]).includes(id))?.[0] ?? "";
            return [["Category", categoryLabel(group)], ["Also called", iconKeywords[id as IconId]], ["Idle look", (idleIconIds as readonly string[]).includes(id) ? "yes" : "no"]];
        },
        snippets: (id, route) => {
            const idle = idleOf(route) && (idleIconIds as readonly string[]).includes(id);
            const color = colorOf(route);
            const options = [idle && "idle: true", color && `color: "${color}"`].filter(Boolean).join(", ");
            return snippets("Icon", "buildIcon", id, route, [idle && "idle", color && `color="${color}"`].filter(Boolean) as string[], options ? `, { ${options} }` : "");
        },
        themes: false,
        native: { width: ICON_SIZE, height: ICON_SIZE },
        idle: true,
        colors: (id) => ((colorableIconIds as readonly string[]).includes(id) ? iconColors : [])
    },
    tiles: {
        title: "Tiles",
        blurb: "Terrain pieces on a 16 by 16 grid. Every tile recolours with a palette, and edge tiles line up in nine-patch sets.",
        path: "tiles",
        groups: tileGroups,
        groupLabel: (g) => g,
        items: tileIds.map((id) => ({ id, group: tileGroup(id), search: `${idLabel(id)} ${tileGroup(id)} ${tileKeywords(id)}` })),
        build: (id, route) => buildTile(id as TileId, themeOf(route), tileColorsOf(route)),
        facts: (id) => [["Group", tileGroup(id as TileId)], ...(tileKeywords(id as TileId) ? ([["Also called", tileKeywords(id as TileId)]] as Array<[string, ReactNode]>) : [])],
        snippets: (id, route) => {
            const theme = themeOf(route);
            const colors = tileColorsOf(route);
            const literal = colors && `{ ${Object.entries(colors).map(([g, hex]) => `${g}: "${hex}"`).join(", ")} }`;
            const props = [theme === defaultTileTheme ? "" : `theme="${theme}"`, literal && `colors={${literal}}`].filter(Boolean) as string[];
            return snippets("Tile", "buildTile", id, route, props, literal ? `, ${theme === defaultTileTheme ? "undefined" : `"${theme}"`}, ${literal}` : theme === defaultTileTheme ? "" : `, "${theme}"`);
        },
        themes: true,
        native: { width: 16, height: 16 }
    },
    objects: {
        title: "Objects",
        blurb: "Things that stand on terrain: trees, doors, furniture. Each has a footprint that says where you can walk. Trees and flowers change with the season.",
        path: "objects",
        groups: ["standing", "ground"],
        groupLabel: (g) => (g === "standing" ? "Standing" : "On the ground"),
        items: objectIds.map((id) => ({ id, group: objectInfo[id].layer, search: `${id} ${objectLabel[id]} ${objectInfo[id].layer} ${objectKeywords[id]}` })),
        build: (id, route) => buildObject(id as ObjectId, themeOf(route), colorFor(id, route)),
        facts: (id) => {
            const info = objectInfo[id as ObjectId];
            return [
                ["Footprint", `${info.width} x ${info.height} tiles`],
                ["Also called", objectKeywords[id as ObjectId]],
                ["Layer", info.layer],
                ["Blocks", info.footprint.join("").includes("#") ? "yes" : "no"],
                ["Changes with season", (seasonalObjectIds as readonly string[]).includes(id) ? "yes" : "no"],
                ...(info.door ? ([["Behaviour", "door (a warp)"]] as Array<[string, ReactNode]>) : []),
                ...(info.counter ? ([["Behaviour", "counter (talk across it)"]] as Array<[string, ReactNode]>) : [])
            ];
        },
        snippets: (id, route) => {
            const theme = themeOf(route);
            const seasonal = (seasonalObjectIds as readonly string[]).includes(id) && theme !== defaultTileTheme;
            const picked = colorOf(route);
            const color = picked && (picked.startsWith("#") ? (objectColors[id as ObjectId] ?? []).length > 0 : (objectColors[id as ObjectId] ?? []).includes(picked as ColorName)) ? picked : undefined;
            const props = [seasonal && `theme="${theme}"`, color && `color="${color}"`].filter(Boolean) as string[];
            const args = color ? `, ${seasonal ? `"${theme}"` : "undefined"}, "${color}"` : seasonal ? `, "${theme}"` : "";
            return snippets("WorldObject", "buildObject", id, route, props, args);
        },
        themes: true,
        native: objectNative,
        colors: (id) => objectColors[id as ObjectId] ?? []
    }
};

export function BrowsePage({ route, kind }: { route: Route; kind: keyof typeof kinds }) {
    const k = kinds[kind];
    const [query, setQuery] = useState("");
    const [group, setGroup] = useState<string | null>(null);
    const variant = variantOf(route);
    const selected = route.path[1];

    const visible = useMemo(() => {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        return k.items.filter((i) => (!group || i.group === group) && terms.every((t) => i.search.toLowerCase().includes(t)));
    }, [k, query, group]);
    const count = (g: string) => k.items.filter((i) => i.group === g).length;

    const base = selected && k.items.some((i) => i.id === selected) ? k.build(selected, route) : null;
    const asset = (id: string) => toVariant(k.build(id, route), variant);

    return (
        <div className="stack">
            <div>
                <h1 className="h" style={{ fontSize: 18 }}>{k.title} <span className="muted">({k.items.length})</span></h1>
                <p className="muted" style={{ maxWidth: 720, marginTop: 4 }}>{k.blurb}</p>
            </div>
            <input className="search" type="search" placeholder={`Search ${k.items.length} ${k.title.toLowerCase()}`}
                aria-label={`Search ${k.title.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="browse">
                <nav className="side" aria-label={`${k.title} groups`}>
                    <button className="chip" aria-pressed={group === null} onClick={() => setGroup(null)}>
                        <span>All</span><span>{k.items.length}</span>
                    </button>
                    {k.groups.map((g) => (
                        <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
                            <span>{k.groupLabel(g)}</span><span>{count(g)}</span>
                        </button>
                    ))}
                </nav>
                <section>
                    <VariantBar route={route} themes={k.themes} idle={k.idle} native={k.native ?? base} />
                    {kind === "tiles" && <TileColours route={route} />}
                    {visible.length === 0 && <p className="muted">Nothing matches "{query}".</p>}
                    {k.groups.map((g) => {
                        const items = visible.filter((i) => i.group === g);
                        if (!items.length) return null;
                        return (
                            <div key={g}>
                                <div className="h group-title">{k.groupLabel(g)}</div>
                                <div className="grid">
                                    {items.map((i) => (
                                        <a key={i.id} href={href([k.path, i.id], route)} style={{ textDecoration: "none" }}>
                                            <div className="cell" role="button" aria-pressed={i.id === selected}>
                                                <div className="art"><Art raster={asset(i.id)} title={idLabel(i.id)} /></div>
                                                <span className="name">{idLabel(i.id)}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>
            {base && selected && (
                <Popover key={selected} label={`${selected.replaceAll("_", " ")} details`} onClose={() => { location.hash = href([k.path], route); }}>
                    <Detail name={selected} base={base} raster={toVariant(base, variant)} palette={variant.palette}
                        idle={idleOf(route)}
                        onIdle={k.idle && (idleIconIds as readonly string[]).includes(selected) ? (on) => setRouteQuery(route, { idle: on ? "1" : undefined }) : undefined}
                        onPalette={(p) => setRouteQuery(route, { palette: p })} facts={k.facts(selected)} snippets={k.snippets(selected, route)}
                        onClose={() => { location.hash = href([k.path], route); }}
                        colors={(k.colors?.(selected).length ?? 0) > 0 && !(k.idle && idleOf(route) && (idleIconIds as readonly string[]).includes(selected)) ? (
                            <ColorDots label="Main colour" value={colorOf(route)} options={k.colors!(selected)} onPick={(c) => setRouteQuery(route, { color: c })} />
                        ) : undefined} />
                </Popover>
            )}
        </div>
    );
}
