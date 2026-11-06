import { useState } from "react"
import { Avatar, Tile } from "../../src/react"
import { buildTile, toSvgDataUrl, type AvatarConfig, type TileId } from "../../src"

type AvatarProps = AvatarConfig

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:           "#0a0a1a",
  panel:        "#12122a",
  section:      "#1a1a3a",
  border:       "#3a3a6a",
  active:       "#4c1d95",
  activeBorder: "#7c3aed",
  activeGlow:   "#7c3aed44",
  btn:          "#1e1e40",
  text:         "#e2e8f0",
  muted:        "#64748b",
  accent:       "#a78bfa",
  accentDim:    "#6d5fa0",
  white:        "#ffffff",
}

const FONT = "'Pixelify Sans', monospace"

const pixelBorderActive = () =>
  `3px 3px 0 0 #000, inset 0 0 0 2px ${C.activeBorder}, 0 0 12px ${C.activeGlow}`

// ─── OptionGroup ─────────────────────────────────────────────────────────────
function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  options: readonly T[] | T[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div style={{ marginBottom: 14, opacity: disabled ? 0.35 : 1 }}>
      <div style={{
        color:         C.accentDim,
        fontSize:      11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom:  6,
        fontFamily:    FONT,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {options.map(opt => {
          const active = opt === value
          return (
            <button
              key={opt}
              onClick={() => !disabled && onChange(opt)}
              style={{
                background:     active ? C.active : C.btn,
                color:          active ? C.white  : C.text,
                border:         `2px solid ${active ? C.activeBorder : C.border}`,
                fontFamily:     FONT,
                fontSize:       12,
                padding:        "4px 10px",
                cursor:         disabled ? "not-allowed" : "pointer",
                boxShadow:      active ? pixelBorderActive() : "2px 2px 0 #000",
                lineHeight:     1.4,
                transition:     "background 0.08s, border-color 0.08s",
                imageRendering: "pixelated",
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: string }) {
  return (
    <div style={{
      color:         C.accent,
      fontFamily:    FONT,
      fontSize:      13,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      borderBottom:  `2px solid ${C.border}`,
      paddingBottom: 6,
      marginBottom:  12,
      marginTop:     18,
    }}>
      ▶ {children}
    </div>
  )
}

// ─── Panel wrapper ───────────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.panel,
      border:     `2px solid ${C.border}`,
      boxShadow:  "4px 4px 0 #000",
      padding:    16,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Tile data ───────────────────────────────────────────────────────────────
const TILE_IDS: TileId[] = ["road", "beige_pavement", "brick_pavement"]
const TILE_LABELS: Record<TileId, string> = {
  road:           "Road",
  beige_pavement: "Pavement",
  brick_pavement: "Brick",
}
const TILE_DESC: Record<TileId, string> = {
  road:           "Asphalt with white lane markings",
  beige_pavement: "Flagstone running-bond + grout",
  brick_pavement: "Brick running-bond + mortar",
}

// ─── TileCard ────────────────────────────────────────────────────────────────
function TileCard({ id, selected, onSelect }: { id: TileId; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background:     "transparent",
        border:         `3px solid ${selected ? C.activeBorder : C.border}`,
        boxShadow:      selected ? pixelBorderActive() : "3px 3px 0 #000",
        padding:        8,
        cursor:         "pointer",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            8,
        width:          "100%",
        transition:     "border-color 0.08s",
      }}
    >
      {/* 2×2 tile preview grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        imageRendering:      "pixelated",
        outline:             `2px solid ${selected ? C.activeBorder : C.border}`,
        lineHeight:          0,
      }}>
        {[0, 1, 2, 3].map(i => (
          <Tile key={i} id={id} pixelSize={4} />
        ))}
      </div>
      <span style={{
        fontFamily:    FONT,
        fontSize:      12,
        color:         selected ? C.white : C.muted,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}>
        {TILE_LABELS[id]}
      </span>
    </button>
  )
}


// ─── Tiled background ────────────────────────────────────────────────────────
// Uses a CSS background-image data-URL so the repeat covers any container
// size with perfect seams and zero extra React nodes.
function TileBackground({ tileId }: { tileId: TileId }) {
  // Avatar renders at PIXEL_SIZE=4 then is CSS-scaled 4×, so each game pixel
  // is 16 CSS px. Tiles must use the same value to stay proportional.
  const pixelSize = 16
  const tileSize  = 16 * pixelSize  // 256 px per tile
  const dataUrl   = toSvgDataUrl(buildTile(tileId), pixelSize)
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

  const set = <K extends keyof AvatarProps>(k: K) =>
    (v: AvatarProps[K]) => setCfg(prev => ({ ...prev, [k]: v }))

  const usingFullOutfit = cfg.fullOutfitStyle !== "none"

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
        boxShadow:    "0 3px 0 #000",
        padding:      "12px 24px",
        display:      "flex",
        alignItems:   "center",
        gap:          14,
        background:   C.panel,
      }}>
        <div style={{ width: 20, height: 20, background: C.accent, boxShadow: "2px 2px 0 #000" }} />
        <h1 style={{
          fontSize:      18,
          color:         C.white,
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
          width:     278,
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

          <SectionHeader>Appearance</SectionHeader>
          <OptionGroup
            label="Skin Tone"
            options={["light", "medium", "brown"] as const}
            value={cfg.skinTone!}
            onChange={set("skinTone")}
          />
          <OptionGroup
            label="Eye Color"
            options={["dark", "green", "blue"] as const}
            value={cfg.eyeColor!}
            onChange={set("eyeColor")}
          />
          <OptionGroup
            label="Orientation"
            options={["front", "left", "right", "back"] as const}
            value={cfg.headOrientation!}
            onChange={set("headOrientation")}
          />

          <SectionHeader>Hair</SectionHeader>
          <OptionGroup
            label="Color"
            options={["brown", "black", "blonde"] as const}
            value={cfg.hairColor!}
            onChange={set("hairColor")}
          />
          <OptionGroup
            label="Front"
            options={["centerPart", "bangs", "sideSwept"] as const}
            value={cfg.frontHairStyle!}
            onChange={set("frontHairStyle")}
          />
          <OptionGroup
            label="Back"
            options={["lowPonytail", "highPonytail", "doubleLowPonytail", "doubleHighPonytail", "shortCropped"] as const}
            value={cfg.backHairStyle!}
            onChange={set("backHairStyle")}
          />

          <SectionHeader>Clothes</SectionHeader>
          <OptionGroup
            label="Color"
            options={["blue", "red", "green"] as const}
            value={cfg.clothesColor!}
            onChange={set("clothesColor")}
          />
          <OptionGroup
            label="Full Outfit"
            options={["none", "overalls", "dress"] as const}
            value={cfg.fullOutfitStyle!}
            onChange={set("fullOutfitStyle")}
          />
          <OptionGroup
            label="Top"
            options={["none", "spaghetti", "shirt", "longSleeve"] as const}
            value={cfg.topStyle!}
            onChange={set("topStyle")}
            disabled={usingFullOutfit}
          />
          <OptionGroup
            label="Bottom"
            options={["none", "shorts", "skirt"] as const}
            value={cfg.bottomStyle!}
            onChange={set("bottomStyle")}
            disabled={usingFullOutfit}
          />
          <OptionGroup
            label="Shoes"
            options={["none", "boots", "sandals", "shoes"] as const}
            value={cfg.shoeStyle!}
            onChange={set("shoeStyle")}
          />

          <SectionHeader>Pose</SectionHeader>
          <OptionGroup
            label="Arm"
            options={["down", "forward", "back"] as const}
            value={cfg.armPose!}
            onChange={set("armPose")}
          />
          <OptionGroup
            label="Leg"
            options={["neutral", "step"] as const}
            value={cfg.legPose!}
            onChange={set("legPose")}
          />

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
              boxShadow:     "2px 2px 0 #000",
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

          <Panel style={{ padding: 0, overflow: "hidden" }}>
            {/* Tile bg + avatar */}
            <div style={{
              position:    "relative",
              width:       "100%",
              aspectRatio: "3 / 4",
              minHeight:   340,
              overflow:    "hidden",
            }}>
              <TileBackground tileId={tile} />
              <div style={{
                position:       "absolute",
                inset:          0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "flex-start",
                paddingLeft:    100,
              }}>
                <div style={{
                  transform:       "scale(4)",
                  transformOrigin: "center center",
                  imageRendering:  "pixelated",
                  filter:          "drop-shadow(0 2px 0 rgba(0,0,0,0.9))",
                }}>
                  <Avatar {...cfg} />
                </div>
              </div>
            </div>

            {/* Surface label */}
            <div style={{
              background:  C.section,
              borderTop:   `2px solid ${C.border}`,
              padding:     "8px 14px",
              display:     "flex",
              alignItems:  "center",
              gap:         10,
            }}>
              <span style={{ color: C.muted, fontSize: 10, letterSpacing: "0.15em" }}>SURFACE</span>
              <span style={{ color: C.accent, fontSize: 13, letterSpacing: "0.12em" }}>
                {TILE_LABELS[tile].toUpperCase()}
              </span>
              <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10 }}>16×16 PX</span>
            </div>
          </Panel>

          {/* Quick tile switcher strip */}
          <div style={{ display: "flex", gap: 8 }}>
            {TILE_IDS.map(id => (
              <button
                key={id}
                onClick={() => setTile(id)}
                style={{
                  flex:          1,
                  background:    tile === id ? C.active : C.btn,
                  color:         tile === id ? C.white  : C.muted,
                  border:        `2px solid ${tile === id ? C.activeBorder : C.border}`,
                  fontFamily:    FONT,
                  fontSize:      11,
                  padding:       "6px 0",
                  cursor:        "pointer",
                  boxShadow:     tile === id ? pixelBorderActive() : "2px 2px 0 #000",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {TILE_LABELS[id]}
              </button>
            ))}
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

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TILE_IDS.map(id => (
              <TileCard
                key={id}
                id={id}
                selected={tile === id}
                onSelect={() => setTile(id)}
              />
            ))}
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
            <div style={{ color: C.white, fontSize: 13, letterSpacing: "0.08em", marginBottom: 4 }}>
              {TILE_LABELS[tile].toUpperCase()}
            </div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              {TILE_DESC[tile]}
            </div>
          </div>

          {/* Mini atlas */}
          <div style={{ marginTop: 14 }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.15em", marginBottom: 8 }}>
              ATLAS
            </div>
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 4,
              imageRendering:      "pixelated",
            }}>
              {TILE_IDS.map(id => (
                <div
                  key={id}
                  onClick={() => setTile(id)}
                  style={{
                    outline:  `2px solid ${id === tile ? C.activeBorder : C.border}`,
                    cursor:   "pointer",
                    overflow: "hidden",
                    lineHeight: 0,
                  }}
                >
                  <Tile id={id} pixelSize={3} />
                </div>
              ))}
            </div>
          </div>
        </Panel>

      </main>
    </div>
  )
}
