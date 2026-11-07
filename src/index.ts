// Core entry: pure TypeScript, no React, no DOM.
export * from "./avatar/styles";
export * from "./core/palette";
export {
    buildAvatar,
    avatarKey,
    resolveAvatarConfig,
    defaultAvatarConfig,
    type AvatarConfig,
    type HeadOrientation
} from "./avatar/buildAvatar";
export { buildTile, tileIds } from "./world/tiles";
export { tilePalettes, tileThemes, type TileColor, type TileTheme } from "./world/tiles/palettes";
export type { TileId, RoadTileId, TownTileId, ObjectId } from "./world/types";
export { defineTileSet, type Block, type TileSet, type TileSetDefinition } from "./world/tileset";
export { defineMap, buildMap, tileAt, queryCell, mapTileSize, type TileMap, type CellInfo, type PlacedObject } from "./world/map";
export { buildObject, objectIds, objectInfo, type ObjectInfo } from "./world/objects/objects";
export { objectRamps, type ObjectRampId } from "./world/objects/ramps";
export { townTileset } from "./world/tilesets/town";
export { houseTileset } from "./world/tilesets/house";
export type { Raster } from "./core/compose";
export type { Ramp } from "./core/sprite";
export { configKey, createCache, type Cache } from "./core/cache";
export { toSvg, toSvgPaths, toSvgDataUrl } from "./core/svg";
export { iconIds, iconMask, iconSvg, type IconId } from "./icons/icons";
