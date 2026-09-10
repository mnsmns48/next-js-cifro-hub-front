"use client";

import {useRef, type TouchEvent} from "react";

export function useGallerySwipe(canSwipe: boolean, onStep: (delta: number) => void) {
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const suppressClick = useRef(false);

    const onTouchStart = (event: TouchEvent<HTMLElement>) => {
        const touch = event.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        suppressClick.current = false;
    };

    const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
        if (touchStartX.current === null || touchStartY.current === null || !canSwipe) {
            touchStartX.current = null;
            touchStartY.current = null;
            return;
        }

        const touch = event.changedTouches[0];
        const distanceX = touch.clientX - touchStartX.current;
        const distanceY = touch.clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        if (Math.abs(distanceX) < 50 || Math.abs(distanceX) <= Math.abs(distanceY)) return;

        suppressClick.current = true;
        onStep(distanceX < 0 ? 1 : -1);
    };

    const consumeClick = () => {
        if (!suppressClick.current) return false;
        suppressClick.current = false;
        return true;
    };

    return {onTouchStart, onTouchEnd, consumeClick};
}
