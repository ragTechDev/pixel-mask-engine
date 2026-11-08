import { accountIcons } from "./account/icons";
import { buildingsIcons } from "./buildings/icons";
import { communicationIcons } from "./communication/icons";
import { designIcons } from "./design/icons";
import { filesIcons } from "./files/icons";
import { foodBeverageIcons } from "./food-beverage/icons";
import { navigationIcons } from "./navigation/icons";
import { socialIcons } from "./social/icons";

/** Icons grouped by category, named after the lucide.dev categories. */
export const iconCategories = {
    account: accountIcons,
    buildings: buildingsIcons,
    communication: communicationIcons,
    design: designIcons,
    files: filesIcons,
    "food-beverage": foodBeverageIcons,
    navigation: navigationIcons,
    social: socialIcons
} as const;

export type IconCategory = keyof typeof iconCategories;
