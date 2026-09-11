"use client";

import {useEffect, useRef, useState} from "react";

import {
    filterExpandKey,
    hasSelectedFilters,
    type VisualFilter,
} from "./categoryListing";
import {useFilterApplyAnchor} from "./useFilterApplyAnchor";
import CategoryFilterGroup from "./CategoryFilterGroup";

// Плавающая кнопка OK на десктопе закомментирована ниже.
// Чтобы вернуть её: раскомментировать applyAnchor / applyButtonRef / revealApplyButton,
// саму кнопку, клик снаружи и вызовы revealApplyButton у значений фильтра.
export default function CategoryFilters({
    visualFilters,
    selectedFilters,
    isMobileViewport,
    mobileOpen,
    onDiscardDraft,
    onApply,
    onToggleValue,
    onSelectSingle,
    onClearAll,
}: {
    visualFilters: VisualFilter[];
    selectedFilters: Record<string, string[]>;
    isMobileViewport: boolean;
    mobileOpen: boolean;
    onDiscardDraft: () => void;
    onApply: () => void;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    onSelectSingle: (filterKey: string, valueKey: string | null) => void;
    onClearAll: () => void;
}) {
    const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
    const [filterQueries, setFilterQueries] = useState<Record<string, string>>({});
    const [resetInView, setResetInView] = useState(true);
    const resetButtonRef = useRef<HTMLButtonElement | null>(null);
    const {
        // Для кнопки OK:
        // applyAnchor,
        // applyButtonRef,
        sidebarRef,
        filtersGridRef,
        hideApplyButton,
        // revealApplyButton,
    } = useFilterApplyAnchor(isMobileViewport);

    const anySelected = hasSelectedFilters(selectedFilters);
    const showResetDock = anySelected && !isMobileViewport && !resetInView;

    useEffect(() => {
        if (!anySelected || isMobileViewport) return;

        const target = resetButtonRef.current;
        const root = filtersGridRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setResetInView(Boolean(entry?.isIntersecting));
            },
            {root, threshold: 0},
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [anySelected, filtersGridRef, isMobileViewport, visualFilters.length]);

    // Кнопка OK: клик вне фильтров сбрасывает неподтверждённый черновик.
    // useEffect(() => {
    //     if (!applyAnchor) return;
    //
    //     const onPointerDown = (event: PointerEvent) => {
    //         const target = event.target;
    //         if (!(target instanceof Node)) return;
    //         if (applyButtonRef.current?.contains(target)) return;
    //         if (target instanceof Element && target.closest(".category-products__filters")) return;
    //         onDiscardDraft();
    //         hideApplyButton();
    //     };
    //
    //     document.addEventListener("pointerdown", onPointerDown);
    //     return () => document.removeEventListener("pointerdown", onPointerDown);
    // }, [applyAnchor, applyButtonRef, hideApplyButton, onDiscardDraft]);

    const discardMobile = () => {
        onDiscardDraft();
        hideApplyButton();
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                className={`category-products__sidebar${isMobileViewport ? " category-products__sidebar--mobile" : ""}${mobileOpen ? " category-products__sidebar--open" : ""}`}
                aria-hidden={isMobileViewport && !mobileOpen}
            >
                {isMobileViewport && (
                    <button
                        type="button"
                        aria-label="Закрыть фильтры"
                        className="category-products__sidebar-backdrop"
                        onClick={discardMobile}
                    />
                )}

                <section className="category-products__filters" aria-label="Фильтры">
                    {isMobileViewport && (
                        <header className="category-products__filters-mobile-head">
                            <h3>Фильтры</h3>
                            <button
                                type="button"
                                className="category-products__filters-mobile-cancel"
                                onClick={discardMobile}
                            >
                                Отмена
                            </button>
                        </header>
                    )}

                    <div ref={filtersGridRef} className="category-products__filters-grid">
                        {visualFilters.map((entry, index) => (
                            <CategoryFilterGroup
                                key={filterExpandKey(entry.kind, entry.filter.key)}
                                entry={entry}
                                selectedValues={selectedFilters[entry.filter.key] ?? []}
                                expanded={Boolean(expandedFilters[filterExpandKey(entry.kind, entry.filter.key)])}
                                query={filterQueries[filterExpandKey(entry.kind, entry.filter.key)] ?? ""}
                                isMobileViewport={isMobileViewport}
                                showReset={anySelected && index === 0}
                                resetButtonRef={resetButtonRef}
                                onQueryChange={(expandKey, nextValue) => {
                                    setFilterQueries((prev) => ({
                                        ...prev,
                                        [expandKey]: nextValue,
                                    }));
                                    hideApplyButton();
                                }}
                                onToggleExpanded={(expandKey) => {
                                    setExpandedFilters((prev) => ({
                                        ...prev,
                                        [expandKey]: !prev[expandKey],
                                    }));
                                    hideApplyButton();
                                }}
                                onToggleValue={onToggleValue}
                                onSelectSingle={onSelectSingle}
                                onClearAll={() => {
                                    hideApplyButton();
                                    onClearAll();
                                }}
                                // Для кнопки OK: revealApplyButton={revealApplyButton}
                            />
                        ))}
                    </div>

                    {showResetDock && (
                        <div className="category-products__filter-reset-dock">
                            <button
                                type="button"
                                className="category-products__filter-reset-btn"
                                onClick={() => {
                                    hideApplyButton();
                                    onClearAll();
                                }}
                            >
                                Сбросить все фильтры
                            </button>
                        </div>
                    )}

                    {isMobileViewport && (
                        <footer className="category-products__filters-mobile-footer">
                            <button type="button" onClick={onApply}>
                                Готово
                            </button>
                        </footer>
                    )}
                </section>
            </aside>

            {/* Кнопка OK: подтверждение рядом со строкой, которую изменили.
            {applyAnchor && !isMobileViewport ? (
                <button
                    ref={applyButtonRef}
                    type="button"
                    className="category-products__apply"
                    style={{top: applyAnchor.top, left: applyAnchor.left}}
                    aria-label="Применить"
                    onClick={() => {
                        hideApplyButton();
                        onApply();
                    }}
                >
                    OK
                </button>
            ) : null}
            */}
        </>
    );
}
