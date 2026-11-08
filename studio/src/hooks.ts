import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Width in CSS pixels of the element, kept current as it resizes (rotating a phone, resizing a window). */
export function useWidth<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setWidth(el.clientWidth);
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, width] as const;
}

/** Height in CSS pixels of the element, kept current as it resizes. */
export function useHeight<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setHeight(el.offsetHeight);
        const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, height] as const;
}

/** Whether a CSS media query currently matches, kept current as the window changes. */
export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const media = window.matchMedia(query);
            media.addEventListener("change", onChange);
            return () => media.removeEventListener("change", onChange);
        },
        () => window.matchMedia(query).matches,
        () => false
    );
}
