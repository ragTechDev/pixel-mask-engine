import { dot, navIcon, type IconParts } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { boardMask } from "./notice-board/board.mask";
import { boardNoteA } from "./notice-board/noteA.mask";
import { boardNoteB } from "./notice-board/noteB.mask";
import { boardNoteLines } from "./notice-board/noteLines.mask";
import { boardPost } from "./notice-board/post.mask";
import { mapHill } from "./willage-map/hill.mask";
import { mapHouseRoof } from "./willage-map/houseRoof.mask";
import { mapHouseWall } from "./willage-map/houseWall.mask";
import { mapPaper } from "./willage-map/paper.mask";
import { mapPath } from "./willage-map/path.mask";
import { mapRiver } from "./willage-map/river.mask";

const willageMap = [
    { mask: mapPaper, ramp: iconRamps.map_paper, tone: "light", x: 0, y: 0 },
    { mask: mapHill, ramp: iconRamps.grass, tone: "dark", x: 1, y: 6 },
    { flat: mapRiver, color: iconInk.river, x: 0, y: 2 },
    { mask: mapHouseRoof, ramp: iconRamps.roof, tone: "dark", x: 8, y: 1 },
    { mask: mapHouseWall, ramp: iconRamps.cream, tone: "light", x: 8, y: 3 },
    { flat: mapPath, color: iconInk.path, x: 3, y: 7 }
] as const;

const noticeBoard = [
    { mask: boardPost, ramp: iconRamps.wicker, tone: "dark", x: 2, y: 8 },
    { mask: boardPost, ramp: iconRamps.wicker, tone: "dark", x: 10, y: 8 },
    { mask: boardMask, ramp: iconRamps.wicker, tone: "dark", x: 0, y: 0 },
    { mask: boardNoteA, ramp: iconRamps.cream, tone: "light", x: 2, y: 2 },
    { mask: boardNoteB, ramp: iconRamps.cream, tone: "light", x: 8, y: 2 },
    { flat: boardNoteLines, color: iconInk.flap, x: 2, y: 3 },
    { flat: dot, color: iconInk.seal, x: 3, y: 2 },
    { flat: dot, color: iconInk.seal, x: 9, y: 2 }
] as const;

export const navigationIcons = {
    willage_map: navIcon(willageMap, true),
    willage_map_idle: navIcon(willageMap, false),
    notice_board: navIcon(noticeBoard, true),
    notice_board_idle: navIcon(noticeBoard, false)
} as const satisfies IconParts;
