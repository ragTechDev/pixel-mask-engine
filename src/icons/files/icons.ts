import type { IconParts } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { bookmarkMask } from "./bookmark.mask";
import { noteMask } from "./note-ribbon/note.mask";
import { ribbonBand } from "./note-ribbon/ribbonBand.mask";
import { ribbonKnot } from "./note-ribbon/ribbonKnot.mask";
import { noteLines } from "./pinned-note/noteLines.mask";
import { pinMask } from "./pinned-note/pin.mask";
import { pinnedNote } from "./pinned-note/pinnedNote.mask";

export const filesIcons = {
    note_ribbon: [
        { shaded: noteMask, ramp: iconRamps.cream, x: 0, y: 0 },
        { flat: ribbonBand, color: iconInk.seal, x: 0, y: 4 },
        { shaded: ribbonKnot, ramp: iconRamps.heart, x: 4, y: 3 }
    ],
    bookmark: [{ shaded: bookmarkMask, ramp: iconRamps.coral, x: 0, y: 0 }],
    bookmark_idle: [{ shaded: bookmarkMask, ramp: iconRamps.cream_soft, x: 0, y: 0 }],
    pinned_note: [
        { shaded: pinnedNote, ramp: iconRamps.cream, x: 0, y: 1 },
        { flat: noteLines, color: iconInk.flap, x: 1, y: 4 },
        { shaded: pinMask, ramp: iconRamps.heart, x: 4, y: 0 }
    ]
} as const satisfies IconParts;
