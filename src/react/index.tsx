import { useMemo } from "react";
import { avatarKey, buildAvatar, buildIcon, buildMap, buildObject, buildTile, createCache, toSvgPaths } from "../index";
import type { AvatarConfig, IconId, ObjectId, Raster, TileId, TileMap, TileTheme } from "../index";

const avatarCache = createCache<Raster>(512);

type ImageProps = { pixelSize?: number; className?: string; title?: string };

/** Renders a raster as SVG (one path per colour). */
export function PixelImage({ raster, pixelSize = 4, className, title }: ImageProps & { raster: Raster }) {
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

export function Avatar({ pixelSize, className, title, ...config }: AvatarProps) {
    const raster = avatarCache.get(avatarKey(config), () => buildAvatar(config));
    return <PixelImage raster={raster} pixelSize={pixelSize} className={className} title={title} />;
}

export function Tile({ id, theme, ...rest }: ImageProps & { id: TileId; theme?: TileTheme }) {
    return <PixelImage raster={buildTile(id, theme)} {...rest} />;
}

export function Icon({ id, ...rest }: ImageProps & { id: IconId }) {
    return <PixelImage raster={buildIcon(id)} {...rest} />;
}

export function WorldObject({ id, ...rest }: ImageProps & { id: ObjectId }) {
    return <PixelImage raster={buildObject(id)} {...rest} />;
}

/** A whole map. `buildMap` memoises per map object, so keep the `map` reference stable. */
export function World({ map, theme, ...rest }: ImageProps & { map: TileMap; theme?: TileTheme }) {
    return <PixelImage raster={buildMap(map, theme)} {...rest} />;
}
