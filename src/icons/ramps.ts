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
    mailbox: { outline: "#243A5C", base: "#4A6FA5", shadow: "#375684", highlight: "#7596C8" },
    coral: { outline: "#7A3E30", base: "#E59A82", shadow: "#C97C65", highlight: "#F2BBA8" },
    glass: { outline: "#3F5F70", base: "#9CC7DB", shadow: "#7FAFC6", highlight: "#D6EBF5" },
    gold: { outline: "#6E5420", base: "#E8C557", shadow: "#C4A23F", highlight: "#F6E39A" },
    roof: { outline: "#5E2F28", base: "#B0604A", shadow: "#864637", highlight: "#CC7E64" },
    brick: { outline: "#3E2830", base: "#8C5A5E", shadow: "#6B4548", highlight: "#A9787C" },
    skin: { outline: "#6B4528", base: "#E0B08A", shadow: "#C2906A", highlight: "#F0C9A8" },
    cloth_green: { outline: "#26402B", base: "#5E8B5A", shadow: "#456B42", highlight: "#85B081" },
    ink_blue: { outline: "#1F2A44", base: "#34507F", shadow: "#263B60", highlight: "#5A78A8" },
    grass: { outline: "#2F4D26", base: "#6E9450", shadow: "#4F7A3E", highlight: "#A8C682" },
    map_paper: { outline: "#6B4528", base: "#EAD9B0", shadow: "#D2BF93", highlight: "#F6EBCB" },
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
    seal: "#C8505A",
    river: "#6FA3C7",
    path: "#B8996D"
} as const;
