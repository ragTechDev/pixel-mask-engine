import type { PixelMask } from "../../core/maskUtils";
import type { ObjectId } from "../types";
import type { ObjectRampId } from "./ramps";

// DRAFT object art. Objects are drawn as "0"/"1" silhouettes and shaded
// automatically (outline, highlight, shadow), like the avatar parts. Each
// object is a stack of parts drawn in order, each with a fixed ramp. `x` and
// `y` are the pixel position of the mask's top-left corner inside the object's
// tile box (16 px per tile). The outline adds one pixel around each part.
// These are first drafts, meant to be redrawn by hand before release.

export interface ObjectPart {
    readonly mask: PixelMask;
    readonly ramp: ObjectRampId;
    readonly x: number;
    readonly y: number;
}

const rect = (width: number, height: number): PixelMask => Array.from({ length: height }, () => "1".repeat(width));

export const objectArt: Record<ObjectId, readonly ObjectPart[]> = {
    // 1×2 tiles (16×32). Trunk first, canopy over it.
    tree: [
        {
            ramp: "bark",
            x: 5,
            y: 14,
            mask: [
                "011110", "011110", "011110", "011110", "011110", "011110", "011110",
                "011110", "011110", "011110", "011110", "011110", "111111", "111111"
            ]
        },
        {
            ramp: "leaf",
            x: 1,
            y: 1,
            mask: [
                "00000111100000",
                "00011111111000",
                "00111111111100",
                "01111111111110",
                "01111111111110",
                "11111111111111",
                "11111111111111",
                "11111111111111",
                "11111111111111",
                "11111111111111",
                "01111111111110",
                "01111111111110",
                "00111111111100",
                "00011111111000",
                "00000111100000"
            ]
        }
    ],
    // 1×1 tile. Two posts with two rails across them.
    fence: [
        { ramp: "wood", x: 1, y: 2, mask: Array.from({ length: 12 }, () => "11100000000111") },
        {
            ramp: "wood",
            x: 1,
            y: 4,
            mask: [
                "11111111111111", "11111111111111",
                "00000000000000", "00000000000000", "00000000000000",
                "11111111111111", "11111111111111"
            ]
        }
    ],
    // 1×1 tile. A door with a knob, meant to sit in a wall.
    door: [
        { ramp: "wood", x: 2, y: 1, mask: ["011111111110", ...rect(12, 14)] },
        { ramp: "gold", x: 10, y: 8, mask: ["11", "11"] }
    ],
    // 1×1 tile. A frame with a pane of glass, meant to sit in a wall.
    window: [
        { ramp: "wood", x: 2, y: 3, mask: rect(12, 10) },
        { ramp: "glass", x: 4, y: 5, mask: rect(8, 6) }
    ],
    // 2×1 tiles (32×16). A lighter top slab over the front panel.
    counter: [
        { ramp: "wood", x: 1, y: 2, mask: rect(30, 13) },
        { ramp: "wood_light", x: 1, y: 2, mask: rect(30, 4) }
    ],
    // 1×2 tiles (16×32). A frame with three rows of books.
    bookshelf: [
        { ramp: "wood", x: 1, y: 1, mask: rect(14, 30) },
        { ramp: "book_blue", x: 2, y: 3, mask: Array.from({ length: 6 }, () => "111011101110") },
        { ramp: "book_red", x: 2, y: 12, mask: Array.from({ length: 6 }, () => "111011101110") },
        { ramp: "book_green", x: 2, y: 21, mask: Array.from({ length: 6 }, () => "111011101110") }
    ],
    // 2×2 tiles (32×32), sits on the floor. A cloth rug with a gold border ring.
    rug: [
        { ramp: "cloth_red", x: 2, y: 2, mask: rect(28, 28) },
        {
            ramp: "gold",
            x: 6,
            y: 6,
            mask: [
                "11111111111111111111",
                "11111111111111111111",
                ...Array.from({ length: 16 }, () => "11000000000000000011"),
                "11111111111111111111",
                "11111111111111111111"
            ]
        }
    ],
    // 1×1 tile, sits on the ground. Three small flowers.
    flower: [
        { ramp: "flower_red", x: 3, y: 3, mask: ["010", "111", "010"] },
        { ramp: "flower_yellow", x: 10, y: 8, mask: ["010", "111", "010"] },
        { ramp: "flower_red", x: 5, y: 11, mask: ["010", "111", "010"] }
    ]
};
