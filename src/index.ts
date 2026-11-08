// Core entry: pure TypeScript, no React, no DOM.
export * from "./avatar/styles";
export * from "./core/palette";
export {
    buildAvatar,
    avatarKey,
    resolveAvatarConfig,
    defaultAvatarConfig,
    pieceColorFields,
    type PieceColorField,
    type ResolvedAvatarConfig,
    type AvatarConfig,
    type HeadOrientation
} from "./avatar/buildAvatar";
export { buildTile, tileIds } from "./world/tiles";
export { TILE_SIZE } from "./world/size";
export { tilePalettes, tileThemes, defaultTileTheme, tileColorGroups, type TileColor, type TileColors, type TileColorGroup, type TileTheme } from "./world/tiles/palettes";
export type { TileId, RoadTileId, TownTileId, ObjectId } from "./world/types";
export { defineTileSet, type Block, type TileSet, type TileSetDefinition } from "./world/tileset";
export { defineMap, buildMap, tileAt, queryCell, mapTileSize, type TileMap, type CellInfo, type PlacedObject } from "./world/map";
export { buildObject, objectIds, objectInfo, objectColors, colorableObjectIds, seasonalObjectIds, type ObjectInfo } from "./world/objects/objects";
export { objectRamps, type ObjectRampId } from "./world/objects/ramps";
export { townTileset } from "./world/tilesets/town";
export { houseTileset } from "./world/tilesets/house";
export type { Raster } from "./core/compose";
export type { Ramp } from "./core/sprite";
export { configKey, createCache, type Cache } from "./core/cache";
export { toSvg, toSvgPaths, toSvgDataUrl } from "./core/svg";
export { ICON_SIZE, iconIds, idleIconIds, colorableIconIds, iconColors, iconCategories, buildIcon, type IconColor, type IconId, type IconOptions } from "./icons/icons";
export { colorRamps, type ColorName } from "./core/colors";
export { parseHex, type HexColor } from "./core/customColor";
export type { IconCategory } from "./icons/categories";
export { iconRamps, iconInk } from "./icons/ramps";
export { toVariant, toMapVariant, variantSizes, colorDepths, palettePresets, paletteNames, type PalettePreset, type VariantOptions, type VariantSize, type ColorDepth } from "./core/variant";
