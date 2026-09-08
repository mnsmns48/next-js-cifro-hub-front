"use client";

import {useEffect, useRef} from "react";

import type {SortOption} from "./categoryListing";

export default function CategorySortMenu({
    options,
    activeKey,
    activeLabel,
    loading,
    variant,
    onSelect,
}: {
    options: SortOption[];
    activeKey: string;
    activeLabel: string;
    loading: boolean;
    variant: "desktop" | "mobile";
    onSelect: (key: string) => void;
}) {
    const menuRef = useRef<HTMLDetailsElement | null>(null);
    const isMobile = variant === "mobile";

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (menuRef.current && !menuRef.current.contains(target)) {
                menuRef.current.removeAttribute("open");
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    return (
        <details
            className={`category-products__sort-menu${isMobile ? " category-products__sort-menu--mobile" : ""}`}
            ref={menuRef}
        >
            {isMobile ? (
                <summary className="category-products__action-btn category-products__action-btn--sort">
                    <span className="category-products__action-sort-label">{activeLabel}</span>
                    <span className="category-products__action-caret" aria-hidden/>
                </summary>
            ) : (
                <summary className="category-products__sort-trigger">
                    <span className="category-products__sort-trigger-text">
                        {activeLabel}
                    </span>
                </summary>
            )}

            <div className="category-products__sort-dropdown" role="menu" aria-label="Варианты сортировки">
                {options.map((option) => {
                    const isActive = option.key === activeKey;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isActive}
                            className={`category-products__sort-option${isActive ? " category-products__sort-option--active" : ""}`}
                            disabled={loading || isActive}
                            onClick={() => {
                                if (isActive) return;
                                menuRef.current?.removeAttribute("open");
                                onSelect(option.key);
                            }}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </details>
    );
}
