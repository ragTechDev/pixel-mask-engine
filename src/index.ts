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
export type { TileId } from "./world/types";
export type { Raster } from "./core/compose";
export type { Ramp } from "./core/sprite";
export { configKey, createCache, type Cache } from "./core/cache";
export { toSvg, toSvgPaths, toSvgDataUrl } from "./core/svg";
