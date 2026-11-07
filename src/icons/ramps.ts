import type { Ramp } from "../core/sprite";

/** Fixed colour ramps for icons. Icons can only use these. */
export const iconRamps = {
    heart: { outline: "#7A2E3A", base: "#E0525F", shadow: "#B53A4A", highlight: "#F4909A" },
    cream: { outline: "#6B5A48", base: "#F7F1E1", shadow: "#DDD2BC", highlight: "#FFFFFF" },
    bread: { outline: "#6E4A1E", base: "#D79A4A", shadow: "#B57A33", highlight: "#EDBB78" },
    wicker: { outline: "#5A3B22", base: "#B98A57", shadow: "#946A3E", highlight: "#D6AB78" }
} as const satisfies Record<string, Ramp>;

/** Flat (unshaded) details drawn over a shaded part. */
export const iconInk = { dark: "#5A3B22" } as const;
