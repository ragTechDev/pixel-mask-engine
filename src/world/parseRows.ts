export const TILE_SIZE = 16;

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * Parses a tile drawn as text into palette indices. `.` is transparent and the
 * characters `1-9` then `a-z` are palette slots 1 to 35. This keeps masks
 * readable and easy to review in diffs.
 */
export function parseRows(rows: readonly string[]): number[][] {
    if (rows.length !== TILE_SIZE) throw new Error(`Tile must have ${TILE_SIZE} rows, got ${rows.length}`);
    return rows.map((row, y) => {
        if (row.length !== TILE_SIZE) throw new Error(`Tile row ${y} must be ${TILE_SIZE} wide, got ${row.length}`);
        return Array.from(row, (ch) => {
            if (ch === ".") return 0;
            const index = DIGITS.indexOf(ch);
            if (index < 1) throw new Error(`Bad tile character "${ch}" in row ${y}`);
            return index;
        });
    });
}
