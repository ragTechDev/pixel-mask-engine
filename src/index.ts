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
export { buildTile, tileIds, tilePalette } from "./world/tiles";
export type { TileId, RoadTileId, TownTileId } from "./world/types";
export { defineTileSet, type Block, type TileSet, type TileSetDefinition } from "./world/tileset";
export { defineMap, buildMap, tileAt, queryCell, mapTileSize, type TileMap, type CellInfo } from "./world/map";
export { townTileset } from "./world/tilesets/town";
export { houseTileset } from "./world/tilesets/house";
export type { Raster } from "./core/compose";
export type { Ramp } from "./core/sprite";
export { configKey, createCache, type Cache } from "./core/cache";
export { toSvg, toSvgPaths, toSvgDataUrl } from "./core/svg";
