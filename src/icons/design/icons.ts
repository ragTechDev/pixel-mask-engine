import { iconInk, iconRamps } from "../ramps";
import { navIcon, type IconParts } from "../parts";
import { quillFeather } from "./quill/feather.mask";
import { quillInkPot } from "./quill/inkPot.mask";
import { quillShaft } from "./quill/shaft.mask";

const quill = [
    { mask: quillFeather, ramp: iconRamps.dove, tone: "light", x: 0, y: 0 },
    { flat: quillShaft, color: iconInk.legs, x: 0, y: 0 },
    { mask: quillInkPot, ramp: iconRamps.ink_blue, tone: "dark", x: 8, y: 9 }
] as const;

export const designIcons = {
    quill: navIcon(quill, true),
    quill_idle: navIcon(quill, false)
} as const satisfies IconParts;
