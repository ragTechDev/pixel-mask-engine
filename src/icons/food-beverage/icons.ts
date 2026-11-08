import type { IconParts } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { basketMask } from "./basket/basket.mask";
import { basketWeave } from "./basket/basketWeave.mask";
import { loafMask } from "./basket/loaf.mask";
import { jarBody } from "./jar/body.mask";
import { jarJam } from "./jar/jam.mask";
import { jarLid } from "./jar/lid.mask";

export const foodBeverageIcons = {
    // A basket of bread, passed hand to hand.
    basket: [
        { shaded: loafMask, ramp: iconRamps.bread, x: 2, y: 0 },
        { shaded: basketMask, ramp: iconRamps.wicker, x: 0, y: 4 },
        { flat: basketWeave, color: iconInk.dark, x: 2, y: 7 }
    ],
    jar: [
        { shaded: jarBody, ramp: iconRamps.glass, x: 0, y: 2 },
        { shaded: jarJam, ramp: iconRamps.heart, x: 2, y: 5 },
        { shaded: jarLid, ramp: iconRamps.gold, x: 1, y: 0 }
    ]
} as const satisfies IconParts;
