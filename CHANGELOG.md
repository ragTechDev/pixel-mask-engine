# Changelog

All notable changes to this package are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/). Before 1.0, a breaking change bumps the
minor version.

To draft the next entry from the commit history, run `pnpm changelog`. See
"Releases" in CLAUDE.md for the full flow.

<!-- next-release -->

## [0.2.0] - 2026-11-07

### Breaking changes
- The `tilePalette` colour array export is removed. Tile art now names its colours, and the fixed palettes are exported as `tilePalettes` and `tileThemes`. Tile colour indices no longer exist.

### Added
- **Worlds.** A tile, block, tileset and map layering: `defineTileSet`, `defineMap`, `buildMap`, `tileAt`, `queryCell` and `mapTileSize`, with the built-in `townTileset` and `houseTileset`. Maps store one character per block, and terrain behaviour (`solid`, `water`, `grass`) is a list of tile ids per tileset.
- **Objects.** Trees, fences, doors, windows, counters, bookshelves, rugs and flowers are shaded sprites placed on a map by tile coordinates: `buildObject`, `objectIds`, `objectInfo` and `objectRamps`. They are drawn as 0/1 silhouettes and shaded like avatar parts, and carry their own footprint and behaviour (solid, door, counter).
- **29 draft terrain tiles.** Grass, tall grass, path, water, shore, wall, floor, a roof nine-patch, beige pavement edges and corners, and house wall edges. `townTileset` assembles them with phone-keypad block keys (`1`-`9` roof, `A`-`I` pavement, `l h r` and `[ _ ]` wall).
- **Tile palettes.** Fixed palettes `default`, `autumn` and `winter` recolour the whole terrain: `buildTile(id, theme)`, `buildMap(map, theme)` and `<Tile theme>`. Unknown names fall back to `default`.
- The demo is split into an Avatar tab and a World tab with a palette switcher.

### Changed
- Tiles are drawn as 0/1 layers painted in named colours, like avatar parts. Edge and corner tiles are composed from shared edge strips instead of being separate art.
- The shore, four roof corners and two wall base corners differ slightly from earlier drafts. Every other tile is pixel-identical.
- Release notes now come from this file, and the release workflow checks that a section exists for the version before publishing.

### Security
- The dev-only esbuild dependency is pinned to 0.28.1 or newer (GHSA-g7r4-m6w7-qqqr, the dev server on Windows). It is not shipped in the package.

## [0.1.1] - 2026-11-06

- First release published from GitHub Actions with npm trusted publishing and a provenance attestation.

## [0.1.0] - 2026-11-06

- Initial release: avatar and tile rendering core, canvas and React entry points, MIT licence for code and CC BY 4.0 for art.
