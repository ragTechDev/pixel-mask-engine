import type { IconParts } from "../parts";
import { iconRamps } from "../ramps";
import { heartMask } from "./heart.mask";

export const socialIcons = {
    heart: [{ shaded: heartMask, ramp: iconRamps.heart, x: 0, y: 0 }],
    heart_empty: [{ shaded: heartMask, ramp: iconRamps.cream_soft, x: 0, y: 0 }]
} as const satisfies IconParts;
