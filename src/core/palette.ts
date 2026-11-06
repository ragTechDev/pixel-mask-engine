import type { Ramp as AutoShadePalette } from "./sprite";

export const skinPalettes = {
    light: {
        base: "#f2c9a5",
        shadow: "#d69a6b",
        highlight: "#ffe1c6",
        outline: "#7a3f1c"
    },
    medium: {
        base: "#d39b72",
        shadow: "#ad6f47",
        highlight: "#e8b48d",
        outline: "#603018"
    },
    brown: {
        base: "#9a6038",
        shadow: "#6f4223",
        highlight: "#b67a52",
        outline: "#3d200f"
    }
} as const satisfies Record<string, AutoShadePalette>;

export const hairPalettes = {
    brown: {
        base: "#7d5337",
        shadow: "#523220",
        highlight: "#9c704f",
        outline: "#2d1a0f"
    },
    black: {
        base: "#2d2f33",
        shadow: "#15171a",
        highlight: "#474b51",
        outline: "#07080a"
    },
    blonde: {
        base: "#d5b269",
        shadow: "#a88643",
        highlight: "#e6c882",
        outline: "#6e5523"
    }
} as const satisfies Record<string, AutoShadePalette>;

export const eyePalettes = {
    dark: {
        base: "#2f343b",
        shadow: "#1a1d21",
        highlight: "#4a5563",
        outline: "#090b0f"
    },
    green: {
        base: "#3e5d45",
        shadow: "#24392a",
        highlight: "#58785f",
        outline: "#101b13"
    },
    blue: {
        base: "#3f5f89",
        shadow: "#29405e",
        highlight: "#5e7ba3",
        outline: "#132033"
    }
} as const satisfies Record<string, AutoShadePalette>;

export const clothesPalettes = {
    blue: {
        base: "#6a7da8",
        shadow: "#455275",
        highlight: "#8ea1c9",
        outline: "#232b40"
    },
    red: {
        base: "#9e5656",
        shadow: "#713a3a",
        highlight: "#ba7373",
        outline: "#3f2020"
    },
    green: {
        base: "#5e815f",
        shadow: "#3d5b3f",
        highlight: "#7ea07f",
        outline: "#1f321f"
    }
} as const satisfies Record<string, AutoShadePalette>;

export type SkinTone = keyof typeof skinPalettes;
export type HairColor = keyof typeof hairPalettes;
export type EyeColor = keyof typeof eyePalettes;
export type ClothesColor = keyof typeof clothesPalettes;
