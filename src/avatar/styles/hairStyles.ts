import { mirrorMask, type PixelMask } from "../../core/maskUtils";
import { bangsFrontMask } from "../masks/hair/overHead/bangsFront.mask";
import { centerPartFrontMask } from "../masks/hair/overHead/centerPartFront.mask";
import { sideSweptFrontMask } from "../masks/hair/overHead/sideSweptFront.mask";
import { crownCapMask } from "../masks/hair/overHead/crownCap.mask";
import { bangsSideMask } from "../masks/hair/overHead/bangsSide.mask";
import { centerPartSideMask } from "../masks/hair/overHead/centerPartSide.mask";
import { sideSweptSideMask } from "../masks/hair/overHead/sideSweptSide.mask";
import { tailMiddleHighChinMask } from "../masks/hair/behindHead/tailMiddleHighChin.mask";
import { tailMiddleLowChinMask } from "../masks/hair/behindHead/tailMiddleLowChin.mask";
import { tailMiddleHighShoulderMask } from "../masks/hair/behindHead/tailMiddleHighShoulder.mask";
import { tailMiddleLowShoulderMask } from "../masks/hair/behindHead/tailMiddleLowShoulder.mask";
import { tailMiddleHighArmpitMask } from "../masks/hair/behindHead/tailMiddleHighArmpit.mask";
import { tailMiddleLowArmpitMask } from "../masks/hair/behindHead/tailMiddleLowArmpit.mask";
import { tailMiddleHighMidBackMask } from "../masks/hair/behindHead/tailMiddleHighMidBack.mask";
import { tailMiddleLowMidBackMask } from "../masks/hair/behindHead/tailMiddleLowMidBack.mask";
import { tailPalmMask } from "../masks/hair/behindHead/tailPalm.mask";
import { tailChinMask } from "../masks/hair/behindHead/tailChin.mask";
import { tailShoulderMask } from "../masks/hair/behindHead/tailShoulder.mask";
import { tailArmpitMask } from "../masks/hair/behindHead/tailArmpit.mask";
import { tailMidBackMask } from "../masks/hair/behindHead/tailMidBack.mask";
import { looseEarFrontMask } from "../masks/hair/behindHead/loose/looseEarFront.mask";
import { looseEarSideMask } from "../masks/hair/behindHead/loose/looseEarSide.mask";
import { looseChinFrontMask } from "../masks/hair/behindHead/loose/looseChinFront.mask";
import { looseChinSideMask } from "../masks/hair/behindHead/loose/looseChinSide.mask";
import { looseChinBackMask } from "../masks/hair/behindHead/loose/looseChinBack.mask";
import { looseShoulderBehindFrontMask } from "../masks/hair/behindHead/loose/looseShoulderBehindFront.mask";
import { looseShoulderOverStrandFrontMask } from "../masks/hair/behindHead/loose/looseShoulderOverStrandFront.mask";
import { looseShoulderSideOverStrandMask } from "../masks/hair/behindHead/loose/looseShoulderSideOverStrand.mask";
import { looseShoulderFrontMask } from "../masks/hair/behindHead/loose/looseShoulderFront.mask";
import { looseShoulderSideMask } from "../masks/hair/behindHead/loose/looseShoulderSide.mask";
import { looseShoulderBackMask } from "../masks/hair/behindHead/loose/looseShoulderBack.mask";
import { looseArmpitBehindFrontMask } from "../masks/hair/behindHead/loose/looseArmpitBehindFront.mask";
import { looseArmpitOverStrandFrontMask } from "../masks/hair/behindHead/loose/looseArmpitOverStrandFront.mask";
import { looseArmpitSideOverStrandMask } from "../masks/hair/behindHead/loose/looseArmpitSideOverStrand.mask";
import { looseArmpitFrontMask } from "../masks/hair/behindHead/loose/looseArmpitFront.mask";
import { looseArmpitSideMask } from "../masks/hair/behindHead/loose/looseArmpitSide.mask";
import { looseArmpitBackMask } from "../masks/hair/behindHead/loose/looseArmpitBack.mask";
import { looseMidBackBehindFrontMask } from "../masks/hair/behindHead/loose/looseMidBackBehindFront.mask";
import { looseMidBackOverStrandFrontMask } from "../masks/hair/behindHead/loose/looseMidBackOverStrandFront.mask";
import { looseMidBackSideOverStrandMask } from "../masks/hair/behindHead/loose/looseMidBackSideOverStrand.mask";
import { looseMidBackFrontMask } from "../masks/hair/behindHead/loose/looseMidBackFront.mask";
import { looseMidBackSideMask } from "../masks/hair/behindHead/loose/looseMidBackSide.mask";
import { looseMidBackBackMask } from "../masks/hair/behindHead/loose/looseMidBackBack.mask";
import { cutMask, type HairCut } from "./hairCuts";
import type { HeadOrientation } from "../orientation";

export type HairLayer = {
    mask: PixelMask;
    offsetX: number;
    offsetY: number;
    placement: "behindBody" | "behindHead" | "front" | "top";
    /** `top` is drawn over everything, for back hair seen from behind. Drawn without an outline where it lies on other hair, so it joins it. */
    blends?: true;
    /** Where the tail is tied, as the picture column of its middle and the row. An accessory goes here. */
    tie?: { x: number; y: number; tilt?: "slash" | "backslash"; under?: true };
};

type HairFamilyDefinition = {
    byOrientation: Partial<Record<HeadOrientation, readonly HairLayer[]>>;
    fallback: readonly HairLayer[];
};

export type FrontHairStyle = "centerPart" | "bangs" | "sideSwept";
/**
 * How long the hair is. Set it first: loose hair hangs to this length and the tail of a ponytail or pigtails
 * is as long as the hair it is made from. The keys are in order from shortest to longest. Bald has no hair at all.
 */
export const hairLengths = { bald: 1, ear: 1, chin: 1, shoulder: 1, armpit: 1, midBack: 1 } as const;
export type HairLength = keyof typeof hairLengths;

/** Bald has no hair to style, and at ear length hair is too short to tie up (those are pixie cuts and crops), so only blunt loose hair is offered. */
export function backHairStylesFor(length: HairLength): readonly BackHairStyle[] {
    const all = Object.keys(backHairStyles) as BackHairStyle[];
    // The cuts need hair that hangs below the head, so they start at shoulder length.
    if (length === "bald" || length === "ear") return ["looseBlunt"];
    return length === "chin" ? all.filter((id) => id !== "looseV" && id !== "looseU") : all;
}

/** Whether back hair falls over the shoulders, hangs behind them, or has some of each: a strand over each shoulder and the rest behind. */
export const hairDrapes = { overShoulder: 1, behindShoulder: 1, overAndBehindShoulder: 1 } as const;
export type HairDrape = keyof typeof hairDrapes;

/** Only hair long enough to reach the shoulders has a choice; shorter hair is above them either way. */
export const hairDrapeApplies = (length: HairLength): boolean => length === "shoulder" || length === "armpit" || length === "midBack";

/** A ponytail is a single tail and pigtails are a pair. */
/** Loose hair is cut blunt, in a V or in a U. */
export type BackHairStyle = "looseBlunt" | "looseV" | "looseU" | "highPonytailRight" | "highPonytailLeft" | "highPonytailMiddle" | "lowPonytailRight" | "lowPonytailLeft" | "lowPonytailMiddle" | "highPigtails" | "lowPigtails";

const HEAD_X = 1;
const HEAD_Y = -5;

const layer = (mask: PixelMask, offsetX: number, offsetY: number, placement: HairLayer["placement"], blends?: true): HairLayer => ({
    mask,
    offsetX,
    offsetY,
    placement,
    ...(blends ? { blends } : {})
});

/** Hair drawn over the head: the front fringe, the side-view hair, and a cap over the whole crown from behind. */
function frontFamily(frontMask: PixelMask, sideMask: PixelMask): HairFamilyDefinition {
    const forward = [layer(frontMask, HEAD_X, HEAD_Y, "front")];
    return {
        byOrientation: {
            front: forward,
            right: [layer(sideMask, HEAD_X, HEAD_Y, "front")],
            left: [layer(mirrorMask(sideMask), HEAD_X, HEAD_Y, "front")],
            back: [layer(crownCapMask, HEAD_X, HEAD_Y, "front")]
        },
        fallback: forward
    };
}

const centerPartFamily = frontFamily(centerPartFrontMask, centerPartSideMask);
const bangsFamily = frontFamily(bangsFrontMask, bangsSideMask);
const sideSweptFamily = frontFamily(sideSweptFrontMask, sideSweptSideMask);

// Tail masks are drawn with the tail on the right. In the side views the tail hangs off the back of the head,
// which is on the left when facing right and on the right when facing left.
type TiedLength = Exclude<HairLength, "bald" | "ear">;
const tailMasks: Record<TiedLength, PixelMask> = {
    chin: tailChinMask,
    shoulder: tailShoulderMask,
    armpit: tailArmpitMask,
    midBack: tailMidBackMask
};

type TailHeight = "high" | "low";

/** Marks where a tail is tied, for an accessory. */
const tiedAt = (l: HairLayer, x: number, y: number, tilt?: "slash" | "backslash", under?: boolean): HairLayer => ({
    ...l,
    tie: { x, y, ...(tilt ? { tilt } : {}), ...(under ? { under: true as const } : {}) }
});

// The tail masks slope down to the right, so in the front and back views a band across one slants like "/", and across a
// flipped tail like "\". In profile the band lies along the back of the head where the tail meets it: the head slopes down
// and away from the face there, so it is "/" facing right and "\" facing left.
const slash = "slash" as const;
const backslash = "backslash" as const;

type Hang = "over" | "behind";

/**
 * A layer of back hair at the shoulders. Hair behind them is drawn before the body, so the body covers it.
 * Seen from behind that flips: hair behind the shoulders is the hair down the back, on top of everything and
 * blended into the crown, and hair over the shoulders is in front of the body, so the body covers it.
 */
function at(hang: Hang, view: HeadOrientation, mask: PixelMask, x: number, y: number): HairLayer {
    if (view === "back") return hang === "behind" ? layer(mask, x, y, "top", true) : layer(mask, x, y, "behindBody");
    return hang === "behind" ? layer(mask, x, y, "behindBody") : layer(mask, x, y, "behindHead");
}

/** A tail has no hair left to hang behind, so having some of each means it falls over the shoulder. */
const hangOf = (drape: HairDrape): Hang => (drape === "behindShoulder" ? "behind" : "over");

type TailPosition = "right" | "left" | "middle";

const middleTails: Record<TiedLength, Record<TailHeight, PixelMask>> = {
    chin: { high: tailMiddleHighChinMask, low: tailMiddleLowChinMask },
    shoulder: { high: tailMiddleHighShoulderMask, low: tailMiddleLowShoulderMask },
    armpit: { high: tailMiddleHighArmpitMask, low: tailMiddleLowArmpitMask },
    midBack: { high: tailMiddleHighMidBackMask, low: tailMiddleLowMidBackMask }
};

/**
 * One tail, on the right or left of the picture from the front, or in the middle. At chin length a high middle
 * one is a coconut-palm tuft. From behind the sides swap, since the front view is mirrored. In profile the tail
 * hangs off the back of the head whichever side it is on.
 */
function ponytail(length: TiedLength, height: TailHeight, drape: HairDrape, position: TailPosition): HairFamilyDefinition {
    if (position === "middle") {
        if (length === "chin" && height === "high") {
            // The tuft starts where the longer middle tails do: on the same row, and in profile at the same column
            // towards the back of the head. Its middle column is the eighth, so the offsets put that on the tie column.
            // From the front it is tied on the fronds, since its stem is behind the head. From behind and in profile it
            // is tied at the stem, below the fronds, so the accessory does not cover them; from behind the tuft is over it and
            // the accessory peeks out each side of the stem.
            const tuft = (view: HeadOrientation, x: number) => {
                // Like the longer middle tails it hangs behind the head from the front and in profile, and is on top from behind.
                const mask = view === "back" ? layer(tailPalmMask, x, -7, "top") : layer(tailPalmMask, x, -7, "behindBody");
                return [tiedAt(mask, x + 8, view === "front" ? -7 : view === "back" ? -4 : -5, view === "right" ? slash : view === "left" ? backslash : undefined, view === "back")];
            };
            return { byOrientation: { front: tuft("front", -2), back: tuft("back", -2), right: tuft("right", -7), left: tuft("left", 3) }, fallback: tuft("front", -2) };
        }
        // A tail down the middle hangs behind the head from the front, so only the tuft on top of a high one shows.
        const mask = middleTails[length][height];
        const y = height === "high" ? -7 : 1;
        // It is tied on the tuft above the crown when high, clear of the head's outline, and at the nape when low.
        const tie = height === "high" ? y : y + 1;
        const front = [tiedAt(layer(mask, 1, y, "behindBody"), 6, tie)];
        return {
            byOrientation: {
                front,
                // From behind a high tail falls over its own tie, so the tie is under it.
                // It keeps its outline, so it still reads as a tail where it lies over the crown.
                back: [tiedAt(layer(mask, 1, y, "top"), 6, tie, undefined, height === "high")],
                right: [tiedAt(layer(mask, -4, y, "behindBody"), 1, tie)],
                left: [tiedAt(layer(mask, 6, y, "behindBody"), 11, tie)]
            },
            fallback: front
        };
    }
    const mask = tailMasks[length];
    const y = height === "high" ? -3 : 0;
    const x = height === "high" ? 4 : 3;
    const onRight = position === "right";
    // The tail masks are drawn with the tail on the right, so a left one is the flipped mask.
    // The tail is tied on its third row, where it comes out from behind the head. On a flipped mask that row is columns 0 and 1,
    // so its tie is the right one of the pair.
    const tieY = y + 2;
    const front = [tiedAt(at(hangOf(drape), "front", onRight ? mask : mirrorMask(mask), onRight ? x : 2 - x, y), onRight ? x + 9 : 3 - x, tieY, onRight ? slash : backslash)];
    return {
        byOrientation: {
            front,
            back: [tiedAt(at(hangOf(drape), "back", onRight ? mirrorMask(mask) : mask, onRight ? 2 - x : x, y), onRight ? 3 - x : x + 9, tieY, onRight ? backslash : slash, height === "high")],
            right: [tiedAt(at(hangOf(drape), "right", mirrorMask(mask), -2, y), 0, y + 1, slash)],
            left: [tiedAt(at(hangOf(drape), "left", mask, 4, y), 12, y + 1, backslash)]
        },
        fallback: front
    };
}

/** Two tails, one each side of the head. In profile only the one on the back of the head shows. */
function pigtails(length: TiedLength, height: TailHeight, drape: HairDrape): HairFamilyDefinition {
    const mask = tailMasks[length];
    const y = height === "high" ? -5 : 0;
    const both = (view: HeadOrientation) => {
        return [
            tiedAt(at(hangOf(drape), view, mirrorMask(mask), -2, y), -1, y + 2, backslash),
            tiedAt(at(hangOf(drape), view, mask, 4, y), 13, y + 2, slash)
        ];
    };
    return {
        byOrientation: {
            front: both("front"),
            back: both("back"),
            right: [tiedAt(at(hangOf(drape), "right", mirrorMask(mask), -2, y), 0, y + 1, slash)],
            left: [tiedAt(at(hangOf(drape), "left", mask, 4, y), 12, y + 1, backslash)]
        },
        fallback: both("front")
    };
}

/**
 * Loose hair, down to the length. Over the shoulders it falls in a strand in front of each, and behind them it
 * hangs behind. From behind that flips, so the hair behind the shoulders covers the back. With some of each, a
 * thin strand falls over each shoulder and the rest hangs behind. Hair above the shoulders has no such choice.
 */
type LooseMasks = {
    /** The hair around the head, down to the chin, which is as wide as hair gets at any length. */
    volume: PixelMask;
    front: PixelMask;
    side: PixelMask;
    back?: PixelMask;
    /** Only hair that reaches the shoulders has these. */
    behindFront?: PixelMask;
    overStrandFront?: PixelMask;
    sideOverStrand?: PixelMask;
};
const looseMasks: Record<Exclude<HairLength, "bald">, LooseMasks> = {
    ear: { volume: looseEarFrontMask, front: looseEarFrontMask, side: looseEarSideMask },
    chin: { volume: looseChinFrontMask, front: looseChinFrontMask, side: looseChinSideMask, back: looseChinBackMask },
    shoulder: {
        volume: looseChinFrontMask,
        front: looseShoulderFrontMask,
        side: looseShoulderSideMask,
        back: looseShoulderBackMask,
        behindFront: looseShoulderBehindFrontMask,
        overStrandFront: looseShoulderOverStrandFrontMask,
        sideOverStrand: looseShoulderSideOverStrandMask
    },
    armpit: {
        volume: looseChinFrontMask,
        front: looseArmpitFrontMask,
        side: looseArmpitSideMask,
        back: looseArmpitBackMask,
        behindFront: looseArmpitBehindFrontMask,
        overStrandFront: looseArmpitOverStrandFrontMask,
        sideOverStrand: looseArmpitSideOverStrandMask
    },
    midBack: {
        volume: looseChinFrontMask,
        front: looseMidBackFrontMask,
        side: looseMidBackSideMask,
        back: looseMidBackBackMask,
        behindFront: looseMidBackBehindFrontMask,
        overStrandFront: looseMidBackOverStrandFrontMask,
        sideOverStrand: looseMidBackSideOverStrandMask
    }
};

// The back mask starts on the sixth row of the head, so it overlaps the crown cap and carries on from it.
const LOOSE_BACK_Y = HEAD_Y + 6;

/** Rows of loose hair that hang below the head, which is as far up as a cut can reach. */
const hanging: Record<Exclude<HairLength, "bald">, number> = { ear: 0, chin: 0, shoulder: 2, armpit: 4, midBack: 6 };

function loose(length: Exclude<HairLength, "bald">, drape: HairDrape, cut: HairCut): HairFamilyDefinition {
    const base = looseMasks[length];
    const cutOf = (mask: PixelMask | undefined) => (mask && cut !== "blunt" ? cutMask(mask, cut, hanging[length]) : mask);
    const m: LooseMasks = {
        ...base,
        front: cutOf(base.front)!,
        side: cutOf(base.side)!,
        back: cutOf(base.back),
        behindFront: cutOf(base.behindFront),
        overStrandFront: cutOf(base.overStrandFront),
        sideOverStrand: cutOf(base.sideOverStrand)
    };
    const some = drape === "overAndBehindShoulder";

    const profile = (view: "left" | "right"): HairLayer[] => {
        const flip = (mask: PixelMask) => (view === "right" ? mask : mirrorMask(mask));
        if (!m.sideOverStrand) return [at("over", view, flip(m.side), HEAD_X, HEAD_Y)];
        if (some) return [at("behind", view, flip(m.side), HEAD_X, HEAD_Y), at("over", view, flip(m.sideOverStrand), HEAD_X, HEAD_Y)];
        return [at(drape === "behindShoulder" ? "behind" : "over", view, flip(m.side), HEAD_X, HEAD_Y)];
    };

    const front = (): HairLayer[] => {
        if (!m.behindFront) return [layer(m.front, 0, HEAD_Y, "behindHead")];
        if (some) return [layer(m.behindFront, 0, HEAD_Y, "behindBody"), layer(m.overStrandFront!, 0, HEAD_Y, "behindHead")];
        return [drape === "behindShoulder" ? layer(m.behindFront, 0, HEAD_Y, "behindBody") : layer(m.front, 0, HEAD_Y, "behindHead")];
    };

    // From behind the hair is on top of the head and shows past its sides, as it does from the front. The
    // strands over the shoulders are in front of the body, so only the hair down the back shows.
    const back = (): HairLayer[] => {
        const top = layer(m.volume, 0, HEAD_Y, "top", true);
        if (!m.behindFront) return [top];
        return [top, drape === "overShoulder" ? layer(m.behindFront, 0, HEAD_Y, "behindBody") : layer(m.back!, 0, LOOSE_BACK_Y, "top", true)];
    };

    return {
        byOrientation: { front: front(), right: profile("right"), left: profile("left"), back: back() },
        fallback: front()
    };
}

export const frontHairStyles = {
    centerPart: centerPartFamily,
    bangs: bangsFamily,
    sideSwept: sideSweptFamily
} as const satisfies Record<FrontHairStyle, HairFamilyDefinition>;

/** Back hair for each length and drape. The styles follow the length. Ear length can only be loose. */
export const backHairStylesByLength = Object.fromEntries(
    (Object.keys(hairLengths) as HairLength[]).map((length) => {
        if (length === "bald") return [length, {}];
        const forDrape = (drape: HairDrape) => {
            if (length === "ear") {
                const only = loose(length, drape, "blunt");
                return { looseBlunt: only, looseV: only, looseU: only, highPonytailRight: only, highPonytailLeft: only, highPonytailMiddle: only, lowPonytailRight: only, lowPonytailLeft: only, lowPonytailMiddle: only, highPigtails: only, lowPigtails: only };
            }
            return {
                looseBlunt: loose(length, drape, "blunt"),
                looseV: loose(length, drape, length === "chin" ? "blunt" : "v"),
                looseU: loose(length, drape, length === "chin" ? "blunt" : "u"),
                highPonytailRight: ponytail(length, "high", drape, "right"),
                highPonytailLeft: ponytail(length, "high", drape, "left"),
                highPonytailMiddle: ponytail(length, "high", drape, "middle"),
                lowPonytailRight: ponytail(length, "low", drape, "right"),
                lowPonytailLeft: ponytail(length, "low", drape, "left"),
                lowPonytailMiddle: ponytail(length, "low", drape, "middle"),
                highPigtails: pigtails(length, "high", drape),
                lowPigtails: pigtails(length, "low", drape)
            } satisfies Record<BackHairStyle, HairFamilyDefinition>;
        };
        return [length, Object.fromEntries((Object.keys(hairDrapes) as HairDrape[]).map((drape) => [drape, forDrape(drape)]))];
    })
) as Record<Exclude<HairLength, "bald">, Record<HairDrape, Record<BackHairStyle, HairFamilyDefinition>>>;

/** An accessory ties up a tail, so it needs hair that is tied: hair of chin length or longer in a ponytail or pigtails. */
export const hairAccessoryApplies = (length: HairLength, style: BackHairStyle): boolean => length !== "bald" && length !== "ear" && !isLooseHair(style);

/** A tail down the middle hangs behind the head, so it has no shoulder to fall over. */
export const isMiddlePonytail = (style: BackHairStyle): boolean => style === "highPonytailMiddle" || style === "lowPonytailMiddle";

/** Whether a back hair style is loose hair, of any cut. */
export const isLooseHair = (style: BackHairStyle): boolean => style === "looseBlunt" || style === "looseV" || style === "looseU";

/** The back hair styles, by id. The shape of each follows `hairLength`. */
export const backHairStyles = { looseBlunt: 1, looseV: 1, looseU: 1, highPonytailRight: 1, highPonytailLeft: 1, highPonytailMiddle: 1, lowPonytailRight: 1, lowPonytailLeft: 1, lowPonytailMiddle: 1, highPigtails: 1, lowPigtails: 1 } as const satisfies Record<BackHairStyle, 1>;

export function resolveHairLayers(
    frontHairStyle: FrontHairStyle,
    backHairStyle: BackHairStyle,
    hairLength: HairLength,
    hairDrape: HairDrape,
    headOrientation: HeadOrientation
): readonly HairLayer[] {
    if (hairLength === "bald") return [];
    const frontLayers = frontHairStyles[frontHairStyle].byOrientation[headOrientation] ?? frontHairStyles[frontHairStyle].fallback;
    const back = backHairStylesByLength[hairLength][hairDrape][backHairStyle];
    const backLayers = back.byOrientation[headOrientation] ?? back.fallback;

    // From behind the crown hair is drawn first, so a ponytail lies over it.
    return headOrientation === "back" ? [...frontLayers, ...backLayers] : [...backLayers, ...frontLayers];
}
