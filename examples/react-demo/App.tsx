import { useState } from "react"
import { Avatar, PixelImage, Tile } from "../../src/react"
import { avatarKey, buildAvatar, buildMap, buildObject, buildTile, createCache, defineMap, houseTileset, objectIds, objectInfo, tileIds, toSvgDataUrl, townTileset, type Raster, type AvatarConfig, type ObjectId, type PlacedObject, type TileId } from "../../src"

type AvatarProps = AvatarConfig

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:           "#efece4",   // kindle-style paper white
  panel:        "#f8f6f0",
  section:      "#e8e4d9",
  border:       "#b8b2a4",
  active:       "#57534a",
  activeBorder: "#2b2a26",
  activeGlow:   "#2b2a2622",
  btn:          "#f2efe7",
  text:         "#2b2a26",
  muted:        "#6b665b",
  accent:       "#57534a",
  accentDim:    "#6b665b",
  white:        "#ffffff",
}

const INK = "#3a3732"   // hard pixel shadows

const FONT = "'Pixelify Sans', monospace"

const pixelBorderActive = () =>
  `3px 3px 0 0 ${INK}, inset 0 0 0 2px ${C.activeBorder}, 0 0 12px ${C.activeGlow}`

// ─── Option tiles ────────────────────────────────────────────────────────────
// Every option is shown as a render of the current avatar with just that
// option applied, so you choose by looking rather than by reading a name.
type Crop = "head" | "body" | "feet"
const swatchCache = createCache<Raster>(256)
const swatchRaster = (cfg: AvatarProps) => swatchCache.get(avatarKey(cfg), () => buildAvatar(cfg))

const SWATCH_PX   = 4
const HEAD_ROWS   = 14   // head + hair + outline
const FEET_ROWS   = 9    // legs + shoes
const SWATCH_W    = 20 * SWATCH_PX

function Swatch({ cfg, crop }: { cfg: AvatarProps; crop: Crop }) {
  const raster = swatchRaster(cfg)
  const rows   = crop === "head" ? HEAD_ROWS : crop === "feet" ? FEET_ROWS : raster.height
  const shift  = crop === "feet" ? raster.height - FEET_ROWS : 0
  return (
    <div style={{
      width: SWATCH_W, height: rows * SWATCH_PX, overflow: "hidden",
      display: "flex", justifyContent: "center", background: C.section,
    }}>
      <div style={{ marginTop: -shift * SWATCH_PX }}>
        <PixelImage raster={raster} pixelSize={SWATCH_PX} />
      </div>
    </div>
  )
}

function TileGroup<K extends keyof AvatarProps>({
  label, field, options, cfg, onChange, crop, disabled = false,
}: {
  label: string
  field: K
  options: readonly NonNullable<AvatarProps[K]>[]
  cfg: AvatarProps
  onChange: (v: NonNullable<AvatarProps[K]>) => void
  crop: Crop
  disabled?: boolean
}) {
  return (
    <div style={{ marginBottom: 16, opacity: disabled ? 0.35 : 1 }}>
      <div style={{
        color: C.accentDim, fontSize: 11, letterSpacing: "0.15em",
        textTransform: "uppercase", marginBottom: 6, fontFamily: FONT,
      }}>
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
        {options.map(opt => {
          const active = opt === cfg[field]
          return (
            <button
              key={opt}
              onClick={() => !disabled && onChange(opt)}
              aria-pressed={active}
              style={{
                background:    active ? C.active : C.btn,
                border:        `2px solid ${active ? C.activeBorder : C.border}`,
                boxShadow:     active ? pixelBorderActive() : `2px 2px 0 ${INK}`,
                padding:       6,
                cursor:        disabled ? "not-allowed" : "pointer",
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           6,
                fontFamily:    FONT,
              }}
            >
              <Swatch cfg={{ ...cfg, [field]: opt }} crop={crop} />
              <span style={{
                color: active ? C.white : C.muted, fontSize: 10,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {opt}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Customizer tabs ─────────────────────────────────────────────────────────
const TABS = ["Skin", "Eyes", "Hair", "Outfit", "Shoes", "Pose", "Facing"] as const
type Tab = typeof TABS[number]

// ─── Panel wrapper ───────────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.panel,
      border:     `2px solid ${C.border}`,
      boxShadow:  `4px 4px 0 ${INK}`,
      padding:    16,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Tile data ───────────────────────────────────────────────────────────────
const TILE_IDS: TileId[] = tileIds
const TILE_LABELS: Record<TileId, string> = {
  road:           "Road",
  beige_pavement: "Pavement",
  brick_pavement: "Brick",
  grass:          "Grass",
  tall_grass:     "Tall grass",
  path:           "Path",
  water:          "Water",
  shore:          "Shore",
  wall:           "Wall",
  floor:          "Floor",
}
const TILE_DESC: Record<TileId, string> = {
  road:           "Asphalt with white lane markings",
  beige_pavement: "Flagstone running-bond + grout",
  brick_pavement: "Brick running-bond + mortar",
  grass:          "Plain grass (draft)",
  tall_grass:     "Tall grass, can trigger encounters (draft)",
  path:           "Dirt path (draft)",
  water:          "Open water, not walkable (draft)",
  shore:          "Grass, sand and water edge (draft)",
  wall:           "Stone wall, solid (draft)",
  floor:          "Wood plank floor (draft)",
}
const OBJECT_LABELS: Record<ObjectId, string> = {
  tree: "Tree", fence: "Fence", door: "Door", window: "Window",
  counter: "Counter", bookshelf: "Bookshelf", rug: "Rug", flower: "Flowers",
}

// ─── Demo worlds ─────────────────────────────────────────────────────────────
// Terrain is one character per 2×2-tile block. Objects are placed in tile
// coordinates on top and shaded automatically.
const at = (id: ObjectId, ...spots: [number, number][]): PlacedObject[] => spots.map(([x, y]) => ({ id, x, y }))
const TOWN_MAP = defineMap(townTileset, [
  "gggggggggg",
  "gghhhhgggg",
  "gghhhhgggg",
  "ggpppppggg",
  "gggpggggGG",
  "gggpgggGGG",
  "gggpgsssss",
  "gggpgwwwww",
], [
  ...at("tree", [0, 0], [2, 0], [17, 0], [19, 0], [1, 9], [18, 8]),
  ...at("window", [5, 3], [9, 3]),
  ...at("door", [7, 5]),
  ...at("fence", [8, 8], [9, 8], [10, 8], [11, 8]),
  ...at("flower", [2, 7], [3, 9], [12, 6], [14, 5]),
])
const HOUSE_MAP = defineMap(houseTileset, [
  "hhhhhhhh",
  "ffffffff",
  "ffffffff",
  "ffffffff",
  "ffffffff",
  "hhhhhhhh",
], [
  ...at("window", [3, 1], [11, 1]),
  ...at("bookshelf", [1, 2], [2, 2], [13, 2], [14, 2]),
  ...at("counter", [5, 4], [7, 4], [9, 4]),
  ...at("rug", [7, 7]),
  ...at("door", [7, 11]),
])
const TOWN_RASTER = buildMap(TOWN_MAP)
const HOUSE_RASTER = buildMap(HOUSE_MAP)

// ─── Tiled background ────────────────────────────────────────────────────────
// Uses a CSS background-image data-URL so the repeat covers any container
// size with perfect seams and zero extra React nodes.
// One scale for every preview window: SCALE CSS px per art pixel, so the
// avatar and the tiles stay proportional to each other.
const SCALE = 8
// Both preview windows show the same 32×32 art-pixel area (2×2 tiles).
const VIEW_PX = 32 * SCALE

function TileBackground({ tileId }: { tileId: TileId }) {
  const tile     = buildTile(tileId)
  const tileSize = tile.width * SCALE
  const dataUrl  = toSvgDataUrl(tile, SCALE)
  return (
    <div style={{
      position:          "absolute",
      inset:             0,
      backgroundImage:   `url("${dataUrl}")`,
      backgroundRepeat:  "repeat",
      backgroundSize:    `${tileSize}px ${tileSize}px`,
      imageRendering:    "pixelated",
    }} />
  )
}

// ─── Preview window ──────────────────────────────────────────────────────────
function PreviewWindow({ label, name, size, children }: {
  label: string; name: string; size: string; children: React.ReactNode
}) {
  return (
    <Panel style={{ padding: 0, overflow: "hidden", width: VIEW_PX, flexShrink: 0 }}>
      <div style={{ position: "relative", width: VIEW_PX, height: VIEW_PX, overflow: "hidden" }}>
        {children}
      </div>
      <div style={{
        background: C.section,
        borderTop:  `2px solid ${C.border}`,
        padding:    "8px 14px",
        display:    "flex",
        alignItems: "center",
        gap:        10,
      }}>
        <span style={{ color: C.muted, fontSize: 10, letterSpacing: "0.15em" }}>{label}</span>
        <span style={{ color: C.accent, fontSize: 13, letterSpacing: "0.12em" }}>{name}</span>
        <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10 }}>{size}</span>
      </div>
    </Panel>
  )
}

// ─── Default avatar config ───────────────────────────────────────────────────
const DEFAULT: AvatarProps = {
  headOrientation: "front",
  skinTone:        "light",
  frontHairStyle:  "centerPart",
  backHairStyle:   "lowPonytail",
  hairColor:       "brown",
  eyeColor:        "dark",
  clothesColor:    "blue",
  topStyle:        "shirt",
  bottomStyle:     "shorts",
  fullOutfitStyle: "none",
  shoeStyle:       "boots",
  armPose:         "down",
  legPose:         "neutral",
}

// ─── World view ──────────────────────────────────────────────────────────────
type Picked = { kind: "tile"; id: TileId } | { kind: "object"; id: ObjectId }
const MAPS = { Town: TOWN_RASTER, House: HOUSE_RASTER } as const
type MapName = keyof typeof MAPS
// Screen pixels per art pixel: tiles are 64 px, objects up to 128 px in the picker; maps use 3.
const PICK_SCALE  = 4
const WORLD_SCALE = 3

const sectionTitle: React.CSSProperties = {
  fontSize: 13, color: C.accent, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700,
}

function ChoiceButton({ selected, label, onClick, children }: {
  selected: boolean; label: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      title={label}
      style={{
        background:    selected ? C.active : C.btn,
        border:        `2px solid ${selected ? C.activeBorder : C.border}`,
        boxShadow:     selected ? pixelBorderActive() : `2px 2px 0 ${INK}`,
        padding:       8,
        cursor:        "pointer",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent: "flex-end",
        gap:           6,
        fontFamily:    FONT,
      }}
    >
      {children}
      <span style={{ color: selected ? C.white : C.muted, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
    </button>
  )
}

function objectDescription(id: ObjectId): string {
  const info = objectInfo[id]
  const solid = info.footprint.join("").split("#").length - 1
  const notes = [`${info.width}×${info.height} tiles`, `${info.layer} layer`]
  notes.push(solid > 0 ? `${solid} solid cell${solid > 1 ? "s" : ""}` : "walkable")
  if (info.door) notes.push("warp")
  if (info.counter) notes.push("counter")
  return notes.join(", ") + " (draft)"
}

function WorldView() {
  const [mapName, setMapName] = useState<MapName>("Town")
  const [picked, setPicked]   = useState<Picked>({ kind: "tile", id: "grass" })
  const raster = MAPS[mapName]
  const pickedName = picked.kind === "tile" ? TILE_LABELS[picked.id] : OBJECT_LABELS[picked.id]
  const pickedDesc = picked.kind === "tile" ? TILE_DESC[picked.id] : objectDescription(picked.id)

  return (
    <>
      {/* ── Left: terrain and object picker ───────────────────────────── */}
      <Panel style={{ width: 380, flexShrink: 0, overflowY: "auto", maxHeight: "calc(100vh - 76px)" }}>
        <div style={{ ...sectionTitle, marginBottom: 12 }}>Terrain</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TILE_IDS.map(id => (
            <ChoiceButton key={id} label={TILE_LABELS[id]} selected={picked.kind === "tile" && picked.id === id}
              onClick={() => setPicked({ kind: "tile", id })}>
              <Tile id={id} pixelSize={PICK_SCALE} />
            </ChoiceButton>
          ))}
        </div>

        <div style={{ ...sectionTitle, margin: "20px 0 12px" }}>Objects</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {objectIds.map(id => (
            <ChoiceButton key={id} label={OBJECT_LABELS[id]} selected={picked.kind === "object" && picked.id === id}
              onClick={() => setPicked({ kind: "object", id })}>
              <PixelImage raster={buildObject(id)} pixelSize={PICK_SCALE} title={OBJECT_LABELS[id]} />
            </ChoiceButton>
          ))}
        </div>
      </Panel>

      {/* ── Right: map viewer and selection preview ──────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <Panel>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={sectionTitle}>World</div>
            <div role="tablist" style={{ display: "flex", gap: 4 }}>
              {(Object.keys(MAPS) as MapName[]).map(name => (
                <TabButton key={name} active={name === mapName} onClick={() => setMapName(name)}>{name}</TabButton>
              ))}
            </div>
            <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10, letterSpacing: "0.1em" }}>
              {raster.width / 16}×{raster.height / 16} TILES
            </span>
          </div>
          <div style={{ overflow: "auto", background: C.section, border: `2px solid ${C.border}`, padding: 12, lineHeight: 0 }}>
            <PixelImage raster={raster} pixelSize={WORLD_SCALE} title={`${mapName} demo map`} />
          </div>
        </Panel>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          <PreviewWindow label={picked.kind === "tile" ? "TILE" : "OBJECT"} name={pickedName.toUpperCase()}
            size={picked.kind === "tile" ? "16×16 PX" : `${buildObject(picked.id).width}×${buildObject(picked.id).height} PX`}>
            {picked.kind === "tile" ? (
              <TileBackground tileId={picked.id} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: C.section }}>
                <PixelImage raster={buildObject(picked.id)} pixelSize={SCALE} title={pickedName} />
              </div>
            )}
          </PreviewWindow>
          <Panel style={{ width: 280 }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>SELECTED</div>
            <div style={{ color: C.text, fontSize: 13, letterSpacing: "0.08em", marginBottom: 4 }}>{pickedName.toUpperCase()}</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>{pickedDesc}</div>
          </Panel>
        </div>
      </div>
    </>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background:    active ? C.active : C.btn,
        color:         active ? C.white  : C.muted,
        border:        `2px solid ${active ? C.activeBorder : C.border}`,
        boxShadow:     active ? pixelBorderActive() : `2px 2px 0 ${INK}`,
        fontFamily:    FONT,
        fontSize:      11,
        padding:       "5px 10px",
        cursor:        "pointer",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cfg, setCfg]   = useState<AvatarProps>(DEFAULT)
  const [tab, setTab]   = useState<Tab>("Skin")
  const [view, setView] = useState<"avatar" | "world">("avatar")

  const set = <K extends keyof AvatarProps>(k: K) =>
    (v: AvatarProps[K]) => setCfg(prev => ({ ...prev, [k]: v }))

  const usingFullOutfit = cfg.fullOutfitStyle !== "none"
  const avatarRaster    = buildAvatar(cfg)

  return (
    <div style={{
      minHeight:     "100vh",
      background:    C.bg,
      fontFamily:    FONT,
      color:         C.text,
      display:       "flex",
      flexDirection: "column",
    }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `3px solid ${C.border}`,
        boxShadow:    `0 3px 0 ${INK}`,
        padding:      "12px 24px",
        display:      "flex",
        alignItems:   "center",
        gap:          14,
        background:   C.panel,
      }}>
        <div style={{ width: 20, height: 20, background: C.accent, boxShadow: `2px 2px 0 ${INK}` }} />
        <h1 style={{
          fontSize:      18,
          color:         C.text,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontWeight:    700,
        }}>
          Pixel Avatar Studio
        </h1>
        <div role="tablist" style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          <TabButton active={view === "avatar"} onClick={() => setView("avatar")}>Avatar</TabButton>
          <TabButton active={view === "world"} onClick={() => setView("world")}>World</TabButton>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted, letterSpacing: "0.15em" }}>
          PIXEL-MASK-ENGINE
        </span>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main style={{
        display:    "flex",
        gap:        14,
        padding:    14,
        flex:       1,
        alignItems: "flex-start",
        overflowX:  "auto",
      }}>

        {view === "world" ? <WorldView /> : (<>
        {/* ── Left: Customizer ──────────────────────────────────────────── */}
        <Panel style={{
          width:     360,
          flexShrink: 0,
          overflowY: "auto",
          maxHeight: "calc(100vh - 76px)",
        }}>
          <div style={{
            fontSize:      13,
            color:         C.accent,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            fontWeight:    700,
          }}>
            Customizer
          </div>

          {/* Tabs */}
          <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "14px 0 16px" }}>
            {TABS.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={t === tab}
                onClick={() => setTab(t)}
                style={{
                  background:    t === tab ? C.active : C.btn,
                  color:         t === tab ? C.white  : C.muted,
                  border:        `2px solid ${t === tab ? C.activeBorder : C.border}`,
                  boxShadow:     t === tab ? pixelBorderActive() : `2px 2px 0 ${INK}`,
                  fontFamily:    FONT,
                  fontSize:      11,
                  padding:       "5px 10px",
                  cursor:        "pointer",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Skin" && (
            <TileGroup label="Skin Tone" field="skinTone" crop="head" cfg={cfg}
              options={["light", "medium", "brown"] as const} onChange={set("skinTone")} />
          )}

          {tab === "Eyes" && (
            <TileGroup label="Eye Color" field="eyeColor" crop="head" cfg={cfg}
              options={["dark", "green", "blue"] as const} onChange={set("eyeColor")} />
          )}

          {tab === "Hair" && (<>
            <TileGroup label="Color" field="hairColor" crop="head" cfg={cfg}
              options={["brown", "black", "blonde"] as const} onChange={set("hairColor")} />
            <TileGroup label="Front" field="frontHairStyle" crop="head" cfg={cfg}
              options={["centerPart", "bangs", "sideSwept"] as const} onChange={set("frontHairStyle")} />
            <TileGroup label="Back" field="backHairStyle" crop="head" cfg={cfg}
              options={["lowPonytail", "highPonytail", "doubleLowPonytail", "doubleHighPonytail", "shortCropped"] as const}
              onChange={set("backHairStyle")} />
          </>)}

          {tab === "Outfit" && (<>
            <TileGroup label="Color" field="clothesColor" crop="body" cfg={cfg}
              options={["blue", "red", "green"] as const} onChange={set("clothesColor")} />
            <TileGroup label="Full Outfit" field="fullOutfitStyle" crop="body" cfg={cfg}
              options={["none", "overalls", "dress"] as const} onChange={set("fullOutfitStyle")} />
            <TileGroup label="Top" field="topStyle" crop="body" cfg={cfg} disabled={usingFullOutfit}
              options={["none", "spaghetti", "shirt", "longSleeve"] as const} onChange={set("topStyle")} />
            <TileGroup label="Bottom" field="bottomStyle" crop="body" cfg={cfg} disabled={usingFullOutfit}
              options={["none", "shorts", "skirt"] as const} onChange={set("bottomStyle")} />
          </>)}

          {tab === "Shoes" && (
            <TileGroup label="Shoes" field="shoeStyle" crop="feet" cfg={cfg}
              options={["none", "boots", "sandals", "shoes"] as const} onChange={set("shoeStyle")} />
          )}

          {tab === "Pose" && (<>
            <TileGroup label="Arm" field="armPose" crop="body" cfg={cfg}
              options={["down", "forward", "back"] as const} onChange={set("armPose")} />
            <TileGroup label="Leg" field="legPose" crop="body" cfg={cfg}
              options={["neutral", "step"] as const} onChange={set("legPose")} />
          </>)}

          {tab === "Facing" && (
            <TileGroup label="Orientation" field="headOrientation" crop="body" cfg={cfg}
              options={["front", "left", "right", "back"] as const} onChange={set("headOrientation")} />
          )}

          {/* Reset */}
          <button
            onClick={() => setCfg(DEFAULT)}
            style={{
              marginTop:     20,
              background:    C.btn,
              color:         C.muted,
              border:        `2px solid ${C.border}`,
              fontFamily:    FONT,
              fontSize:      12,
              padding:       "8px 0",
              cursor:        "pointer",
              boxShadow:     `2px 2px 0 ${INK}`,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              width:         "100%",
            }}
          >
            ↺ Reset
          </button>
        </Panel>

        {/* ── Center: Avatar preview ───────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PreviewWindow label="AVATAR" name={cfg.headOrientation!.toUpperCase()} size={`${avatarRaster.width}×${avatarRaster.height} PX`}>
              <div style={{
                position:       "absolute",
                inset:          0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     C.section,
              }}>
                <div style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.9))" }}>
                  <Avatar {...cfg} pixelSize={SCALE} />
                </div>
              </div>
            </PreviewWindow>
          </div>
        </div>

        </>)}

      </main>
    </div>
  )
}
