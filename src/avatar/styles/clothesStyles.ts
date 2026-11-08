import type { PixelMask } from "../../core/maskUtils";
import { headMasks } from "../masks/head.mask";
import { skirtMask } from "../masks/clothes/bottom/skirt.mask";
import { shortsMask } from "../masks/clothes/bottom/shorts.mask";
import { dressTorsoMask } from "../masks/clothes/full/dressTorso.mask";
import { overallsTorsoMask } from "../masks/clothes/full/overallsTorso.mask";
import { bootsMask } from "../masks/clothes/shoes/boots.mask";
import { sandalsMask } from "../masks/clothes/shoes/sandals.mask";
import { shoesMask } from "../masks/clothes/shoes/shoes.mask";
import { longSleevesMask } from "../masks/clothes/top/longSleeves.mask";
import { longSleeveTorsoMask } from "../masks/clothes/top/longSleeveTorso.mask";
import { shirtSleevesMask } from "../masks/clothes/top/shirtSleeves.mask";
import { shirtTorsoMask } from "../masks/clothes/top/shirtTorso.mask";
import { spaghettiTopTorsoMask } from "../masks/clothes/top/spaghettiTopTorso.mask";

type HeadOrientation = keyof typeof headMasks;

export type ArmPose = "down" | "forward" | "back";
export type LegPose = "neutral" | "step";
export type GarmentPlacement = "behindBody" | "overBody" | "overlay";
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

export type TopStyle = "none" | "spaghetti" | "shirt" | "longSleeve" | "overalls" | "dress";
export type BottomStyle = "none" | "shorts" | "skirt";
export type ShoeStyle = "none" | "boots" | "sandals" | "shoes";

export const topStyles = {
    none: { slot: "top", byOrientation: {}, fallback: [] },
    spaghetti: {
        slot: "top",
        byOrientation: {},
        fallback: [{ mask: spaghettiTopTorsoMask, offsetX: 2, offsetY: 6, placement: "overBody" }]
    },
    shirt: {
        slot: "top",
        byOrientation: {},
        fallback: [
            { mask: shirtTorsoMask, offsetX: 2, offsetY: 6, placement: "overBody" },
            { mask: shirtSleevesMask, offsetX: 0, offsetY: 6, placement: "overlay", armPoses: ["down"] }
        ]
    },
    longSleeve: {
        slot: "top",
        byOrientation: {},
        fallback: [
            { mask: longSleeveTorsoMask, offsetX: 2, offsetY: 6, placement: "overBody" },
            { mask: longSleevesMask, offsetX: 0, offsetY: 6, placement: "overlay", armPoses: ["down"] }
        ]
    },
    overalls: {
        slot: "top",
        coversBottom: true,
        byOrientation: {},
        fallback: [{ mask: overallsTorsoMask, offsetX: 2, offsetY: 6, placement: "overBody" }]
    },
    dress: {
        slot: "top",
        coversBottom: true,
        byOrientation: {},
        fallback: [{ mask: dressTorsoMask, offsetX: 2, offsetY: 6, placement: "overBody" }]
    }
} as const satisfies Record<TopStyle, GarmentDefinition>;

export const bottomStyles = {
    none: { slot: "bottom", byOrientation: {}, fallback: [] },
    shorts: {
        slot: "bottom",
        byOrientation: {},
        fallback: [{ mask: shortsMask, offsetX: 2, offsetY: 12, placement: "overBody" }]
    },
    skirt: {
        slot: "bottom",
        byOrientation: {},
        fallback: [{ mask: skirtMask, offsetX: 2, offsetY: 12, placement: "overBody" }]
    }
} as const satisfies Record<BottomStyle, GarmentDefinition>;

export const shoeStyles = {
    none: { slot: "shoes", byOrientation: {}, fallback: [] },
    boots: {
        slot: "shoes",
        byOrientation: {},
        fallback: [{ mask: bootsMask, offsetX: 2, offsetY: 13, placement: "overlay", legPoses: ["neutral", "step"] }]
    },
    sandals: {
        slot: "shoes",
        byOrientation: {},
        fallback: [{ mask: sandalsMask, offsetX: 2, offsetY: 16, placement: "overlay", legPoses: ["neutral", "step"] }]
    },
    shoes: {
        slot: "shoes",
        byOrientation: {},
        fallback: [{ mask: shoesMask, offsetX: 2, offsetY: 16, placement: "overlay", legPoses: ["neutral", "step"] }]
    },
} as const satisfies Record<ShoeStyle, GarmentDefinition>;
