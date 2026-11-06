import type { PixelMask } from "../../core/maskUtils";
import { bookshelfBooksMask } from "../masks/objects/bookshelf/books.mask";
import { bookshelfFrameMask } from "../masks/objects/bookshelf/frame.mask";
import { counterBodyMask } from "../masks/objects/counter/body.mask";
import { counterTopMask } from "../masks/objects/counter/top.mask";
import { doorKnobMask } from "../masks/objects/door/knob.mask";
import { doorPanelMask } from "../masks/objects/door/panel.mask";
import { fencePostsMask } from "../masks/objects/fence/posts.mask";
import { fenceRailsMask } from "../masks/objects/fence/rails.mask";
import { flowerMask } from "../masks/objects/flower.mask";
import { rugClothMask } from "../masks/objects/rug/cloth.mask";
import { rugRingMask } from "../masks/objects/rug/ring.mask";
import { treeCanopyMask } from "../masks/objects/tree/canopy.mask";
import { treeTrunkMask } from "../masks/objects/tree/trunk.mask";
import { windowFrameMask } from "../masks/objects/window/frame.mask";
import { windowGlassMask } from "../masks/objects/window/glass.mask";
import type { ObjectId } from "../types";
import type { ObjectRampId } from "./ramps";

/**
 * One mask of an object, drawn with a fixed ramp. `x` and `y` are the pixel
 * position of the mask's top-left corner inside the object's tile box (16 px
 * per tile). The outline adds one pixel around each part.
 */
export interface ObjectPart {
    readonly mask: PixelMask;
    readonly ramp: ObjectRampId;
    readonly x: number;
    readonly y: number;
}

/** Parts are drawn in order, later parts on top. */
export const objectParts: Record<ObjectId, readonly ObjectPart[]> = {
    // 1×2 tiles (16×32). Trunk first, canopy over it.
    tree: [
        { mask: treeTrunkMask, ramp: "bark", x: 5, y: 14 },
        { mask: treeCanopyMask, ramp: "leaf", x: 1, y: 1 }
    ],
    // 1×1 tile. Two posts with two rails across them.
    fence: [
        { mask: fencePostsMask, ramp: "wood", x: 1, y: 2 },
        { mask: fenceRailsMask, ramp: "wood", x: 1, y: 4 }
    ],
    // 1×1 tile. A door with a knob, meant to sit in a wall.
    door: [
        { mask: doorPanelMask, ramp: "wood", x: 2, y: 1 },
        { mask: doorKnobMask, ramp: "gold", x: 10, y: 8 }
    ],
    // 1×1 tile. A frame with a pane of glass, meant to sit in a wall.
    window: [
        { mask: windowFrameMask, ramp: "wood", x: 2, y: 3 },
        { mask: windowGlassMask, ramp: "glass", x: 4, y: 5 }
    ],
    // 2×1 tiles (32×16). A lighter top slab over the front panel.
    counter: [
        { mask: counterBodyMask, ramp: "wood", x: 1, y: 2 },
        { mask: counterTopMask, ramp: "wood_light", x: 1, y: 2 }
    ],
    // 1×2 tiles (16×32). A frame with three rows of books, one mask in three colours.
    bookshelf: [
        { mask: bookshelfFrameMask, ramp: "wood", x: 1, y: 1 },
        { mask: bookshelfBooksMask, ramp: "book_blue", x: 2, y: 3 },
        { mask: bookshelfBooksMask, ramp: "book_red", x: 2, y: 12 },
        { mask: bookshelfBooksMask, ramp: "book_green", x: 2, y: 21 }
    ],
    // 2×2 tiles (32×32), sits on the floor. A cloth rug with a gold border ring.
    rug: [
        { mask: rugClothMask, ramp: "cloth_red", x: 2, y: 2 },
        { mask: rugRingMask, ramp: "gold", x: 6, y: 6 }
    ],
    // 1×1 tile, sits on the ground. One flower mask used three times.
    flower: [
        { mask: flowerMask, ramp: "flower_red", x: 3, y: 3 },
        { mask: flowerMask, ramp: "flower_yellow", x: 10, y: 8 },
        { mask: flowerMask, ramp: "flower_red", x: 5, y: 11 }
    ]
};
