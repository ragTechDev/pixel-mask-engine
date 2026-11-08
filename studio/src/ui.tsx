import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, PixelImage } from "../../src/react";
import { colorDepths, colorRamps, paletteNames, palettePresets, defaultTileTheme, parseHex, tileColorGroups, tilePalettes, tileThemes, type ColorName, type HexColor, toSvg, toVariant, variantSizes, type Raster, type IconId, type PalettePreset, type VariantOptions } from "../../src";
import { CustomColours } from "./CustomColours";
import { useMediaQuery } from "./hooks";
import { recolor, type ColorMap } from "./recolor";
import { idleOf, setQuery, themeOf, tileColorsOf, tileGroupNames, variantOf, type Route } from "./router";

const BIT_LABEL: Record<number, string> = { 1: "1-bit (2 colours)", 2: "2-bit (4 greys)" };

/** Pick one of an item's common colours (or its original), shown as coloured squares. */
export function ColorDots({ label, value, options, onPick }: {
    label: string;
    value: ColorName | HexColor | undefined;
    options: readonly ColorName[];
    onPick: (color: ColorName | HexColor | undefined) => void;
}) {
    const hex = value && value.startsWith("#") ? (value as HexColor) : undefined;
    const [text, setText] = useState(hex ?? "");
    const [open, setOpen] = useState(false);
    useEffect(() => setText(hex ?? ""), [hex]);
    return (
        <div className="stack" style={{ gap: 8 }}>
            <div className="row" role="group" aria-label={label}>
                <span className="muted" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                <button className="chip" aria-pressed={value === undefined} onClick={() => onPick(undefined)}>Original</button>
                {options.map((c) => (
                    <button key={c} className="dot" aria-pressed={value === c} aria-label={c} title={c}
                        style={{ background: colorRamps[c].base }} onClick={() => onPick(value === c ? undefined : c)} />
                ))}
                <button className="dot dot-rainbow" aria-pressed={hex !== undefined} aria-expanded={open} aria-label="Custom colour" title="Custom colour"
                    onClick={() => setOpen(!open)}>+</button>
            </div>
            {open && (
                <div className="row custom-colour-panel">
                    <input type="color" className="dot-picker" aria-label="Pick a colour" value={hex ?? "#808080"} onChange={(e) => onPick(parseHex(e.target.value))} />
                    <input className="cc-name hex-input" aria-label="Hex colour" placeholder="#e8873a" maxLength={7} value={text} aria-invalid={text !== "" && !parseHex(text)}
                        onChange={(e) => { setText(e.target.value); const parsed = parseHex(e.target.value); if (parsed) onPick(parsed); }} />
                </div>
            )}
        </div>
    );
}

/** Custom colours for groups of the tile palette, kept in the address. They apply to every tile (or the whole world) shown. */
export function TileColours({ route }: { route: Route }) {
    const colors = tileColorsOf(route) ?? {};
    const theme = tilePalettes[themeOf(route)];
    const changed = Object.keys(colors).length;
    return (
        <details className="custom-colours">
            <summary>Tile colours{changed ? <b> · {changed} changed</b> : null}</summary>
            <div className="row" style={{ marginTop: 10 }}>
                {tileGroupNames.map((group) => (
                    <label key={group} className="cc-item">
                        <input type="color" aria-label={`${group} colour`} value={colors[group] ?? theme[tileColorGroups[group][0]].toLowerCase()}
                            onChange={(e) => setQuery(route, { [`tile-${group}`]: e.target.value })} />
                        <span>{group}</span>
                    </label>
                ))}
                <button className="btn" disabled={!changed} onClick={() => setQuery(route, Object.fromEntries(tileGroupNames.map((g) => [`tile-${g}`, undefined])))}>Reset</button>
            </div>
        </details>
    );
}
const FULL_COLOUR = "Full colour";

/** Pick one of the fixed palettes (or the original colours) from a dropdown. */
function PaletteSelect({ value, onPick }: { value: PalettePreset | undefined; onPick: (palette: PalettePreset | undefined) => void }) {
    return (
        <label className="row cc-select">
            <span className="muted" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>Palette</span>
            <select value={value ?? ""} onChange={(e) => onPick((e.target.value || undefined) as PalettePreset | undefined)}>
                <option value="">Original colours</option>
                {paletteNames.map((p) => <option key={p} value={p}>{paletteLabel(p)}</option>)}
            </select>
            {value && <span className="cc-palette" aria-hidden>{palettePresets[value].map((c) => <i key={c} style={{ background: c }} />)}</span>}
        </label>
    );
}

const paletteLabel = (name: string) => name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/** A grid that is already one of the size options ("16x16" for tiles) is the default, not a second chip. */
const isSquareSize = (r: { width: number; height: number } | null | undefined): r is { width: number; height: number } =>
    !!r && r.width === r.height && (variantSizes as readonly number[]).includes(r.width);

/** Whole screen pixels per art pixel so that the image fits `box` px (at least 1). */
export function fit(raster: Raster, box: number): number {
    return Math.max(1, Math.floor(box / Math.max(raster.width, raster.height, 1)));
}

export function Art({ raster, box = 72, title }: { raster: Raster; box?: number; title?: string }) {
    return <PixelImage raster={raster} pixelSize={fit(raster, box)} title={title} />;
}

export function Chips<T extends string | number>({ label, value, options, show, onPick, nativeLabel = "Default", nativeLast = false }: {
    label: string;
    value: T | undefined;
    options: readonly T[];
    show?: (v: T) => string;
    onPick: (v: T | undefined) => void;
    /** Text for the "no option" chip, or false to leave it out. */
    nativeLabel?: string | false;
    /** Put the "no option" chip after the others, for scales where it is the largest. */
    nativeLast?: boolean;
}) {
    const native = nativeLabel !== false && (
        <button className="chip" aria-pressed={value === undefined} onClick={() => onPick(undefined)}>{nativeLabel}</button>
    );
    return (
        <div className="row" role="group" aria-label={label}>
            <span className="muted" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
            {!nativeLast && native}
            {options.map((o) => (
                <button key={o} className="chip" aria-pressed={value === o} onClick={() => onPick(value === o ? undefined : o)}>
                    {show ? show(o) : o}
                </button>
            ))}
            {nativeLast && native}
        </div>
    );
}

/** Size and colour depth pickers. They live in the address, so a copied link keeps them. */
export function VariantBar({ route, themes = false, idle = false, native, sizeLabel = "Size" }: {
    route: Route;
    themes?: boolean;
    idle?: boolean;
    /** The grid the assets come in by default, if known. */
    native?: { width: number; height: number } | null;
    sizeLabel?: string;
}) {
    const v = variantOf(route);
    const phone = useMediaQuery("(max-width: 720px)");
    const sizes = variantSizes.filter((n) => !(isSquareSize(native) && n === native.width));
    const size = isSquareSize(native) && v.size === native.width ? undefined : v.size;
    const theme = themeOf(route);
    const idleOn = idle && idleOf(route);

    const chips = (
        <>
            <Chips label={sizeLabel} value={size} options={sizes} show={(n) => `${n}x${n}`} nativeLabel={native ? `${native.width}x${native.height}` : "Original"} nativeLast
                onPick={(n) => setQuery(route, { size: n?.toString() })} />
            <Chips label="Colour depth" value={v.bits} options={colorDepths} show={(b) => BIT_LABEL[b]} nativeLabel={FULL_COLOUR} nativeLast
                onPick={(b) => setQuery(route, { bits: b?.toString() })} />
            <PaletteSelect value={v.palette} onPick={(p) => setQuery(route, { palette: p })} />
            {idle && (
                <Chips label="State" value={idleOn ? "idle" : undefined} options={["idle"] as const} nativeLabel="Default"
                    onPick={(i) => setQuery(route, { idle: i ? "1" : undefined })} />
            )}
            {themes && (
                <Chips label="Season" value={theme} options={tileThemes} nativeLabel={false}
                    onPick={(t) => t && setQuery(route, { theme: t === defaultTileTheme ? undefined : t })} />
            )}
        </>
    );
    if (!phone) return <div className="tools">{chips}</div>;

    // On a phone these only change how things are drawn, so they sit behind a summary and the results come first.
    const summary = [
        size ? `${size}x${size}` : native ? `${native.width}x${native.height}` : "Original size",
        v.bits ? BIT_LABEL[v.bits] : FULL_COLOUR,
        ...(v.palette ? [paletteLabel(v.palette)] : []),
        ...(idle ? [idleOn ? "idle" : "default state"] : []),
        ...(themes ? [theme] : [])
    ].join(" · ");
    const changed = [size !== undefined, v.bits !== undefined, v.palette !== undefined, idleOn, themes && theme !== defaultTileTheme].filter(Boolean).length;
    return (
        <details className="view-options">
            <summary>
                <span className="view-options-title">View options{changed ? <b> · {changed} changed</b> : null}</span>
                <span className="view-options-summary">{summary}</span>
            </summary>
            <div className="tools">{chips}</div>
        </details>
    );
}

/** A button that shows one of the library's own icons. `label` is its tooltip and accessible name. */
export function IconButton({ icon, label, onClick, className = "", pixelSize = 2 }: {
    icon: IconId;
    label: string;
    onClick?: () => void;
    className?: string;
    pixelSize?: number;
}) {
    return (
        <button className={`btn icon-btn ${className}`.trim()} aria-label={label} title={label} onClick={onClick}>
            <Icon id={icon} pixelSize={pixelSize} />
        </button>
    );
}

/** Copies text (or whatever `text()` returns) and briefly says so. */
export function CopyButton({ text, label = "Copy", pixelSize = 2 }: { text: string | (() => string); label?: string; pixelSize?: number }) {
    const [copied, setCopied] = useState(false);
    return (
        <>
            <IconButton icon="copy" label={copied ? "Copied" : label} pixelSize={pixelSize} className={copied ? "copied" : ""}
                onClick={() => copy(typeof text === "function" ? text() : text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); })} />
            <span className="sr-only" role="status">{copied ? "Copied" : ""}</span>
        </>
    );
}

/** A Save button that opens a short menu to save as PNG or SVG. */
export function SaveMenu({ onPng, onSvg }: { onPng: () => void; onSvg: () => void }) {
    const [open, setOpen] = useState(false);
    const pick = (save: () => void) => () => { save(); setOpen(false); };
    return (
        <div className="save-menu" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
            <button className="btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
                Save <span aria-hidden>▾</span>
            </button>
            {open && (
                <div className="menu" role="menu">
                    <button className="btn" role="menuitem" onClick={pick(onPng)}>PNG</button>
                    <button className="btn" role="menuitem" onClick={pick(onSvg)}>SVG</button>
                </div>
            )}
        </div>
    );
}

export function CodeBlock({ code }: { code: string }) {
    return (
        <div className="code">
            <CopyButton text={code} pixelSize={1} />
            {code}
        </div>
    );
}

export async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const area = Object.assign(document.createElement("textarea"), { value: text });
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }
}

function download(name: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(name: string, raster: Raster, scale: number) {
    download(`${name}.svg`, new Blob([toSvg(raster, scale)], { type: "image/svg+xml" }));
}

export function downloadPng(name: string, raster: Raster, scale: number) {
    const canvas = Object.assign(document.createElement("canvas"), { width: raster.width * scale, height: raster.height * scale });
    const ctx = canvas.getContext("2d")!;
    raster.colors.forEach((color, ci) => {
        if (ci === 0) return;
        ctx.fillStyle = color;
        for (let i = 0; i < raster.px.length; i += 1) {
            if (raster.px[i] === ci) ctx.fillRect((i % raster.width) * scale, Math.floor(i / raster.width) * scale, scale, scale);
        }
    });
    canvas.toBlob((blob) => blob && download(`${name}.png`, blob), "image/png");
}

/** Every size and colour depth of one asset side by side. */
export function VariantMatrix({ raster }: { raster: Raster }) {
    const sizes: Array<VariantOptions["size"]> = [...variantSizes.filter((n) => !(isSquareSize(raster) && n === raster.width)), undefined];
    const depths: Array<VariantOptions["bits"]> = [1, 2, undefined];
    return (
        <div className="matrix" style={{ gridTemplateColumns: `auto repeat(${sizes.length}, 1fr)` }}>
            <span />
            {sizes.map((s) => <span key={s ?? "n"} style={{ textAlign: "center" }}>{s ? `${s}x${s}` : `${raster.width}x${raster.height}`}</span>)}
            {depths.map((b) => (
                <Row key={b ?? "n"} label={b ? BIT_LABEL[b] : FULL_COLOUR}>
                    {sizes.map((s) => {
                        const r = toVariant(raster, { size: s, bits: b });
                        return <div className="m checker" key={s ?? "n"}><Art raster={r} box={48} /></div>;
                    })}
                </Row>
            ))}
        </div>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return <><span>{label}</span>{children}</>;
}

export function Facts({ items }: { items: Array<[string, ReactNode]> }) {
    return (
        <dl className="kv">
            {items.map(([k, v]) => <div key={k} className="kv-item"><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
    );
}

const ZOOMS = [2, 4, 8, 16] as const;

/** The panel beside a grid: big preview, facts, snippets, downloads and the variant matrix. */
/**
 * A popover over the page, with a close button, Escape and a click outside to close it.
 * It is the browser's own modal dialog, so focus stays inside it and goes back to where you were.
 */
export function Popover({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
        return () => dialog?.close();
    }, []);
    return (
        <dialog
            ref={ref}
            className="popover"
            aria-label={label}
            onCancel={(e) => { e.preventDefault(); onClose(); }}
            onClick={(e) => { if (e.target === ref.current) onClose(); }}
        >
            {children}
        </dialog>
    );
}

export function Detail({ name, raster: shownRaster, base, facts, snippets, colors, palette, onPalette, idle, onIdle, onClose }: {
    /** The faded idle look, for items that have one. */
    idle?: boolean;
    onIdle?: (idle: boolean) => void;
    /** The palette in use, and how to change it. */
    palette?: PalettePreset;
    onPalette: (palette: PalettePreset | undefined) => void;
    name: string;
    /** Extra controls under the facts, such as the item's colour options. */
    colors?: ReactNode;
    /** The asset at its native size and colours. */
    base: Raster;
    raster: Raster;
    facts: Array<[string, ReactNode]>;
    snippets: Array<{ label: string; code: string }>;
    onClose: () => void;
}) {
    const [zoom, setZoom] = useState<number>(8);
    // These pickers recolour what is shown and saved; the generated snippets only use common colours.
    const [custom, setCustom] = useState<ColorMap>({});
    const raster = recolor(shownRaster, custom);
    const px = Math.max(1, Math.min(zoom, Math.floor(280 / Math.max(raster.width, raster.height))));
    return (
        <article className="detail" aria-label={`${name} details`}>
            <header className="detail-head">
                <h2 className="h">{name.replaceAll("_", " ")}</h2>
                <button className="btn" onClick={onClose} aria-label="Close">×</button>
            </header>
            <div className="detail-cols">
                <div className="stack">
                    <div className="row">
                        <span className="muted">Zoom</span>
                        {ZOOMS.map((z) => <button key={z} className="chip" aria-pressed={zoom === z} onClick={() => setZoom(z)}>{z}x</button>)}
                    </div>
                    <div className="stage checker"><PixelImage raster={raster} pixelSize={px} title={name} /></div>
                    <Facts items={[["Id", name], ["Grid", `${raster.width} x ${raster.height} px`], ["Colours", raster.colors.length - 1], ...facts]} />
                    {onIdle && (
                        <Chips label="State" value={idle ? "idle" : undefined} options={["idle"] as const} nativeLabel="Default" onPick={(i) => onIdle(i === "idle")} />
                    )}
                    {colors}
                    <PaletteSelect value={palette} onPick={onPalette} />
                    <CustomColours raster={shownRaster} map={custom} onChange={setCustom} />
                    <div className="row">
                        <button className="btn" onClick={() => downloadSvg(name, raster, zoom)}>SVG</button>
                        <button className="btn" onClick={() => downloadPng(name, raster, zoom)}>PNG</button>
                        <CopyButton text={() => toSvg(raster, zoom)} label="Copy SVG" />
                    </div>
                </div>
                <div className="stack">
                    {snippets.map((s) => (
                        <div key={s.label} className="stack" style={{ gap: 6 }}>
                            <span className="muted">{s.label}</span>
                            <CodeBlock code={s.code} />
                        </div>
                    ))}
                    <div className="h" style={{ marginTop: 6 }}>All variants</div>
                    <VariantMatrix raster={base} />
                </div>
            </div>
        </article>
    );
}
