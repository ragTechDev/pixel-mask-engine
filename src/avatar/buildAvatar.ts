import { composeSprites, layerBounds, type Layer, type Raster } from "../core/compose";
import { configKey } from "../core/cache";
import { mirrorMask, type PixelMask } from "../core/maskUtils";
import { clothesPalettes, eyePalettes, hairPalettes, skinPalettes } from "../core/palette";
import { defineSprite, rampSlots, shadeMask, SLOT, type Sprite } from "../core/sprite";
import { armsFrontMask } from "./masks/armsFront.mask";
import { armsSideMask } from "./masks/armsSide.mask";
import { eyesFrontMask } from "./masks/eyesFront.mask";
import { eyesSideMask } from "./masks/eyesSide.mask";
import { headFrontMask } from "./masks/headFront.mask";
import { headSideMask } from "./masks/headSide.mask";
import { legsFrontMask } from "./masks/legsFront.mask";
import { legsSideMask } from "./masks/legsSide.mask";
import { torsoFrontMask } from "./masks/torsoFront.mask";
import { torsoSideMask } from "./masks/torsoSide.mask";
import { accessoryParts, hairAccessories, type HairAccessory } from "./styles/hairAccessories";
import { hairTextures, textureMask, texturePad, type HairTexture } from "./styles/hairTextures";
import { headOrientations, maskForView, type HeadOrientation } from "./orientation";
import {
    bottomStyles,
    shoeStyles,
    topStyles,
    type ArmPose,
    type BottomStyle,
    type GarmentDefinition,
    type GarmentLayer,
    type GarmentPlacement,
    type LegPose,
    type ShoeStyle,
    type TopStyle
} from "./styles/clothesStyles";
import {
    backHairStyles,
    backHairStylesFor,
    hairLengths,
    hairDrapes,
    hairDrapeApplies,
    hairAccessoryApplies,
    isLooseHair,
    isMiddlePonytail,
    frontHairStyles,
    resolveHairLayers,
    type BackHairStyle,
    type HairLength,
    type HairDrape,
    type FrontHairStyle,
    type HairLayer
} from "./styles/hairStyles";
import type { ClothesColor, EyeColor, HairColor, SkinTone } from "../core/palette";

export type { HeadOrientation };

/** An avatar is fully described by fixed style ids and palette keys. */
export interface AvatarConfig {
    headOrientation?: HeadOrientation;
    skinTone?: SkinTone;
    frontHairStyle?: FrontHairStyle;
    hairLength?: HairLength;
    /** Whether back hair falls over the shoulders or hangs behind them. Only hair that reaches the shoulders has the choice. */
    hairDrape?: HairDrape;
    hairTexture?: HairTexture;
    /** Ties up a ponytail or pigtails. Only tied hair has one. */
    hairAccessory?: HairAccessory;
    backHairStyle?: BackHairStyle;
    hairColor?: HairColor;
    eyeColor?: EyeColor;
    /** The colour of the clothes. Each piece uses it unless it has a colour of its own below. */
    clothesColor?: ClothesColor;
    /** Colours of single pieces. Left out, a piece follows `clothesColor`. */
    topColor?: ClothesColor;
    bottomColor?: ClothesColor;
    /** The colour of the hair accessory. Left out, it follows `clothesColor`. */
    hairAccessoryColor?: ClothesColor;
    shoeColor?: ClothesColor;
    topStyle?: TopStyle;
    bottomStyle?: BottomStyle;
    shoeStyle?: ShoeStyle;
    armPose?: ArmPose;
    legPose?: LegPose;
}

/** The pieces that can take a colour of their own. */
export const pieceColorFields = ["topColor", "bottomColor", "shoeColor", "hairAccessoryColor"] as const;
export type PieceColorField = (typeof pieceColorFields)[number];

/** An avatar config with every choice filled in. A piece colour is only there when it differs from `clothesColor`. */
export type ResolvedAvatarConfig = Required<Omit<AvatarConfig, PieceColorField>> & Pick<AvatarConfig, PieceColorField>;

export const defaultAvatarConfig: Readonly<Required<Omit<AvatarConfig, PieceColorField>>> = {
    headOrientation: "front",
    skinTone: "light",
    frontHairStyle: "centerPart",
    hairLength: "shoulder",
    hairDrape: "overShoulder",
    hairTexture: "straight",
    hairAccessory: "none",
    backHairStyle: "lowPonytailRight",
    hairColor: "brown",
    eyeColor: "dark",
    clothesColor: "blue",
    topStyle: "shirt",
    bottomStyle: "shorts",
    shoeStyle: "boots",
    armPose: "down",
    legPose: "neutral"
};

const ARM_POSES = { down: 1, forward: 1, back: 1 };
const LEG_POSES = { neutral: 1, step: 1 };

const allowed: { [K in Exclude<keyof AvatarConfig, PieceColorField>]-?: object } = {
    headOrientation: headOrientations,
    skinTone: skinPalettes,
    frontHairStyle: frontHairStyles,
    hairLength: hairLengths,
    hairDrape: hairDrapes,
    hairTexture: hairTextures,
    hairAccessory: hairAccessories,
    backHairStyle: backHairStyles,
    hairColor: hairPalettes,
    eyeColor: eyePalettes,
    clothesColor: clothesPalettes,
    topStyle: topStyles,
    bottomStyle: bottomStyles,
    shoeStyle: shoeStyles,
    armPose: ARM_POSES,
    legPose: LEG_POSES
};

/**
 * Fills in defaults and replaces any unknown value with its default, so
 * configs loaded from storage or the network can never select anything
 * outside the fixed tables.
 */
export function resolveAvatarConfig(config: AvatarConfig = {}): ResolvedAvatarConfig {
    const out = { ...defaultAvatarConfig } as Record<string, string>;
    for (const key of Object.keys(allowed) as Array<keyof typeof allowed>) {
        const value = config[key];
        if (typeof value === "string" && Object.prototype.hasOwnProperty.call(allowed[key], value)) {
            out[key] = value;
        }
    }
    // A piece colour only counts when it differs from the clothes colour, so equivalent configs match.
    for (const key of pieceColorFields) {
        const value = config[key];
        if (typeof value === "string" && value !== out.clothesColor && Object.prototype.hasOwnProperty.call(clothesPalettes, value)) {
            out[key] = value;
        }
    }
    // Hair too short to tie up can only be loose.
    if (!backHairStylesFor(out.hairLength as HairLength).includes(out.backHairStyle as BackHairStyle)) out.backHairStyle = "looseBlunt";
    // Hair above the shoulders has no choice to make, so equivalent configs match.
    if (!hairDrapeApplies(out.hairLength as HairLength)) out.hairDrape = defaultAvatarConfig.hairDrape;
    // A tail down the middle hangs behind the head, so it has no shoulder to fall over.
    if (isMiddlePonytail(out.backHairStyle as BackHairStyle)) out.hairDrape = defaultAvatarConfig.hairDrape;
    // Only loose hair has some left to hang behind; a tail just falls over the shoulder.
    if (out.hairDrape === "overAndBehindShoulder" && !isLooseHair(out.backHairStyle as BackHairStyle)) out.hairDrape = defaultAvatarConfig.hairDrape;
    // Only tied hair has an accessory, and the colour of no accessory does not count.
    if (!hairAccessoryApplies(out.hairLength as HairLength, out.backHairStyle as BackHairStyle)) out.hairAccessory = "none";
    if (out.hairAccessory === "none") delete out.hairAccessoryColor;
    return out as ResolvedAvatarConfig;
}

/** Cache key for an avatar; equivalent configs (after defaults) share a key. */
export function avatarKey(config: AvatarConfig = {}): string {
    return configKey(resolveAvatarConfig(config));
}

const shaded = new WeakMap<PixelMask, Sprite>();
function shadedSprite(mask: PixelMask): Sprite {
    let sprite = shaded.get(mask);
    if (!sprite) {
        sprite = shadeMask(mask);
        shaded.set(mask, sprite);
    }
    return sprite;
}

// A hair accessory is thin, so shading would turn every pixel into a highlight or a shadow and none would be the
// colour that was picked. It is drawn in its base colour instead, with an outline unless it is too thin for one.
const flat = { outlined: new WeakMap<PixelMask, Sprite>(), bare: new WeakMap<PixelMask, Sprite>() };
function flatSprite(mask: PixelMask, outlined: boolean): Sprite {
    const cache = outlined ? flat.outlined : flat.bare;
    let sprite = cache.get(mask);
    if (!sprite) {
        const shadedOne = shadedSprite(mask);
        sprite = {
            ...shadedOne,
            px: shadedOne.px.map((slot) => (slot === SLOT.highlight || slot === SLOT.shadow ? SLOT.base : slot === SLOT.outline && !outlined ? 0 : slot))
        };
        cache.set(mask, sprite);
    }
    return sprite;
}

const armsMasks = { front: armsFrontMask, side: armsSideMask };
const headMasks = { front: headFrontMask, side: headSideMask };
const legsMasks = { front: legsFrontMask, side: legsSideMask };
const torsoMasks = { front: torsoFrontMask, side: torsoSideMask };
const eyesLegend = { "1": SLOT.base, H: SLOT.highlight };
const eyesSprites = { front: defineSprite(eyesFrontMask, eyesLegend), side: defineSprite(eyesSideMask, eyesLegend) };

function garmentLayersFor(def: GarmentDefinition, orientation: HeadOrientation): readonly GarmentLayer[] {
    return def.byOrientation[orientation] ?? def.fallback;
}

/** Composes an avatar into a colour-resolved raster. Pure; cache by `avatarKey`. */
export function buildAvatar(config: AvatarConfig = {}): Raster {
    const c = resolveAvatarConfig(config);
    const o = c.headOrientation;
    const skin = rampSlots(skinPalettes[c.skinTone]);
    const hair = rampSlots(hairPalettes[c.hairColor]);
    const eyes = rampSlots(eyePalettes[c.eyeColor]);
    const clothesSlots = (color: ClothesColor | undefined) => rampSlots(clothesPalettes[color ?? c.clothesColor]);

    const layer = (mask: PixelMask, slots: readonly string[], x: number, y: number): Layer => ({
        sprite: shadedSprite(mask),
        slots,
        x,
        y
    });

    const hairLayers: readonly HairLayer[] = resolveHairLayers(c.frontHairStyle, c.backHairStyle, c.hairLength, c.hairDrape, o);
    // A one-piece top (a dress, overalls) covers the legs, so nothing is drawn for the bottom.
    const coversBottom = (topStyles[c.topStyle] as GarmentDefinition).coversBottom === true;
    const piece = (layers: readonly GarmentLayer[], color: ClothesColor | undefined) => {
        const slots = clothesSlots(color);
        return layers.map((l) => ({ ...l, slots }));
    };
    const garments = [
        ...piece(garmentLayersFor(topStyles[c.topStyle], o), c.topColor),
        ...(coversBottom ? [] : piece(garmentLayersFor(bottomStyles[c.bottomStyle], o), c.bottomColor)),
        ...piece(garmentLayersFor(shoeStyles[c.shoeStyle], o), c.shoeColor)
    ];

    const garmentsAt = (placement: GarmentPlacement) =>
        garments
            .filter(
                (g) =>
                    g.placement === placement &&
                    (!g.armPoses || g.armPoses.includes(c.armPose)) &&
                    (!g.legPoses || g.legPoses.includes(c.legPose))
            )
            .map((g) => layer(g.mask, g.slots, g.offsetX, g.offsetY));
    const hairBody = [hair[SLOT.base], hair[SLOT.shadow], hair[SLOT.highlight]];
    // A texture widens the mask on both sides, so the layer moves left by the same amount to stay in place.
    const hairLayer = (h: HairLayer): Layer => ({
        ...layer(textureMask(h.mask, c.hairTexture), hair, h.offsetX - texturePad(c.hairTexture), h.offsetY),
        ...(h.blends ? { noOutlineOver: hairBody, noHighlightOver: hairBody } : {})
    });
    // An accessory sits where a tail is tied, in the same group as the tail and just after it.
    const accessorySlots = rampSlots(clothesPalettes[c.hairAccessoryColor ?? c.clothesColor]);
    const flatLayer = (mask: PixelMask, outlined: boolean, x: number, y: number): Layer => ({ sprite: flatSprite(mask, outlined), slots: accessorySlots, x, y });
    const accessoryLayers = (h: HairLayer): Layer[] => {
        if (c.hairAccessory === "none" || !h.tie) return [];
        const { mask, above, tilted, outlined } = accessoryParts[c.hairAccessory];
        const { x, y, tilt } = h.tie;
        // A band slants across a sloping tail, through the tie point; anything else lies flat, centred on it.
        if (tilt) {
            const width = tilted.mask[0].length;
            return tilt === "slash"
                ? [flatLayer(tilted.mask, outlined, x - tilted.centre, y - tilted.up)]
                : [flatLayer(mirrorMask(tilted.mask), outlined, x - (width - 1 - tilted.centre), y - tilted.up)];
        }
        return [flatLayer(mask, outlined, x - Math.floor(mask[0].length / 2), y - above)];
    };
    // An accessory goes just after its tail, or just before it where the tail falls over the tie.
    const withAccessory = (h: HairLayer): Layer[] => (h.tie?.under ? [...accessoryLayers(h), hairLayer(h)] : [hairLayer(h), ...accessoryLayers(h)]);
    const hairAt = (placement: HairLayer["placement"]) => hairLayers.filter((h) => h.placement === placement).flatMap(withAccessory);

    const legs = layer(maskForView(legsMasks, o), skin, 2, 13);
    const torso = layer(maskForView(torsoMasks, o), skin, 2, 6);
    const arms = layer(maskForView(armsMasks, o), skin, 0, 6);
    // Loose hair frames the face, so the head has no outline where it sits against that hair.
    const head: Layer = {
        ...layer(maskForView(headMasks, o), skin, 1, -5),
        ...(isLooseHair(c.backHairStyle) && c.hairLength !== "bald" ? { noOutlineOver: hairBody } : {})
    };
    const inProfile = o === "left" || o === "right";
    // The back of the head has no face. In profile one eye sits near the face side of the head.
    const eyeLayers: Layer[] =
        o === "front"
            ? [{ sprite: eyesSprites.front, slots: eyes, x: 3, y: 1 }]
            : o === "back"
              ? []
              : [{ sprite: eyesSprites.side, slots: eyes, x: o === "right" ? 8 : 4, y: 1 }];

    const layers: Layer[] = [
        ...hairAt("behindBody"),
        ...garmentsAt("behindBody"),
        legs,
        torso,
        // In profile the arm hangs in front of the torso, so it goes over the clothes on the body.
        ...(inProfile ? [] : [arms]),
        ...garmentsAt("overBody"),
        ...(inProfile ? [arms] : []),
        ...garmentsAt("overArms"),
        ...hairAt("behindHead"),
        head,
        ...eyeLayers,
        ...hairAt("front"),
        ...garmentsAt("overlay"),
        ...hairAt("top")
    ];

    // Bounds include every candidate layer (even pose-hidden ones) and the front-view body, so the
    // avatar keeps the same size and alignment across poses and when it turns.
    const bounds = layerBounds([
        layer(maskForView(legsMasks, "front"), skin, 2, 13),
        layer(maskForView(torsoMasks, "front"), skin, 2, 6),
        layer(maskForView(armsMasks, "front"), skin, 0, 6),
        layer(maskForView(headMasks, "front"), skin, 1, -5),
        legs,
        torso,
        arms,
        head,
        ...hairLayers.flatMap(withAccessory),
        ...garments.map((g) => layer(g.mask, g.slots, g.offsetX, g.offsetY))
    ]);

    return composeSprites(layers, bounds);
}
