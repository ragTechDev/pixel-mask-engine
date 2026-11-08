import type { PixelMask } from "../../core/maskUtils";
import { dot, type IconParts, type Part } from "../parts";
import { iconInk, iconRamps } from "../ramps";
import { doveBody } from "./bird/body.mask";
import { doveLegs } from "./bird/legs.mask";
import { letterBig } from "./bird/letterBig.mask";
import { letterFlapBig } from "./bird/letterFlapBig.mask";
import { letterFlapSmall } from "./bird/letterFlapSmall.mask";
import { letterSmall } from "./bird/letterSmall.mask";
import { doveWing } from "./bird/wing.mask";
import { bubbleMask } from "./comment/bubble.mask";
import { bubbleDots } from "./comment/bubbleDots.mask";
import { envelopeMask } from "./envelope/envelope.mask";
import { envelopeFlap } from "./envelope/flap.mask";
import { mailboxBody } from "./mailbox/body.mask";
import { mailboxFlag } from "./mailbox/flag.mask";
import { mailboxPole } from "./mailbox/pole.mask";
import { mailboxPost } from "./mailbox/post.mask";
import { mailboxSlot } from "./mailbox/slot.mask";
import { sealMask } from "./seal.mask";
import { letterFlapMid } from "./winged-letter/letterFlapMid.mask";
import { letterMid } from "./winged-letter/letterMid.mask";
import { wingLeft } from "./winged-letter/wingLeft.mask";
import { wingRight } from "./winged-letter/wingRight.mask";

const beak: PixelMask = ["11"];

/**
 * A messenger bird carrying a letter. The letter sits behind the bird so the beak holds it. The
 * active icon is in full colour with a wax seal; the idle one is faded and unsealed.
 */
function birdWithLetter(active: boolean): readonly Part[] {
    const bird = active ? iconRamps.dove : iconRamps.dove_idle;
    const wing = active ? iconRamps.dove_wing : iconRamps.dove_wing_idle;
    const letter = active ? iconRamps.cream : iconRamps.cream_idle;
    return [
        { shaded: letterSmall, ramp: letter, x: 10, y: 1 },
        { flat: letterFlapSmall, color: active ? iconInk.flap : iconInk.flap_idle, x: 10, y: 1 },
        ...(active ? [{ flat: sealMask, color: iconInk.seal, x: 12, y: 2 } as Part] : []),
        { shaded: doveBody, ramp: bird, x: 0, y: 0 },
        { shaded: doveWing, ramp: wing, x: 2, y: 3 },
        { flat: doveLegs, color: active ? iconInk.legs : iconInk.legs_idle, x: 5, y: 8 },
        { flat: dot, color: iconInk.eye, x: 8, y: 1 },
        { flat: beak, color: iconInk.beak, x: 11, y: 2 }
    ];
}

export const communicationIcons = {
    comment: [
        { shaded: bubbleMask, ramp: iconRamps.cream_soft, x: 0, y: 0 },
        { flat: bubbleDots, color: iconInk.dark, x: 4, y: 2 }
    ],
    bird_letter: birdWithLetter(true),
    bird_letter_idle: birdWithLetter(false),
    // A bird perched on a sealed letter.
    bird_perch: [
        { shaded: letterBig, ramp: iconRamps.cream, x: 0, y: 9 },
        { flat: letterFlapBig, color: iconInk.flap, x: 0, y: 9 },
        { flat: sealMask, color: iconInk.seal, x: 6, y: 12 },
        { shaded: doveBody, ramp: iconRamps.dove, x: 1, y: 0 },
        { shaded: doveWing, ramp: iconRamps.dove_wing, x: 3, y: 3 },
        { flat: dot, color: iconInk.eye, x: 9, y: 1 },
        { flat: dot, color: iconInk.beak, x: 12, y: 2 }
    ],
    // A sealed letter with a wing on each side.
    winged_letter: [
        { shaded: wingLeft, ramp: iconRamps.dove_wing, x: 0, y: 0 },
        { shaded: wingRight, ramp: iconRamps.dove_wing, x: 13, y: 0 },
        { shaded: letterMid, ramp: iconRamps.cream, x: 4, y: 4 },
        { flat: letterFlapMid, color: iconInk.flap, x: 4, y: 4 },
        { flat: sealMask, color: iconInk.seal, x: 8, y: 7 }
    ],
    envelope: [
        { shaded: envelopeMask, ramp: iconRamps.cream, x: 0, y: 0 },
        { flat: envelopeFlap, color: iconInk.flap, x: 0, y: 0 },
        { flat: sealMask, color: iconInk.seal, x: 6, y: 5 }
    ],
    envelope_idle: [
        { shaded: envelopeMask, ramp: iconRamps.cream_idle, x: 0, y: 0 },
        { flat: envelopeFlap, color: iconInk.flap_idle, x: 0, y: 0 }
    ],
    mailbox: [
        { shaded: mailboxPost, ramp: iconRamps.wicker, x: 6, y: 9 },
        { shaded: mailboxBody, ramp: iconRamps.mailbox, x: 0, y: 3 },
        { flat: mailboxSlot, color: iconInk.eye, x: 4, y: 6 },
        { flat: mailboxPole, color: iconInk.dark, x: 14, y: 1 },
        { shaded: mailboxFlag, ramp: iconRamps.heart, x: 14, y: 0 }
    ]
} as const satisfies IconParts;
