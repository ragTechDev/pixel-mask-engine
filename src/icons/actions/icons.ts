import type { IconParts } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { sheetLines, sheetMask } from "./copy.mask";
import { dicePips, diceMask } from "./dice.mask";
import { resetMask } from "./reset.mask";
import { saveLabel, saveMask, saveShutter } from "./save.mask";

export const actionsIcons = {
    dice: [
        { shaded: diceMask, ramp: iconRamps.cream, x: 0, y: 0 },
        { flat: dicePips, color: iconInk.eye, x: 2, y: 3 }
    ],
    reset: [
        { shaded: resetMask, ramp: iconRamps.ink_blue, x: 0, y: 0 }
    ],
    save: [
        { shaded: saveMask, ramp: iconRamps.mailbox, x: 0, y: 0 },
        { flat: saveShutter, color: iconInk.flap, x: 3, y: 1 },
        { flat: saveLabel, color: iconRamps.cream.base, x: 3, y: 7 }
    ],
    copy: [
        { shaded: sheetMask, ramp: iconRamps.dove_wing, x: 0, y: 0 },
        { shaded: sheetMask, ramp: iconRamps.dove, x: 4, y: 3 },
        { flat: sheetLines, color: iconInk.legs, x: 6, y: 6 }
    ]
} as const satisfies IconParts;
