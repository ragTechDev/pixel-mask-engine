import { composeSprites, layerBounds, type Layer, type Raster } from "../core/compose";
import { configKey } from "../core/cache";
import type { PixelMask } from "../core/maskUtils";
import { clothesPalettes, eyePalettes, hairPalettes, skinPalettes } from "../core/palette";
import { defineSprite, rampSlots, shadeMask, SLOT, type Sprite } from "../core/sprite";
import { armsMask } from "./masks/arms.mask";
import { eyesMask } from "./masks/eyes.mask";
import { headMasks } from "./masks/head.mask";
import { legsMask } from "./masks/legs.mask";
import { torsoMask } from "./masks/torso.mask";
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
    frontHairStyles,
    resolveHairLayers,
    type BackHairStyle,
    type FrontHairStyle,
    type HairLayer
} from "./styles/hairStyles";
import type { ClothesColor, EyeColor, HairColor, SkinTone } from "../core/palette";

export type HeadOrientation = keyof typeof headMasks;

/** An avatar is fully described by fixed style ids and palette keys. */
export interface AvatarConfig {
    headOrientation?: HeadOrientation;
    skinTone?: SkinTone;
    frontHairStyle?: FrontHairStyle;
    backHairStyle?: BackHairStyle;
    hairColor?: HairColor;
    eyeColor?: EyeColor;
    /** The colour of the clothes. Each piece uses it unless it has a colour of its own below. */
    clothesColor?: ClothesColor;
    /** Colours of single pieces. Left out, a piece follows `clothesColor`. */
    topColor?: ClothesColor;
    bottomColor?: ClothesColor;
    shoeColor?: ClothesColor;
    topStyle?: TopStyle;
    bottomStyle?: BottomStyle;
    shoeStyle?: ShoeStyle;
    armPose?: ArmPose;
    legPose?: LegPose;
}

/** The pieces that can take a colour of their own. */
export const pieceColorFields = ["topColor", "bottomColor", "shoeColor"] as const;
export type PieceColorField = (typeof pieceColorFields)[number];

/** An avatar config with every choice filled in. A piece colour is only there when it differs from `clothesColor`. */
export type ResolvedAvatarConfig = Required<Omit<AvatarConfig, PieceColorField>> & Pick<AvatarConfig, PieceColorField>;

export const defaultAvatarConfig: Readonly<Required<Omit<AvatarConfig, PieceColorField>>> = {
    headOrientation: "front",
    skinTone: "light",
    frontHairStyle: "centerPart",
    backHairStyle: "lowPonytail",
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
    headOrientation: headMasks,
    skinTone: skinPalettes,
    frontHairStyle: frontHairStyles,
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

const eyesSprite = defineSprite(eyesMask, { "1": SLOT.base, H: SLOT.highlight });

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

    const hairLayers: readonly HairLayer[] = resolveHairLayers(c.frontHairStyle, c.backHairStyle, o);
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
    const hairAt = (placement: HairLayer["placement"]) =>
        hairLayers.filter((h) => h.placement === placement).map((h) => layer(h.mask, hair, h.offsetX, h.offsetY));

    const legs = layer(legsMask, skin, 2, 13);
    const torso = layer(torsoMask, skin, 2, 6);
    const arms = layer(armsMask, skin, 0, 6);
    const head = layer(headMasks[o], skin, 1, -5);

    const layers: Layer[] = [
        ...garmentsAt("behindBody"),
        legs,
        torso,
        arms,
        ...garmentsAt("overBody"),
        ...hairAt("behindHead"),
        head,
        { sprite: eyesSprite, slots: eyes, x: 3, y: 1 },
        ...hairAt("front"),
        ...garmentsAt("overlay")
    ];

    // Bounds include every candidate layer (even pose-hidden ones) so the
    // avatar keeps the same size and alignment across poses.
    const bounds = layerBounds([
        legs,
        torso,
        arms,
        head,
        ...hairLayers.map((h) => layer(h.mask, hair, h.offsetX, h.offsetY)),
        ...garments.map((g) => layer(g.mask, g.slots, g.offsetX, g.offsetY))
    ]);

    return composeSprites(layers, bounds);
}
