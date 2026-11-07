import type { Ramp } from "../core/sprite";

/** Fixed colour ramps for icons. Icons can only use these. */
export const iconRamps = {
    heart: { outline: "#7A2E3A", base: "#E0525F", shadow: "#B53A4A", highlight: "#F4909A" },
    cream: { outline: "#6B5A48", base: "#F7F1E1", shadow: "#DDD2BC", highlight: "#FFFFFF" },
    bread: { outline: "#6E4A1E", base: "#D79A4A", shadow: "#B57A33", highlight: "#EDBB78" },
    wicker: { outline: "#5A3B22", base: "#B98A57", shadow: "#946A3E", highlight: "#D6AB78" },
    dove: { outline: "#5E6470", base: "#EEF0F3", shadow: "#C9CED8", highlight: "#FFFFFF" },
    dove_wing: { outline: "#4F5666", base: "#A9B2C2", shadow: "#8993A6", highlight: "#C9D0DB" },
    /** Faded versions for a state that is switched off. */
    dove_idle: { outline: "#8A8478", base: "#E6E2D6", shadow: "#D1CBBC", highlight: "#F4F1E8" },
    dove_wing_idle: { outline: "#8A8478", base: "#BDB7A8", shadow: "#A8A294", highlight: "#D0CBBE" },
    /** Cream with the same soft outline as the idle bird, for icons that are off or outline-only. */
    cream_soft: { outline: "#8A8478", base: "#F7F1E1", shadow: "#DDD2BC", highlight: "#FFFFFF" },
    cream_idle: { outline: "#8A8478", base: "#EFEBDD", shadow: "#DCD6C4", highlight: "#FAF8F1" }
} as const satisfies Record<string, Ramp>;

/** Flat (unshaded) details drawn over a shaded part. */
export const iconInk = {
    dark: "#5A3B22",
    eye: "#2B2A26",
    beak: "#E8B04A",
    legs: "#5E6470",
    legs_idle: "#8A8478",
    flap: "#B5A58A",
    flap_idle: "#CFC8B6",
    seal: "#C8505A"
} as const;
