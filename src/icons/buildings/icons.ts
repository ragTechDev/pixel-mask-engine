import { navIcon, type IconParts } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { rowBush } from "./cottage-row/bush.mask";
import { rowBushLight } from "./cottage-row/bushLight.mask";
import { rowBushShade } from "./cottage-row/bushShade.mask";
import { rowDoor } from "./cottage-row/door.mask";
import { rowMidRoof } from "./cottage-row/midRoof.mask";
import { rowMidWalls } from "./cottage-row/midWalls.mask";
import { rowSideRoof } from "./cottage-row/sideRoof.mask";
import { rowSideWalls } from "./cottage-row/sideWalls.mask";
import { cottageChimney } from "./cottage/chimney.mask";
import { cottageDoor } from "./cottage/door.mask";
import { cottageRoof } from "./cottage/roof.mask";
import { cottageWalls } from "./cottage/walls.mask";
import { cottageWindow } from "./cottage/window.mask";

const cottage = [
    { mask: cottageChimney, ramp: iconRamps.brick, tone: "dark", x: 9, y: 0 },
    { mask: cottageRoof, ramp: iconRamps.roof, tone: "dark", x: 0, y: 1 },
    { mask: cottageWalls, ramp: iconRamps.cream, tone: "light", x: 1, y: 7 },
    { mask: cottageDoor, ramp: iconRamps.wicker, tone: "dark", x: 3, y: 8 },
    { mask: cottageWindow, ramp: iconRamps.glass, tone: "dark", x: 9, y: 8 }
] as const;

const cottageRow = [
    { mask: rowMidWalls, ramp: iconRamps.cream, tone: "light", x: 4, y: 6 },
    { mask: rowMidRoof, ramp: iconRamps.mailbox, tone: "dark", x: 4, y: 3 },
    { mask: rowSideWalls, ramp: iconRamps.cream, tone: "light", x: 0, y: 7 },
    { mask: rowSideRoof, ramp: iconRamps.roof, tone: "dark", x: 0, y: 5 },
    { mask: rowSideWalls, ramp: iconRamps.cream, tone: "light", x: 10, y: 7 },
    { mask: rowSideRoof, ramp: iconRamps.coral, tone: "dark", x: 10, y: 5 },
    { flat: rowDoor, color: iconInk.dark, x: 1, y: 9 },
    { flat: rowDoor, color: iconInk.dark, x: 11, y: 9 },
    { flat: rowDoor, color: iconInk.dark, x: 7, y: 9 },
    { flat: rowBush, color: iconRamps.grass.base, x: 3, y: 9 },
    { flat: rowBushShade, color: iconRamps.grass.shadow, x: 3, y: 9 },
    { flat: rowBushLight, color: iconRamps.grass.highlight, x: 3, y: 9 },
    { flat: rowBush, color: iconRamps.grass.base, x: 8, y: 9 },
    { flat: rowBushShade, color: iconRamps.grass.shadow, x: 8, y: 9 },
    { flat: rowBushLight, color: iconRamps.grass.highlight, x: 8, y: 9 }
] as const;

export const buildingsIcons = {
    cottage: navIcon(cottage, true),
    cottage_idle: navIcon(cottage, false),
    cottage_row: navIcon(cottageRow, true),
    cottage_row_idle: navIcon(cottageRow, false)
} as const satisfies IconParts;
