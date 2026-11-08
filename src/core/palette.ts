import type { Ramp as AutoShadePalette } from "./sprite";

export const skinPalettes = {
    fair: {
        base: "#F7DCC8",
        shadow: "#DEAC88",
        highlight: "#FAE3D0",
        outline: "#7C4F36"
    },
    light: {
        base: "#f2c9a5",
        shadow: "#d69a6b",
        highlight: "#ffe1c6",
        outline: "#7a3f1c"
    },
    tan: {
        base: "#E0AE7F",
        shadow: "#CA8856",
        highlight: "#ECC8A4",
        outline: "#703F22"
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
    },
    deep: {
        base: "#6E4128",
        shadow: "#63331B",
        highlight: "#A88670",
        outline: "#37170B"
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
    },
    red: {
        base: "#B8502A",
        shadow: "#843A1E",
        highlight: "#CD856A",
        outline: "#4A2011"
    },
    auburn: {
        base: "#8A3F2A",
        shadow: "#632D1E",
        highlight: "#AD796A",
        outline: "#371911"
    },
    grey: {
        base: "#A8ADB5",
        shadow: "#797D82",
        highlight: "#C2C6CB",
        outline: "#434548"
    },
    white: {
        base: "#E8E6E0",
        shadow: "#A7A6A1",
        highlight: "#EFEEE9",
        outline: "#5D5C5A"
    },
    pink: {
        base: "#E58BB0",
        shadow: "#A5647F",
        highlight: "#EDAEC8",
        outline: "#5C3846"
    },
    blue: {
        base: "#4F7FC4",
        shadow: "#395B8D",
        highlight: "#84A5D6",
        outline: "#20334E"
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
    },
    brown: {
        base: "#6B4528",
        shadow: "#4D321D",
        highlight: "#977D69",
        outline: "#2B1C10"
    },
    hazel: {
        base: "#8A7A3E",
        shadow: "#63582D",
        highlight: "#ADA278",
        outline: "#373119"
    },
    grey: {
        base: "#7C8794",
        shadow: "#59616B",
        highlight: "#A3ABB4",
        outline: "#32363B"
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
    },
    yellow: {
        base: "#D6B24A",
        shadow: "#9A8035",
        highlight: "#E2C980",
        outline: "#56471E"
    },
    orange: {
        base: "#C97A3A",
        shadow: "#91582A",
        highlight: "#D9A275",
        outline: "#503117"
    },
    purple: {
        base: "#7C5FA0",
        shadow: "#594473",
        highlight: "#A38FBD",
        outline: "#322640"
    },
    pink: {
        base: "#C97A98",
        shadow: "#91586D",
        highlight: "#D9A2B7",
        outline: "#50313D"
    },
    teal: {
        base: "#4A8F8C",
        shadow: "#356765",
        highlight: "#80B1AF",
        outline: "#1E3938"
    },
    white: {
        base: "#E8E4DA",
        shadow: "#A7A49D",
        highlight: "#EFECE5",
        outline: "#5D5B57"
    },
    grey: {
        base: "#7E838C",
        shadow: "#5B5E65",
        highlight: "#A5A8AF",
        outline: "#323438"
    }
} as const satisfies Record<string, AutoShadePalette>;

export type SkinTone = keyof typeof skinPalettes;
export type HairColor = keyof typeof hairPalettes;
export type EyeColor = keyof typeof eyePalettes;
export type ClothesColor = keyof typeof clothesPalettes;
