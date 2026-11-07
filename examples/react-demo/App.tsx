import { useState } from "react"
import { Avatar, PixelImage, Tile } from "../../src/react"
import { avatarKey, buildAvatar, buildMap, buildObject, createCache, defineMap, houseTileset, iconIds, iconSvg, objectIds, tileIds, tileThemes, townTileset, type Raster, type AvatarConfig, type ObjectId, type PlacedObject, type TileId, type TileTheme } from "../../src"

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
  road:                       "Road",
  beige_pavement:             "Pavement",
  brick_pavement:             "Brick",
  grass:                      "Grass",
  tall_grass:                 "Tall grass",
  path:                       "Path",
  water:                      "Water",
  shore:                      "Shore",
  wall:                       "Wall",
  floor:                      "Floor",
  roof_top_left:              "Roof ridge L",
  roof_top:                   "Roof ridge",
  roof_top_right:             "Roof ridge R",
  roof_left:                  "Roof left",
  roof:                       "Roof",
  roof_right:                 "Roof right",
  roof_bottom_left:           "Roof eave L",
  roof_bottom:                "Roof eave",
  roof_bottom_right:          "Roof eave R",
  beige_pavement_top_left:    "Pave top L",
  beige_pavement_top:         "Pave top",
  beige_pavement_top_right:   "Pave top R",
  beige_pavement_left:        "Pave left",
  beige_pavement_right:       "Pave right",
  beige_pavement_bottom_left: "Pave bottom L",
  beige_pavement_bottom:      "Pave bottom",
  beige_pavement_bottom_right:"Pave bottom R",
  wall_left:                  "Wall left",
  wall_right:                 "Wall right",
  wall_base:                  "Wall base",
  wall_base_left:             "Wall base L",
  wall_base_right:            "Wall base R",
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
  "gg<==>gggg",   // roof: ridge over eave
  "gg[__]gggg",   // wall with its foundation row
  "gggpggggtt",
  "gggpgABCgt",   // pavement patch: edges and corners around a centre
  "gggpgDEFgt",
  "gggpgGHIgt",
  "gggpsssssg",
  "gggpwwwwwg",
], [
  ...at("tree", [0, 0], [2, 0], [17, 0], [19, 0], [1, 8], [16, 10]),
  ...at("window", [5, 4], [10, 4]),
  ...at("door", [7, 5]),
  ...at("fence", [10, 6], [11, 6], [12, 6], [13, 6]),
  ...at("flower", [2, 7], [3, 10], [4, 13], [18, 2]),
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

// Screen pixels per art pixel in the avatar preview window.
const SCALE = 8
const VIEW_PX = 32 * SCALE

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
const MAPS = { Town: TOWN_MAP, House: HOUSE_MAP } as const
type MapName = keyof typeof MAPS
// Screen pixels per art pixel: tiles are 64 px, objects up to 128 px in the picker; maps use 3.
const PICK_SCALE  = 4
const WORLD_SCALE = 3

const sectionTitle: React.CSSProperties = {
  fontSize: 13, color: C.accent, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700,
}

function PickerCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      title={label}
      style={{
        background:     C.btn,
        border:         `2px solid ${C.border}`,
        boxShadow:      `2px 2px 0 ${INK}`,
        padding:        8,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "flex-end",
        gap:            6,
      }}
    >
      {children}
      <span style={{ color: C.muted, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  )
}

function WorldView() {
  const [mapName, setMapName] = useState<MapName>("Town")
  const [theme, setTheme]     = useState<TileTheme>("default")
  const raster = buildMap(MAPS[mapName], theme)

  return (
    <>
      {/* ── Left: terrain and object picker ───────────────────────────── */}
      <Panel style={{ width: 380, flexShrink: 0, overflowY: "auto", maxHeight: "calc(100vh - 76px)" }}>
        <div style={{ ...sectionTitle, marginBottom: 12 }}>Palette</div>
        <div role="tablist" style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {tileThemes.map(name => (
            <TabButton key={name} active={name === theme} onClick={() => setTheme(name)}>{name}</TabButton>
          ))}
        </div>

        <div style={{ ...sectionTitle, marginBottom: 12 }}>Terrain</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TILE_IDS.map(id => (
            <PickerCell key={id} label={TILE_LABELS[id]}>
              <Tile id={id} theme={theme} pixelSize={PICK_SCALE} />
            </PickerCell>
          ))}
        </div>

        <div style={{ ...sectionTitle, margin: "20px 0 12px" }}>Objects</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {objectIds.map(id => (
            <PickerCell key={id} label={OBJECT_LABELS[id]}>
              <PixelImage raster={buildObject(id)} pixelSize={PICK_SCALE} title={OBJECT_LABELS[id]} />
            </PickerCell>
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

      </div>
    </>
  )
}

// ─── Icons view ──────────────────────────────────────────────────────────────
const ICON_SCALES = [2, 4, 8] as const

function IconsView() {
  return (
    <Panel style={{ maxWidth: 760 }}>
      <div style={{ ...sectionTitle, marginBottom: 6 }}>Icons</div>
      <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px", lineHeight: 1.6 }}>
        One colour each, taken from the surrounding text colour (<code>fill="currentColor"</code>). Shown at 2, 4 and 8 screen pixels per icon pixel.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {iconIds.map((id) => (
          <PickerCell key={id} label={id.replace("_", " ")}>
            {ICON_SCALES.map((scale) => (
              <span
                key={scale}
                style={{ color: C.text, lineHeight: 0 }}
                dangerouslySetInnerHTML={{ __html: iconSvg(id, scale) }}
              />
            ))}
            <span style={{ color: C.active, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: iconSvg(id, 4) }} />
          </PickerCell>
        ))}
      </div>
    </Panel>
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
  const [view, setView] = useState<"avatar" | "world" | "icons">("avatar")

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
          <TabButton active={view === "icons"} onClick={() => setView("icons")}>Icons</TabButton>
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

        {view === "world" ? <WorldView /> : view === "icons" ? <IconsView /> : (<>
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
