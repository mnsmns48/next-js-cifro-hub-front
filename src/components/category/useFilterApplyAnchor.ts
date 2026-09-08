"use client";

import {useCallback, useEffect, useRef, useState} from "react";

import {MOBILE_MEDIA_QUERY} from "./categoryListing";

export function useFilterApplyAnchor(isMobileViewport: boolean) {
    const [applyAnchor, setApplyAnchor] = useState<{top: number; left: number} | null>(null);
    const applyButtonRef = useRef<HTMLButtonElement | null>(null);
    const applyAnchorElRef = useRef<HTMLElement | null>(null);
    const sidebarRef = useRef<HTMLElement | null>(null);
    const filtersGridRef = useRef<HTMLDivElement | null>(null);

    const hideApplyButton = useCallback(() => {
        applyAnchorElRef.current = null;
        setApplyAnchor(null);
    }, []);

    const syncApplyButtonPosition = useCallback(() => {
        const row = applyAnchorElRef.current;
        const sidebar = sidebarRef.current;
        const grid = filtersGridRef.current;
        if (!row || !sidebar) {
            hideApplyButton();
            return;
        }

        const rowRect = row.getBoundingClientRect();
        const view = (grid ?? sidebar).getBoundingClientRect();
        if (rowRect.bottom < view.top + 8 || rowRect.top > view.bottom - 8) {
            hideApplyButton();
            return;
        }

        const innerRight = view.left + (grid ?? sidebar).clientWidth;
        setApplyAnchor({
            top: rowRect.top + rowRect.height / 2,
            left: innerRight - 8,
        });
    }, [hideApplyButton]);

    const revealApplyButton = useCallback((target: EventTarget | null) => {
        if (typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
            hideApplyButton();
            return;
        }

        if (!(target instanceof HTMLElement)) return;

        const row =
            target.closest("label, .category-products__toggle-row, .category-products__chip") ??
            target;
        if (!(row instanceof HTMLElement)) return;

        applyAnchorElRef.current = row;
        syncApplyButtonPosition();
    }, [hideApplyButton, syncApplyButtonPosition]);

    const visibleApplyAnchor = isMobileViewport ? null : applyAnchor;

    useEffect(() => {
        if (!visibleApplyAnchor) return;

        const sidebar = sidebarRef.current;
        const grid = filtersGridRef.current;
        const onSync = () => syncApplyButtonPosition();
        sidebar?.addEventListener("scroll", onSync, {passive: true});
        grid?.addEventListener("scroll", onSync, {passive: true});
        window.addEventListener("scroll", onSync, {passive: true});
        window.addEventListener("resize", onSync);

        return () => {
            sidebar?.removeEventListener("scroll", onSync);
            grid?.removeEventListener("scroll", onSync);
            window.removeEventListener("scroll", onSync);
            window.removeEventListener("resize", onSync);
        };
    }, [syncApplyButtonPosition, visibleApplyAnchor]);

    return {
        applyAnchor: visibleApplyAnchor,
        applyButtonRef,
        sidebarRef,
        filtersGridRef,
        hideApplyButton,
        revealApplyButton,
    };
}
