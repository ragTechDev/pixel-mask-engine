import type { Ramp } from "./sprite";

/**
 * Common colours as fixed four-tone ramps, shared by the colour options of icons and objects.
 * Like every palette in the library they are a fixed table: nothing outside it can be chosen.
 */
export const colorRamps = {
    red: { outline: "#572120", base: "#D9534F", shadow: "#9C3C39", highlight: "#E48784" },
    orange: { outline: "#5D3617", base: "#E8873A", shadow: "#A7612A", highlight: "#EFAB75" },
    yellow: { outline: "#5D4F23", base: "#E8C557", shadow: "#A78E3F", highlight: "#EFD689" },
    green: { outline: "#263E22", base: "#5E9A55", shadow: "#446F3D", highlight: "#8EB888" },
    teal: { outline: "#193E3E", base: "#3E9C9A", shadow: "#2D706F", highlight: "#78BAB8" },
    blue: { outline: "#1E2C42", base: "#4A6FA5", shadow: "#355077", highlight: "#809AC0" },
    purple: { outline: "#372846", base: "#8A63B0", shadow: "#63477F", highlight: "#AD92C8" },
    pink: { outline: "#5C3846", base: "#E58BB0", shadow: "#A5647F", highlight: "#EDAEC8" },
    brown: { outline: "#3E2A1C", base: "#9A6A45", shadow: "#6F4C32", highlight: "#B8977D" },
    grey: { outline: "#383A3D", base: "#8C9099", shadow: "#65686E", highlight: "#AFB1B8" },
    white: { outline: "#62605E", base: "#F4F1EA", shadow: "#B0AEA8", highlight: "#F7F5F0" }
} as const satisfies Record<string, Ramp>;

export type ColorName = keyof typeof colorRamps;
