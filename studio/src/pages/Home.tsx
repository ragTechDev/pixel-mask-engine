import { Avatar, Icon, Tile, World, WorldObject } from "../../../src/react";
import { iconIds, objectIds, tileIds } from "../../../src";
import { useWidth } from "../hooks";
import { href, type Route } from "../router";
import { miniTown } from "../worlds";

const cards = [
    { to: "icons", title: "Icons", count: iconIds.length, text: "Shaded, coloured icons in lucide-style categories." },
    { to: "tiles", title: "Tiles", count: tileIds.length, text: "Terrain and nine-patch edges, with palettes." },
    { to: "objects", title: "Objects", count: objectIds.length, text: "Trees, doors and furniture, with footprints." },
    { to: "avatars", title: "Avatars", count: undefined, text: "Mix hair, skin, clothes and poses." },
    { to: "worlds", title: "Worlds", count: undefined, text: "Whole maps, recoloured by palette." },
    { to: "docs", title: "Docs", count: undefined, text: "Install, use in React, CSS or canvas." }
] as const;

// The hero art is three avatars (16 art pixels wide) and a tree (16), with a gap between each.
const HERO_ART_PX = 4 * 16;
const HERO_GAP = 12;

export function HomePage({ route }: { route: Route }) {
    const [hero, heroWidth] = useWidth<HTMLElement>();
    // Biggest whole pixel size that fits the panel, so the row never overflows on a narrow screen.
    const px = heroWidth ? Math.max(1, Math.min(5, Math.floor((heroWidth - 3 * HERO_GAP) / HERO_ART_PX))) : 5;
    return (
        <div className="stack" style={{ gap: 24 }}>
            <section ref={hero} className="panel hero">
                <div className="stack" style={{ maxWidth: 560 }}>
                    <h1>Pixel Mask Studio</h1>
                    <p>Browse every icon, tile, object and avatar in ragTech's Pixel Mask Library. Preview them at 8x8 or 16x16 and in 1 or 2-bit colour, then copy the code.</p>
                    <div className="row">
                        <a className="btn primary" href={href(["icons"], route)}>Browse icons</a>
                        <a className="btn" href={href(["docs"], route)}>Read the docs</a>
                    </div>
                </div>
                <div className="hero-art" aria-hidden>
                    <Avatar pixelSize={px} />
                    <Avatar pixelSize={px} skinTone="brown" hairColor="black" topStyle="longSleeve" clothesColor="red" backHairStyle="highPigtails" />
                    <Avatar pixelSize={px} skinTone="medium" hairColor="blonde" topStyle="dress" clothesColor="green" frontHairStyle="bangs" />
                    <WorldObject id="tree" pixelSize={px} />
                </div>
            </section>
            <section className="cards">
                {cards.map((c) => (
                    <a key={c.to} className="panel card" href={href([c.to], route)}>
                        <div className="strip" aria-hidden>
                            {c.to === "icons" && (["heart", "cottage", "quill", "mailbox"] as const).map((id) => <Icon key={id} id={id} pixelSize={3} />)}
                            {c.to === "tiles" && (["grass", "water", "path", "roof"] as const).map((id) => <Tile key={id} id={id} pixelSize={3} />)}
                            {c.to === "objects" && (["tree", "door", "bookshelf", "flower"] as const).map((id) => <WorldObject key={id} id={id} pixelSize={2} />)}
                            {c.to === "avatars" && <Avatar pixelSize={2} skinTone="medium" hairColor="black" />}
                            {c.to === "worlds" && <World map={miniTown} pixelSize={1} />}
                            {c.to === "docs" && <Icon id="notice_board" pixelSize={3} />}
                        </div>
                        <div className="h">{c.title}{c.count ? ` (${c.count})` : ""}</div>
                        <p className="muted">{c.text}</p>
                    </a>
                ))}
            </section>
        </div>
    );
}
