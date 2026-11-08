import type { PixelMask } from "../../core/maskUtils";
import { headOrientations, maskForView, type HeadOrientation, type ViewMasks } from "../orientation";
import { skirtFrontMask } from "../masks/clothes/bottom/skirtFront.mask";
import { skirtSideMask } from "../masks/clothes/bottom/skirtSide.mask";
import { shortsFrontMask } from "../masks/clothes/bottom/shortsFront.mask";
import { shortsSideMask } from "../masks/clothes/bottom/shortsSide.mask";
import { dressTorsoFrontMask } from "../masks/clothes/full/dressTorsoFront.mask";
import { dressTorsoSideMask } from "../masks/clothes/full/dressTorsoSide.mask";
import { overallsTorsoFrontMask } from "../masks/clothes/full/overallsTorsoFront.mask";
import { overallsTorsoSideMask } from "../masks/clothes/full/overallsTorsoSide.mask";
import { bootsFrontMask } from "../masks/clothes/shoes/bootsFront.mask";
import { bootsSideMask } from "../masks/clothes/shoes/bootsSide.mask";
import { sandalsFrontMask } from "../masks/clothes/shoes/sandalsFront.mask";
import { sandalsSideMask } from "../masks/clothes/shoes/sandalsSide.mask";
import { shoesFrontMask } from "../masks/clothes/shoes/shoesFront.mask";
import { shoesSideMask } from "../masks/clothes/shoes/shoesSide.mask";
import { longSleevesFrontMask } from "../masks/clothes/top/longSleevesFront.mask";
import { longSleevesSideMask } from "../masks/clothes/top/longSleevesSide.mask";
import { longSleeveTorsoFrontMask } from "../masks/clothes/top/longSleeveTorsoFront.mask";
import { longSleeveTorsoSideMask } from "../masks/clothes/top/longSleeveTorsoSide.mask";
import { shirtSleevesFrontMask } from "../masks/clothes/top/shirtSleevesFront.mask";
import { shirtSleevesSideMask } from "../masks/clothes/top/shirtSleevesSide.mask";
import { shirtTorsoFrontMask } from "../masks/clothes/top/shirtTorsoFront.mask";
import { shirtTorsoSideMask } from "../masks/clothes/top/shirtTorsoSide.mask";
import { spaghettiTopTorsoFrontMask } from "../masks/clothes/top/spaghettiTopTorsoFront.mask";
import { spaghettiTopTorsoSideMask } from "../masks/clothes/top/spaghettiTopTorsoSide.mask";

export type ArmPose = "down" | "forward" | "back";
export type LegPose = "neutral" | "step";
/** `overArms` goes over the arms but under the hair and head, so a chin or a lock of hair stays on top of a sleeve. */
export type GarmentPlacement = "behindBody" | "overBody" | "overArms" | "overlay";
export type GarmentSlot = "top" | "bottom" | "shoes";

export type GarmentLayer = {
    mask: PixelMask;
    offsetX: number;
    offsetY: number;
    placement: GarmentPlacement;
    armPoses?: readonly ArmPose[];
    legPoses?: readonly LegPose[];
};

export type GarmentDefinition = {
    slot: GarmentSlot;
    /** A one-piece top (a dress, overalls) that also covers the legs, so no bottom is drawn under it. */
    coversBottom?: true;
    byOrientation: Partial<Record<HeadOrientation, readonly GarmentLayer[]>>;
    fallback: readonly GarmentLayer[];
};

type ViewedLayer = Omit<GarmentLayer, "mask"> & { masks: ViewMasks };

/** Builds a garment that is drawn from the front, either side and the back, each from its own mask. */
function viewed(slot: GarmentSlot, layers: readonly ViewedLayer[], extra: { coversBottom?: true } = {}): GarmentDefinition {
    const forView = (o: HeadOrientation): GarmentLayer[] => layers.map(({ masks, ...rest }) => ({ ...rest, mask: maskForView(masks, o) }));
    const byOrientation = Object.fromEntries(Object.keys(headOrientations).map((o) => [o, forView(o as HeadOrientation)]));
    return { slot, ...extra, byOrientation, fallback: forView("front") };
}

export type TopStyle = "none" | "spaghetti" | "shirt" | "longSleeve" | "overalls" | "dress";
export type BottomStyle = "none" | "shorts" | "skirt";
export type ShoeStyle = "none" | "boots" | "sandals" | "shoes";

export const topStyles = {
    none: { slot: "top", byOrientation: {}, fallback: [] },
    spaghetti: viewed("top", [{ masks: { front: spaghettiTopTorsoFrontMask, side: spaghettiTopTorsoSideMask }, offsetX: 2, offsetY: 6, placement: "overBody" }]),
    shirt: viewed("top", [
        { masks: { front: shirtTorsoFrontMask, side: shirtTorsoSideMask }, offsetX: 2, offsetY: 6, placement: "overBody" },
        { masks: { front: shirtSleevesFrontMask, side: shirtSleevesSideMask }, offsetX: 0, offsetY: 6, placement: "overArms", armPoses: ["down"] }
    ]),
    longSleeve: viewed("top", [
        { masks: { front: longSleeveTorsoFrontMask, side: longSleeveTorsoSideMask }, offsetX: 2, offsetY: 6, placement: "overBody" },
        { masks: { front: longSleevesFrontMask, side: longSleevesSideMask }, offsetX: 0, offsetY: 6, placement: "overArms", armPoses: ["down"] }
    ]),
    overalls: viewed("top", [{ masks: { front: overallsTorsoFrontMask, side: overallsTorsoSideMask }, offsetX: 2, offsetY: 6, placement: "overBody" }], { coversBottom: true }),
    dress: viewed("top", [{ masks: { front: dressTorsoFrontMask, side: dressTorsoSideMask }, offsetX: 2, offsetY: 6, placement: "overBody" }], { coversBottom: true })
} as const satisfies Record<TopStyle, GarmentDefinition>;

export const bottomStyles = {
    none: { slot: "bottom", byOrientation: {}, fallback: [] },
    shorts: viewed("bottom", [{ masks: { front: shortsFrontMask, side: shortsSideMask }, offsetX: 2, offsetY: 12, placement: "overBody" }]),
    skirt: viewed("bottom", [{ masks: { front: skirtFrontMask, side: skirtSideMask }, offsetX: 2, offsetY: 12, placement: "overBody" }])
} as const satisfies Record<BottomStyle, GarmentDefinition>;

export const shoeStyles = {
    none: { slot: "shoes", byOrientation: {}, fallback: [] },
    boots: viewed("shoes", [{ masks: { front: bootsFrontMask, side: bootsSideMask }, offsetX: 2, offsetY: 13, placement: "overlay", legPoses: ["neutral", "step"] }]),
    sandals: viewed("shoes", [{ masks: { front: sandalsFrontMask, side: sandalsSideMask }, offsetX: 2, offsetY: 16, placement: "overlay", legPoses: ["neutral", "step"] }]),
    shoes: viewed("shoes", [{ masks: { front: shoesFrontMask, side: shoesSideMask }, offsetX: 2, offsetY: 16, placement: "overlay", legPoses: ["neutral", "step"] }])
} as const satisfies Record<ShoeStyle, GarmentDefinition>;
