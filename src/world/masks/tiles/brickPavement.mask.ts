// 16×16 tile. Characters are slots of tilePalette (src/world/tiles.ts); "." is transparent.
// Classic running-bond brick layout. Each brick is 7 wide and 3 tall.
// Mortar joints (palette character 9) at column 7 for normal rows, columns 3 and 11
// for offset rows. Full mortar rows at y = 3, 7, 11, 15.
export const brickPavementMask = [
    "8a8888898a888888",
    "8888888988888888",
    "8888888988888888",
    "9999999999999999",
    "8a8988a88898a888",
    "8889888888988888",
    "8889888888988888",
    "9999999999999999",
    "8a8888898a888888",
    "8888888988888888",
    "8888888988888888",
    "9999999999999999",
    "8a8988a88898a888",
    "8889888888988888",
    "8889888888988888",
    "9999999999999999"
];
