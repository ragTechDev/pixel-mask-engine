import type { IconId, ObjectId, TileId } from "../../src";

/** Words people might search for, per item. Typed as a full record so a new icon or object has to get some. */
export const iconKeywords: Record<IconId, string> = {
    cog: "settings preferences options gear config configuration cogwheel",
    cottage: "house home building cabin",
    cottage_row: "houses homes street terrace village town buildings",
    comment: "chat message speech bubble talk reply",
    bird_letter: "mail message carrier pigeon post delivery send",
    bird_perch: "mail message waiting pigeon post inbox",
    winged_letter: "mail message flying fast email send delivery",
    envelope: "mail email letter message inbox post",
    mailbox: "mail inbox post letters messages box",
    quill: "write writing pen edit compose feather draft ink",
    note_ribbon: "note award label tag memo ribbon",
    bookmark: "save saved favourite favorite later flag",
    pinned_note: "pin pinned note memo sticky important",
    basket: "shop shopping cart gather food picnic wicker",
    jar: "preserves food storage container jam pot",
    willage_map: "map location navigate directions town village world",
    notice_board: "board announcements bulletin posts pinboard news",
    dice: "random surprise shuffle randomise randomize chance game luck roll",
    reset: "undo revert restore default back refresh again clear",
    save: "floppy disk download store export write",
    copy: "duplicate clipboard paste clone documents",
    heart: "like love favourite favorite care health",
    heart_empty: "unlike love favourite favorite outline"
};

export const objectKeywords: Record<ObjectId, string> = {
    tree: "plant forest nature wood leaves",
    fence: "barrier gate border boundary wall",
    door: "entrance exit entry warp enter",
    window: "glass pane house building",
    counter: "shop desk bar stall table store",
    bookshelf: "books library shelf furniture reading",
    rug: "carpet mat floor decoration",
    flower: "flowers plant garden petals nature bloom"
};

const tileBase: Record<string, string> = {
    road: "street asphalt tarmac",
    beige_pavement: "sidewalk footpath paving stone",
    brick_pavement: "sidewalk footpath paving cobble bricks",
    grass: "lawn field green meadow",
    tall_grass: "long grass meadow wild bush",
    path: "trail dirt track walkway",
    water: "river lake pond sea blue",
    wall: "building house brick",
    floor: "indoor room boards tiles",
    sky: "air clouds backdrop background",
    roof: "building house shingles tiles top",
    shore: "beach coast edge bank water sand"
};

const edgeParts = new Set(["top", "bottom", "left", "right"]);

/** Edge and corner tiles inherit their family's words (roof_top_left is a roof). */
export function tileKeywords(id: TileId): string {
    const family = Object.keys(tileBase)
        .filter((base) => id === base || id.startsWith(`${base}_`))
        .sort((a, b) => b.length - a.length)[0];
    const edge = id.split("_").some((part) => edgeParts.has(part)) ? "edge border corner" : "";
    return `${family ? tileBase[family] : ""} ${edge}`.trim();
}
