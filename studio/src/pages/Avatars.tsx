import { useEffect, useState } from "react";
import { PixelImage } from "../../../src/react";
import {
    avatarKey,
    backHairStyles,
    bottomStyles,
    buildAvatar,
    clothesPalettes,
    createCache,
    defaultAvatarConfig,
    eyePalettes,
    frontHairStyles,
    hairPalettes,
    pieceColorFields,
    resolveAvatarConfig,
    shoeStyles,
    skinPalettes,
    tilePalettes,
    toSvg,
    toVariant,
    topStyles,
    type AvatarConfig,
    type Raster,
    type ResolvedAvatarConfig
} from "../../../src";
import { useMediaQuery } from "../hooks";
import { CustomColours } from "../CustomColours";
import { colorRows, isolate, norm, rampFromBase, recolor, type ColorMap } from "../recolor";
import { variantOf, type Route } from "../router";
import { CodeBlock, SaveMenu, VariantBar, VariantMatrix, copy, downloadPng, downloadSvg } from "../ui";

type Crop = "head" | "body" | "feet";
type Field = keyof AvatarConfig;

interface Section {
    field: Field;
    title: string;
    options: readonly string[];
    crop: Crop;
    /** A colour field is picked from swatches of the palette's base colour. */
    colors?: Record<string, { base: string }>;
    /** A line of help under the title. */
    hint?: string;
}

/** What a tab's icon zooms in on. */
type Element = "skin" | "eyes" | "hair" | "top" | "bottom" | "shoes";

interface Tab {
    id: Element;
    label: string;
    crop: Crop;
    sections: Section[];
}

const keys = (table: object) => Object.keys(table);

const TABS: Tab[] = [
    { id: "skin", label: "Skin", crop: "head", sections: [
        { field: "skinTone", title: "Skin tone", options: keys(skinPalettes), crop: "head", colors: skinPalettes }
    ] },
    { id: "eyes", label: "Eyes", crop: "head", sections: [
        { field: "eyeColor", title: "Eye colour", options: keys(eyePalettes), crop: "head", colors: eyePalettes }
    ] },
    { id: "hair", label: "Hair", crop: "head", sections: [
        { field: "hairColor", title: "Hair colour", options: keys(hairPalettes), crop: "head", colors: hairPalettes },
        { field: "frontHairStyle", title: "Fringe", options: keys(frontHairStyles), crop: "head" },
        { field: "backHairStyle", title: "Back", options: keys(backHairStyles), crop: "head" }
    ] },
    { id: "top", label: "Top", crop: "body", sections: [
        { field: "topStyle", title: "Top", hint: "Dresses and overalls are tops that cover the bottom.", options: keys(topStyles), crop: "body" },
        { field: "topColor", title: "Top colour", options: keys(clothesPalettes), crop: "body", colors: clothesPalettes }
    ] },
    { id: "bottom", label: "Bottom", crop: "body", sections: [
        { field: "bottomStyle", title: "Bottom", options: keys(bottomStyles), crop: "body" },
        { field: "bottomColor", title: "Bottom colour", options: keys(clothesPalettes), crop: "body", colors: clothesPalettes }
    ] },
    { id: "shoes", label: "Shoes", crop: "feet", sections: [
        { field: "shoeStyle", title: "Shoes", options: keys(shoeStyles), crop: "feet" },
        { field: "shoeColor", title: "Shoe colour", options: keys(clothesPalettes), crop: "feet", colors: clothesPalettes }
    ] }
];

const PALETTES = { skinTone: skinPalettes, eyeColor: eyePalettes, hairColor: hairPalettes, topColor: clothesPalettes, bottomColor: clothesPalettes, shoeColor: clothesPalettes } as const;
type ColourField = keyof typeof PALETTES;
const isColourField = (field: Field): field is ColourField => field in PALETTES;
/** A one-piece top (a dress, overalls) covers the legs, so there is no bottom under it. */
const coversBottom = (top: string | undefined) => (topStyles as Record<string, { coversBottom?: boolean }>)[top ?? ""]?.coversBottom === true;
/** What a covering top becomes when you pick a bottom: an ordinary top. */
const ORDINARY_TOP = "shirt";
const isPieceColour = (field: Field): field is (typeof pieceColorFields)[number] => (pieceColorFields as readonly string[]).includes(field);

const presetBase = (field: ColourField, id: string) => (PALETTES[field] as Record<string, { base: string }>)[id]?.base ?? "#888888";

/** Names people use for a colour, where the id is not the common word (brown hair is brunette). */
const NAMES: Partial<Record<Field, Record<string, string>>> = { hairColor: { brown: "brunette" }, eyeColor: { dark: "dark brown" } };

/** Turning goes round in this order. */
const FACING = ["front", "right", "back", "left"] as const;

const STORAGE_KEY = "pixel-mask-studio:avatar";
const CUSTOM_KEY = "pixel-mask-studio:avatar-custom";

/** camelCase and snake_case ids as plain words. */
const words = (id: string) => id.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase();

const pick = <T,>(options: readonly T[]): T => options[Math.floor(Math.random() * options.length)];

function loadLook(): AvatarConfig {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        // resolveAvatarConfig drops anything that is not in the fixed tables.
        if (saved) {
            const old = JSON.parse(saved);
            // Looks saved before dresses and overalls became tops.
            if (old && typeof old.fullOutfitStyle === "string" && old.fullOutfitStyle !== "none") {
                old.topStyle = old.fullOutfitStyle;
                if (old.outfitColor) old.topColor = old.outfitColor;
            }
            // The creator no longer has an "all clothes" colour: each piece keeps the colour it had.
            if (old && typeof old.clothesColor === "string" && old.clothesColor !== defaultAvatarConfig.clothesColor) {
                for (const field of pieceColorFields) old[field] ??= old.clothesColor;
                delete old.clothesColor;
            }
            return resolveAvatarConfig(old);
        }
    } catch {
        // No storage (private window, blocked): start from the default.
    }
    return { ...defaultAvatarConfig };
}

type Custom = Partial<Record<ColourField, string>>;

function loadCustom(): Custom {
    try {
        const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "{}");
        const out: Custom = {};
        for (const field of Object.keys(PALETTES) as ColourField[]) {
            if (typeof parsed?.[field] === "string" && /^#[0-9a-f]{6}$/i.test(parsed[field])) out[field] = norm(parsed[field]);
        }
        return out;
    } catch {
        return {};
    }
}

/**
 * Custom picks recolour the four colours of the part's current preset (studio only). Clothes
 * pieces may share a preset, so a piece with a custom colour is first drawn in a preset nothing
 * else uses, and only that preset's colours are replaced.
 */
function prepare(look: ResolvedAvatarConfig, custom: Custom): { render: ResolvedAvatarConfig; map: ColorMap } {
    const map: ColorMap = {};
    const render: ResolvedAvatarConfig = { ...look };
    const used = new Set<string>(pieceColorFields.map((field) => look[field] ?? look.clothesColor));
    for (const field of Object.keys(custom) as ColourField[]) {
        const hex = custom[field];
        if (!hex) continue;
        let name: string;
        if (isPieceColour(field)) {
            name = keys(clothesPalettes).find((id) => !used.has(id)) ?? look.clothesColor;
            used.add(name);
            (render as Record<string, unknown>)[field] = name;
        } else {
            name = look[field];
        }
        const original = (PALETTES[field] as Record<string, { base: string; shadow: string; highlight: string; outline: string }>)[name];
        if (!original) continue;
        const ramp = rampFromBase(hex);
        for (const tone of ["base", "shadow", "highlight", "outline"] as const) map[norm(original[tone])] = ramp[tone];
    }
    return { render, map };
}

function shuffled(current: AvatarConfig): AvatarConfig {
    const next: Record<string, string> = { ...(resolveAvatarConfig(current) as Record<string, string>) };
    for (const tab of TABS) {
        for (const section of tab.sections) next[section.field] = pick(section.options);
    }
    // Each piece often matches the clothes colour, and sometimes has a colour of its own.
    for (const field of pieceColorFields) next[field] = Math.random() < 0.5 ? next.clothesColor : pick(keys(clothesPalettes));
    // Keep it dressed: always a real top and bottom, and now and then a dress or overalls.
    const tops = keys(topStyles).filter((id) => id !== "none");
    const wantCover = Math.random() < 0.25;
    next.topStyle = pick(tops.filter((id) => coversBottom(id) === wantCover));
    next.bottomStyle = pick(keys(bottomStyles).filter((id) => id !== "none"));
    next.headOrientation = current.headOrientation ?? "front";
    return next as AvatarConfig;
}

const CROP_ROWS = { head: 14, feet: 9 } as const;

/** The rows of the avatar from the shoulders down to the hips. */
const TORSO_ROWS: [number, number] = [11, 21];

const ramp = (palette: Record<string, Record<string, string>>, id: string) => Object.values(palette[id] ?? {});
const iconCache = createCache<Raster | null>(128);

/** The rows of the avatar a part sits in, for close-ups that show it as worn. */
const ROWS = {
    head: [0, CROP_ROWS.head] as [number, number],
    // Shoulders to hips.
    torso: TORSO_ROWS,
    // Hips to feet.
    hips: [17, 24] as [number, number],
    // Shins to feet.
    feet: [19, 24] as [number, number]
};

/** Every colour in the picture, to crop to the rows without leaving anything out. */
const everything = (r: Raster) => r.colors.slice(1);

/**
 * The picture for a tab or an option: that part of your character, close up and as worn, so the sleeves
 * of a top sit on the arms and a hairstyle sits on a head. Skin is the bare face. No two parts look alike.
 */
function elementArt(look: ResolvedAvatarConfig, element: Element): Raster | null {
    // Always from the front, so a part is never hidden by the way the character is facing.
    const front: ResolvedAvatarConfig = { ...look, headOrientation: "front" };
    return iconCache.get(`${avatarKey(front)}|${element}`, () => {
        switch (element) {
            case "skin": {
                const r = buildAvatar(front);
                return isolate(r, [...ramp(skinPalettes, front.skinTone), ...ramp(eyePalettes, front.eyeColor)], ROWS.head);
            }
            case "eyes": {
                // The eye line with a little face around it.
                const r = buildAvatar(front);
                const rows = colorRows(r, ramp(eyePalettes, front.eyeColor));
                return rows ? isolate(r, everything(r), [Math.max(0, rows[0] - 2), rows[1] + 3]) : null;
            }
            case "hair": {
                const r = buildAvatar(front);
                return isolate(r, everything(r), ROWS.head);
            }
            case "top": {
                // Short hair keeps a ponytail out of the way of the shoulders.
                const r = buildAvatar({ ...front, topStyle: front.topStyle === "none" ? "shirt" : front.topStyle, bottomStyle: "none", shoeStyle: "none", backHairStyle: "shortCropped" });
                return isolate(r, everything(r), ROWS.torso);
            }
            case "bottom": {
                // A dress would hide it, so it is shown under a plain shirt.
                const r = buildAvatar({ ...front, topStyle: "shirt", bottomStyle: front.bottomStyle === "none" ? "shorts" : front.bottomStyle, shoeStyle: "none", backHairStyle: "shortCropped" });
                return isolate(r, everything(r), ROWS.hips);
            }
            case "shoes": {
                const r = buildAvatar({ ...front, topStyle: "shirt", bottomStyle: "shorts", shoeStyle: front.shoeStyle === "none" ? "boots" : front.shoeStyle, backHairStyle: "shortCropped" });
                return isolate(r, everything(r), ROWS.feet);
            }
        }
    });
}

function ElementIcon({ look, element }: { look: ResolvedAvatarConfig; element: Element }) {
    const art = elementArt(look, element);
    if (!art) return <span className="ctab-art" aria-hidden />;
    // Whole pixels, as big as fits the icon box.
    const px = Math.max(1, Math.floor(Math.min(46 / art.width, 32 / art.height)));
    return (
        <span className="ctab-art" aria-hidden>
            <PixelImage raster={art} pixelSize={px} />
        </span>
    );
}

/** Which element of the character an option changes, so its card can show just that. */
const ELEMENT_OF: Partial<Record<Field, Element>> = {
    frontHairStyle: "hair",
    backHairStyle: "hair",
    topStyle: "top",
    bottomStyle: "bottom",
    shoeStyle: "shoes"
};

/** The style cards of one section: each shows only that element, close up, all at the same scale. */
function OptionGrid({ section, look, current, bottomCovered, choose }: {
    section: Section;
    look: ResolvedAvatarConfig;
    current: string;
    bottomCovered: boolean;
    choose: (field: Field, value: string) => void;
}) {
    const element = ELEMENT_OF[section.field];
    const arts = section.options.map((id) =>
        element && id !== "none" ? elementArt(resolveAvatarConfig({ ...look, [section.field]: id }), element) : null
    );
    // One pixel size for the whole row, so a short style does not look bigger than a long one.
    const biggest = arts.reduce((m, a) => ({ w: Math.max(m.w, a?.width ?? 0), h: Math.max(m.h, a?.height ?? 0) }), { w: 1, h: 1 });
    const px = Math.max(1, Math.floor(Math.min(92 / biggest.w, 56 / biggest.h)));
    return (
        <div className="opt-grid">
            {section.options.map((id, i) => {
                const selected = id === current && !(section.field === "bottomStyle" && bottomCovered);
                const art = arts[i];
                return (
                    <button key={id} className="opt" aria-pressed={selected} onClick={() => choose(section.field, id)}>
                        <span className="opt-art" aria-hidden>
                            {art ? <PixelImage raster={art} pixelSize={px} /> : <span className="opt-none">–</span>}
                        </span>
                        <span>{id === "none" ? "None" : words(id)}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function AvatarsPage({ route }: { route: Route }) {
    const [cfg, setCfg] = useState<AvatarConfig>(loadLook);
    const [tabId, setTabId] = useState(TABS[0].id);
    const [copied, setCopied] = useState(false);
    const [custom, setCustom] = useState<Custom>(loadCustom);
    const [userMap, setUserMap] = useState<ColorMap>({});
    const phone = useMediaQuery("(max-width: 720px)");

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        } catch {
            // Nothing to do: the look just is not remembered.
        }
    }, [cfg]);

    useEffect(() => {
        try {
            localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
        } catch {
            // Not remembered.
        }
    }, [custom]);

    const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];
    const look = resolveAvatarConfig(cfg);
    const variant = variantOf(route);
    const full = buildAvatar(look);
    // Custom colours are studio-only: picked per part, then any colour tweaks or palette on top.
    const prepared = prepare(look, custom);
    const parted = recolor(Object.keys(custom).length ? buildAvatar(prepared.render) : full, prepared.map);
    const shown = toVariant(recolor(parted, userMap), variant);
    const hasCustom = Object.keys(custom).length > 0 || Object.keys(userMap).length > 0;
    const px = Math.max(1, Math.floor((phone ? 130 : 230) / Math.max(shown.width, shown.height)));
    const facing = FACING.indexOf(look.headOrientation as (typeof FACING)[number]);

    // Picking a bottom under a dress or overalls swaps that for an ordinary top, so the bottom shows.
    const choose = (field: Field, value: string) => {
        if (isColourField(field)) setCustom((prev) => { const { [field]: _gone, ...rest } = prev; return rest; });
        setCfg((prev) => {
            const next: AvatarConfig = {
                ...prev,
                [field]: value,
                ...(field === "bottomStyle" && coversBottom(prev.topStyle) ? { topStyle: ORDINARY_TOP as AvatarConfig["topStyle"] } : {})
            };
            return next;
        });
    };
    const turn = (by: number) => setCfg((prev) => ({ ...prev, headOrientation: FACING[(Math.max(0, facing) + by + FACING.length) % FACING.length] }));

    const changed = Object.entries(look).filter(([k, v]) => v !== (defaultAvatarConfig as Record<string, unknown>)[k]);
    const props = changed.map(([k, v]) => `${k}="${v}"`);
    const opts = [variant.size && `size={${variant.size}}`, variant.bits && `bits={${variant.bits}}`, variant.palette && `palette="${variant.palette}"`].filter(Boolean) as string[];
    const jsx = `<Avatar${[...props, ...opts].map((p) => `\n  ${p}`).join("")}${props.length + opts.length ? "\n" : " "}/>`;

    return (
        <div className="stack">
            <div>
                <h1 className="h" style={{ fontSize: 18 }}>Avatars</h1>
                <p className="muted" style={{ maxWidth: 720, marginTop: 4 }}>
                    Make your character: pick a tab, tap what you like, and turn them around. Your look is saved in this browser.
                </p>
            </div>
            <VariantBar route={route} native={full} />

            <div className="creator">
                <div className="stage-col">
                    <section className="panel stage-card" aria-label="Your character">
                        <div className="scene" style={{ "--sky": tilePalettes.summer.sky, "--grass": tilePalettes.summer.grass } as React.CSSProperties}>
                            <div className="scene-avatar">
                                <PixelImage raster={shown} pixelSize={px} title="Your avatar" />
                            </div>
                            <div className="scene-shadow" />
                            <button className="btn turn turn-left" onClick={() => turn(-1)} aria-label="Turn left">◀</button>
                            <button className="btn turn turn-right" onClick={() => turn(1)} aria-label="Turn right">▶</button>
                            <span className="scene-label">Facing {look.headOrientation}</span>
                        </div>
                    </section>
                    <div className="stage-actions">
                        <button className="btn primary" onClick={() => { setCfg((prev) => shuffled(prev)); setCustom({}); setUserMap({}); }}>Random</button>
                        <button className="btn" onClick={() => { setCfg({ ...defaultAvatarConfig }); setCustom({}); setUserMap({}); }}>Reset</button>
                        <SaveMenu onPng={() => downloadPng("avatar", shown, 10)} onSvg={() => downloadSvg("avatar", shown, 10)} />
                        <button className="btn" onClick={() => copy(toSvg(shown, 10)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); })}>
                            {copied ? "Copied" : "Copy SVG"}
                        </button>
                    </div>
                </div>

                <section className="panel dressing" aria-label="Customise">
                    <div className="ctabs" role="tablist" aria-label="What to change">
                        {TABS.map((t) => (
                            <button key={t.id} role="tab" className="ctab" aria-selected={t.id === tab.id} onClick={() => setTabId(t.id)}>
                                <ElementIcon look={look} element={t.id} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                    {tab.sections.map((section) => {
                        // A piece without a colour of its own shows the clothes colour.
                        const current = (look[section.field] ?? (isPieceColour(section.field) ? look.clothesColor : undefined)) as string;
                        const bottomCovered = (section.field === "bottomStyle" || section.field === "bottomColor") && coversBottom(look.topStyle);
                        return (
                            <div key={section.field} className="opt-section">
                                <div className="h opt-title">{section.title}</div>
                                {section.hint && <p className="muted opt-note">{section.hint}</p>}
                                {bottomCovered && (
                                    <p className="muted opt-note">
                                        {section.field === "bottomStyle" ? `Your ${words(look.topStyle)} covers the bottom. Picking one switches to a ${ORDINARY_TOP}.` : "Hidden while your top covers the bottom."}
                                    </p>
                                )}
                                {section.colors ? (
                                    <div className="swatches">
                                        {section.options.map((id) => {
                                            const name = NAMES[section.field]?.[id] ?? words(id);
                                            const active = id === current && !custom[section.field as ColourField];
                                            return (
                                                <div key={id} className="swatch-item">
                                                    <button className="swatch" aria-pressed={active} aria-label={name} title={name}
                                                        style={{ background: section.colors![id].base }} onClick={() => choose(section.field, id)} />
                                                    <span className="swatch-name">{name}</span>
                                                </div>
                                            );
                                        })}
                                        {isColourField(section.field) && (
                                            <div className="swatch-item">
                                                <label className="swatch swatch-custom" aria-pressed={!!custom[section.field]} title="Pick any colour (studio only)"
                                                    style={{ background: custom[section.field] ?? "conic-gradient(#e24d4d, #e8c557, #5e9a55, #3e9c9a, #4a6fa5, #8a63b0, #e24d4d)" }}>
                                                    <input type="color" aria-label={`Custom ${section.title.toLowerCase()}`} value={custom[section.field] ?? norm(presetBase(section.field, current))}
                                                        onChange={(e) => setCustom((prev) => ({ ...prev, [section.field as ColourField]: norm(e.target.value) }))} />
                                                </label>
                                                <span className="swatch-name">custom</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <OptionGrid section={section} look={look} current={current} bottomCovered={bottomCovered} choose={choose} />
                                )}
                            </div>
                        );
                    })}
                </section>
            </div>

            <div className="panel">
                <CustomColours raster={parted} map={userMap} onChange={setUserMap} />
            </div>
            <div className="panel stack">
                <span className="h">Code</span>
                <CodeBlock code={`import { Avatar } from "@ragtechdev/pixel-mask-engine/react";\n\n${jsx}`} />
                {hasCustom && <p className="muted">You used custom colours. They are in the preview and in Save PNG, but not in this code: the library only uses its fixed colours.</p>}
            </div>
            <div className="panel stack">
                <span className="h">All variants</span>
                <VariantMatrix raster={full} />
            </div>
        </div>
    );
}
