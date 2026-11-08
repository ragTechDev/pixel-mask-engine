import { accountIcons } from "./account/icons";
import { actionsIcons } from "./actions/icons";
import { buildingsIcons } from "./buildings/icons";
import { communicationIcons } from "./communication/icons";
import { designIcons } from "./design/icons";
import { filesIcons } from "./files/icons";
import { foodBeverageIcons } from "./food-beverage/icons";
import { navigationIcons } from "./navigation/icons";
import { socialIcons } from "./social/icons";

/**
 * Icon parts grouped by category, named after the lucide.dev categories. A faded
 * variant is registered next to its icon as `<id>_idle`; `buildIcon(id, { idle: true })` finds it.
 */
export const iconTables = {
    account: accountIcons,
    actions: actionsIcons,
    buildings: buildingsIcons,
    communication: communicationIcons,
    design: designIcons,
    files: filesIcons,
    "food-beverage": foodBeverageIcons,
    navigation: navigationIcons,
    social: socialIcons
} as const;

export type IconCategory = keyof typeof iconTables;
