/** Canonical, collision-free cache key for a flat config (key order and undefined values ignored). */
export function configKey(config: Readonly<Record<string, string | number | boolean | undefined>>): string {
    return Object.keys(config)
        .filter((k) => config[k] !== undefined)
        .sort()
        .map((k) => `${k}=${config[k]}`)
        .join(";");
}

export interface Cache<T> {
    get(key: string, build: () => T): T;
    clear(): void;
    readonly size: number;
}

/** Small LRU cache: build each unique key once, reuse it afterwards. */
export function createCache<T>(max = 256): Cache<T> {
    const map = new Map<string, T>();
    return {
        get(key, build) {
            if (map.has(key)) {
                const hit = map.get(key) as T;
                map.delete(key);
                map.set(key, hit);
                return hit;
            }
            const value = build();
            map.set(key, value);
            if (map.size > max) map.delete(map.keys().next().value as string);
            return value;
        },
        clear() {
            map.clear();
        },
        get size() {
            return map.size;
        }
    };
}
