import { useMemo } from "react";
import { avatarKey, buildAvatar, buildIcon, buildMap, buildObject, buildTile, createCache, toMapVariant, toSvgPaths, toVariant } from "../index";
import type { AvatarConfig, ColorName, HexColor, IconId, IconOptions, ObjectId, Raster, TileId, TileMap, TileColors, TileTheme, VariantOptions } from "../index";

const avatarCache = createCache<Raster>(512);

type ImageProps = VariantOptions & { pixelSize?: number; className?: string; title?: string };

/** Renders a raster as SVG (one path per colour). */
export function PixelImage({ raster: source, pixelSize = 4, className, title, size, bits, palette }: ImageProps & { raster: Raster }) {
    const raster = toVariant(source, { size, bits, palette });
    const paths = useMemo(() => toSvgPaths(raster), [raster]);
    return (
        <svg
            className={className}
            width={raster.width * pixelSize}
            height={raster.height * pixelSize}
            viewBox={`0 0 ${raster.width} ${raster.height}`}
            shapeRendering="crispEdges"
            style={{ display: "block", imageRendering: "pixelated" }}
            role={title ? "img" : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
        >
            {paths.map((p) => (
                <path key={p.fill} fill={p.fill} d={p.d} />
            ))}
        </svg>
    );
}

export type AvatarProps = AvatarConfig & ImageProps;

export function Avatar({ pixelSize, className, title, size, bits, palette, ...config }: AvatarProps) {
    const raster = avatarCache.get(avatarKey(config), () => buildAvatar(config));
    return <PixelImage raster={raster} pixelSize={pixelSize} className={className} title={title} size={size} bits={bits} palette={palette} />;
}

export function Tile({ id, theme, colors, ...rest }: ImageProps & { id: TileId; theme?: TileTheme; colors?: TileColors }) {
    return <PixelImage raster={buildTile(id, theme, colors)} {...rest} />;
}

export function Icon({ id, idle, color, ...rest }: ImageProps & IconOptions & { id: IconId }) {
    return <PixelImage raster={buildIcon(id, { idle, color })} {...rest} />;
}

export function WorldObject({ id, theme, color, ...rest }: ImageProps & { id: ObjectId; theme?: TileTheme; color?: ColorName | HexColor }) {
    return <PixelImage raster={buildObject(id, theme, color)} {...rest} />;
}

/**
 * A whole map. `buildMap` memoises per map object, so keep the `map` reference stable.
 * `size` is the pixels per tile (8 or 16), not the size of the whole map.
 */
export function World({ map, theme, colors, size, bits, palette, ...rest }: ImageProps & { map: TileMap; theme?: TileTheme; colors?: TileColors }) {
    return <PixelImage raster={toMapVariant(buildMap(map, theme, colors), { size, bits, palette })} {...rest} />;
}
