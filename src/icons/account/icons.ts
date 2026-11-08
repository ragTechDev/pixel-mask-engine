import { navIcon, type IconParts } from "../parts";
import { iconRamps } from "../ramps";
import { cogMask } from "./cog.mask";

const cog = [{ mask: cogMask, ramp: iconRamps.wicker, tone: "dark", x: 0, y: 0 }] as const;

export const accountIcons = {
    cog: navIcon(cog, true),
    cog_idle: navIcon(cog, false)
} as const satisfies IconParts;
