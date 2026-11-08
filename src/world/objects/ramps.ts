import type { Ramp } from "../../core/sprite";

/** Fixed colour ramps for world objects. Objects can only use these. */
export const objectRamps = {
    wood: { outline: "#4A2F1D", base: "#A8794E", shadow: "#7A5434", highlight: "#C79A6B" },
    wood_light: { outline: "#6B4528", base: "#C79A6B", shadow: "#A8794E", highlight: "#E0BC91" },
    bark: { outline: "#3B2616", base: "#7A5434", shadow: "#5A3C24", highlight: "#9A7048" },
    leaf: { outline: "#2F4D26", base: "#6E9450", shadow: "#4F7A3E", highlight: "#A8C682" },
    glass: { outline: "#3F5F70", base: "#9CC7DB", shadow: "#7FAFC6", highlight: "#D6EBF5" },
    gold: { outline: "#6E5420", base: "#E8C557", shadow: "#C4A23F", highlight: "#F6E39A" },
    cloth_red: { outline: "#4F1D22", base: "#A8474D", shadow: "#7F3238", highlight: "#C86A70" },
    book_blue: { outline: "#243A5C", base: "#4A6FA5", shadow: "#375684", highlight: "#7596C8" },
    book_red: { outline: "#5A2B30", base: "#B2555B", shadow: "#8A3A40", highlight: "#D07A80" },
    book_green: { outline: "#26402B", base: "#5E8B5A", shadow: "#456B42", highlight: "#85B081" },
    flower_red: { outline: "#7A2E2A", base: "#D9645B", shadow: "#B54A44", highlight: "#EE8D86" },
    flower_yellow: { outline: "#7A5E18", base: "#E8C557", shadow: "#C4A23F", highlight: "#F6E39A" },
    /** Seasonal ramps: leaf and flower colours for the seasons other than summer. */
    leaf_spring: { outline: "#3A5E2C", base: "#8DC25B", shadow: "#6BA444", highlight: "#BEE58A" },
    leaf_autumn: { outline: "#6B2E14", base: "#D2762F", shadow: "#A9561F", highlight: "#EDA45C" },
    leaf_snow: { outline: "#5F7280", base: "#E3ECEE", shadow: "#B9CAD2", highlight: "#FFFFFF" },
    flower_pink: { outline: "#8A3A5E", base: "#EE8FB5", shadow: "#CC6A93", highlight: "#F8BED5" },
    flower_white: { outline: "#8A8478", base: "#FFFFFF", shadow: "#E3DCCB", highlight: "#FFFFFF" },
    flower_orange: { outline: "#7A3A12", base: "#E58A3C", shadow: "#C06A28", highlight: "#F4B070" },
    flower_rust: { outline: "#5A2B18", base: "#A8553A", shadow: "#84402A", highlight: "#C77A5E" },
    flower_frost: { outline: "#5F7280", base: "#EEF4F6", shadow: "#C5D6DD", highlight: "#FFFFFF" },
    flower_ice: { outline: "#4F6E86", base: "#B7D3E4", shadow: "#93B6CD", highlight: "#DCEBF4" }
} as const satisfies Record<string, Ramp>;

export type ObjectRampId = keyof typeof objectRamps;
