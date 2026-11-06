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
    flower_yellow: { outline: "#7A5E18", base: "#E8C557", shadow: "#C4A23F", highlight: "#F6E39A" }
} as const satisfies Record<string, Ramp>;

export type ObjectRampId = keyof typeof objectRamps;
