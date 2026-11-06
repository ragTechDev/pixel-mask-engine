import { useState } from "react"
import { Avatar, PixelImage, Tile } from "../../src/react"
import { avatarKey, buildAvatar, buildMap, buildTile, createCache, defineMap, houseTileset, tileIds, toSvgDataUrl, townTileset, type Raster, type AvatarConfig, type TileId } from "../../src"

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
  tree:           "Tree",
  fence:          "Fence",
  flower:         "Flowers",
  wall:           "Wall",
  floor:          "Floor",
  door:           "Door",
  window:         "Window",
  counter:        "Counter",
  rug:            "Rug",
  bookshelf:      "Bookshelf",
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
  tree:           "Solid tree (draft)",
  fence:          "Solid fence run (draft)",
  flower:         "Grass with flowers (draft)",
  wall:           "Stone wall, solid (draft)",
  floor:          "Wood plank floor (draft)",
  door:           "Door, acts as a warp (draft)",
  window:         "Wall with a window (draft)",
  counter:        "Shop counter, interact across it (draft)",
  rug:            "Patterned rug (draft)",
  bookshelf:      "Solid bookshelf (draft)",
}

// ─── Demo worlds ─────────────────────────────────────────────────────────────
// One character per block. Each block is 2×2 tiles, so these maps are tiny.
const TOWN_MAP = defineMap(townTileset, [
  "TTTTTTTTTT",
  "TggFggGGgT",
  "ThhhWhggfT",
  "ThhhdhggfT",
  "TgpppppgGT",
  "TFgpggggGT",
  "TggpgwwwwT",
  "TggpgssssT",
])
const HOUSE_MAP = defineMap(houseTileset, [
  "hhWhhWhh",
  "bbffffbb",
  "ffrrrrff",
  "ccccffff",
  "ffffffff",
  "hhhdhhhh",
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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cfg, setCfg]   = useState<AvatarProps>(DEFAULT)
  const [tile, setTile] = useState<TileId>("brick_pavement")
  const [tab, setTab]   = useState<Tab>("Skin")

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

        {/* ── Center: Preview ──────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Avatar and tile windows: same frame size, same pixel scale */}
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

            <PreviewWindow label="TILE" name={TILE_LABELS[tile].toUpperCase()} size="16×16 PX">
              <TileBackground tileId={tile} />
            </PreviewWindow>

            <PreviewWindow label="WORLD" name="TOWN + HOUSE" size="BLOCKS 2×2">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", padding: 12 }}>
                <PixelImage raster={TOWN_RASTER} pixelSize={2} title="Town demo map" />
                <PixelImage raster={HOUSE_RASTER} pixelSize={2} title="House demo map" />
              </div>
            </PreviewWindow>
          </div>
        </div>

        {/* ── Right: Tile Selector ──────────────────────────────────────── */}
        <Panel style={{ width: 210, flexShrink: 0 }}>
          <div style={{
            fontSize:      13,
            color:         C.accent,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            fontWeight:    700,
            marginBottom:  16,
          }}>
            Tile World
          </div>

          {/* Compact tile grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {TILE_IDS.map(id => {
              const selected = tile === id
              return (
                <button
                  key={id}
                  onClick={() => setTile(id)}
                  aria-pressed={selected}
                  title={TILE_LABELS[id]}
                  style={{
                    background:    selected ? C.active : C.btn,
                    border:        `2px solid ${selected ? C.activeBorder : C.border}`,
                    boxShadow:     selected ? pixelBorderActive() : `2px 2px 0 ${INK}`,
                    padding:       4,
                    cursor:        "pointer",
                    display:       "flex",
                    flexDirection: "column",
                    alignItems:    "center",
                    gap:           4,
                    fontFamily:    FONT,
                  }}
                >
                  <Tile id={id} pixelSize={3} />
                  <span style={{
                    color: selected ? C.white : C.muted, fontSize: 9,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                    {TILE_LABELS[id]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Info box */}
          <div style={{
            marginTop:  16,
            background: C.section,
            border:     `2px solid ${C.border}`,
            padding:    10,
          }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>
              SELECTED
            </div>
            <div style={{ color: C.text, fontSize: 13, letterSpacing: "0.08em", marginBottom: 4 }}>
              {TILE_LABELS[tile].toUpperCase()}
            </div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              {TILE_DESC[tile]}
            </div>
          </div>
        </Panel>

      </main>
    </div>
  )
}
