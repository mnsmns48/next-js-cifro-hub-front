"use client";

import {useEffect, useRef, useState, type RefObject} from "react";
import {SearchOutlined} from "@ant-design/icons";

import {
    BRAND_CHIP_PREVIEW,
    CHIP_PREVIEW,
    FILTER_LIST_PREVIEW,
    PRICE_OPTIONS_PREVIEW,
    filterExpandKey,
    getDisplayLabel,
    getFilterValueMeta,
    getPricePlaceholders,
    getValueKey,
    hasSelectedFilters,
    isBooleanFilter,
    isBrandFilter,
    isColorFilter,
    isDeviceModelFilter,
    isPriceFilter,
    valueMatchesQuery,
    type ApiFilter,
    type FilterKind,
    type FilterValue,
    type VisualFilter,
} from "./categoryListing";
import {useFilterApplyAnchor} from "./useFilterApplyAnchor";

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
    const [modelResetInView, setModelResetInView] = useState(true);
    const modelResetRef = useRef<HTMLButtonElement | null>(null);
    const {
        applyAnchor,
        applyButtonRef,
        sidebarRef,
        filtersGridRef,
        hideApplyButton,
        revealApplyButton,
    } = useFilterApplyAnchor(isMobileViewport);

    const anySelected = hasSelectedFilters(selectedFilters);
    const hasModelFilter = visualFilters.some((entry) => isDeviceModelFilter(entry.filter));
    const showResetDock = anySelected && !isMobileViewport && (!hasModelFilter || !modelResetInView);

    useEffect(() => {
        if (!anySelected || isMobileViewport || !hasModelFilter) return;

        const target = modelResetRef.current;
        const root = filtersGridRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setModelResetInView(Boolean(entry?.isIntersecting));
            },
            {root, threshold: 0},
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [anySelected, filtersGridRef, hasModelFilter, isMobileViewport, visualFilters.length]);

    useEffect(() => {
        if (!applyAnchor) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (applyButtonRef.current?.contains(target)) return;
            if (target instanceof Element && target.closest(".category-products__filters")) return;
            onDiscardDraft();
            hideApplyButton();
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [applyAnchor, applyButtonRef, hideApplyButton, onDiscardDraft]);

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
                        {visualFilters.map((entry) => (
                            <FilterGroup
                                key={filterExpandKey(entry.kind, entry.filter.key)}
                                entry={entry}
                                selectedValues={selectedFilters[entry.filter.key] ?? []}
                                expanded={Boolean(expandedFilters[filterExpandKey(entry.kind, entry.filter.key)])}
                                query={filterQueries[filterExpandKey(entry.kind, entry.filter.key)] ?? ""}
                                isMobileViewport={isMobileViewport}
                                anySelected={anySelected}
                                modelResetRef={modelResetRef}
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
                                revealApplyButton={revealApplyButton}
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
        </>
    );
}

function FilterGroup({
    entry,
    selectedValues,
    expanded,
    query,
    isMobileViewport,
    anySelected,
    modelResetRef,
    onQueryChange,
    onToggleExpanded,
    onToggleValue,
    onSelectSingle,
    onClearAll,
    revealApplyButton,
}: {
    entry: VisualFilter;
    selectedValues: string[];
    expanded: boolean;
    query: string;
    isMobileViewport: boolean;
    anySelected: boolean;
    modelResetRef: RefObject<HTMLButtonElement | null>;
    onQueryChange: (expandKey: string, value: string) => void;
    onToggleExpanded: (expandKey: string) => void;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    onSelectSingle: (filterKey: string, valueKey: string | null) => void;
    onClearAll: () => void;
    revealApplyButton: (target: EventTarget | null) => void;
}) {
    const {kind, filter, values} = entry;
    const isPrice = isPriceFilter(filter);
    const isBoolean = isBooleanFilter(filter, values);
    const isBrand = isBrandFilter(filter);
    const isColor = isColorFilter(filter);
    const expandKey = filterExpandKey(kind, filter.key);
    const hasQuery = query.trim().length > 0;
    const matchedValues = hasQuery
        ? values.filter((value) => valueMatchesQuery(filter, value, query))
        : values;
    const showSearch = kind !== "model" && !isPrice && !isBoolean;
    const showModelReset = isDeviceModelFilter(filter) && anySelected;
    const useChipList = isMobileViewport && !isColor;
    const listPreviewCount = useChipList
        ? (isBrand ? BRAND_CHIP_PREVIEW : CHIP_PREVIEW)
        : FILTER_LIST_PREVIEW;
    const canExpand = isPrice || isBoolean || hasQuery
        ? false
        : values.length > listPreviewCount;

    if (isBoolean) {
        return (
            <section className="category-products__filter-group">
                <BooleanFilter
                    kind={kind}
                    filter={filter}
                    values={values}
                    selectedValues={selectedValues}
                    onToggleValue={onToggleValue}
                    revealApplyButton={revealApplyButton}
                />
            </section>
        );
    }

    return (
        <section className="category-products__filter-group">
            <div className="category-products__filter-head">
                <h4>{filter.label}</h4>
                {(showModelReset || (useChipList && canExpand)) && (
                    <div className="category-products__filter-head-actions">
                        {showModelReset && (
                            <button
                                ref={modelResetRef}
                                type="button"
                                className="category-products__filter-reset"
                                onClick={onClearAll}
                            >
                                Сбросить все
                            </button>
                        )}
                        {useChipList && canExpand && (
                            <button
                                type="button"
                                className="category-products__filter-all"
                                onClick={() => onToggleExpanded(expandKey)}
                            >
                                {expanded ? "Скрыть" : "Все"}
                            </button>
                        )}
                    </div>
                )}
            </div>
            {showSearch ? (
                <label className="category-products__filter-search">
                    <input
                        type="text"
                        value={query}
                        placeholder="Искать..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-label={`Искать в фильтре ${filter.label}`}
                        onChange={(event) => onQueryChange(expandKey, event.target.value)}
                    />
                    <SearchOutlined className="category-products__filter-search-icon" aria-hidden/>
                </label>
            ) : null}
            {isPrice
                ? (
                    <PriceFilter
                        kind={kind}
                        filter={filter}
                        values={values}
                        selectedValues={selectedValues}
                        placeholders={getPricePlaceholders(values)}
                        onSelectSingle={onSelectSingle}
                        revealApplyButton={revealApplyButton}
                    />
                )
                : hasQuery && matchedValues.length === 0
                    ? <p className="category-products__filter-empty">Ничего не найдено</p>
                    : useChipList
                        ? (
                            <ChipList
                                kind={kind}
                                filter={filter}
                                values={matchedValues}
                                selectedValues={selectedValues}
                                expanded={expanded}
                                showAll={hasQuery}
                                onToggleValue={onToggleValue}
                                revealApplyButton={revealApplyButton}
                            />
                        )
                        : (
                            <CheckList
                                kind={kind}
                                filter={filter}
                                values={matchedValues}
                                selectedValues={selectedValues}
                                expanded={expanded}
                                showAll={hasQuery}
                                onToggleExpanded={() => onToggleExpanded(expandKey)}
                                onToggleValue={onToggleValue}
                                revealApplyButton={revealApplyButton}
                            />
                        )}
        </section>
    );
}

function ChipList({
    kind,
    filter,
    values,
    selectedValues,
    expanded,
    showAll,
    onToggleValue,
    revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    expanded: boolean;
    showAll: boolean;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    revealApplyButton: (target: EventTarget | null) => void;
}) {
    const previewCount = isBrandFilter(filter) ? BRAND_CHIP_PREVIEW : CHIP_PREVIEW;
    const visibleValues = showAll || expanded ? values : values.slice(0, previewCount);

    return (
        <div
            className={`category-products__chips${isBrandFilter(filter) ? " category-products__chips--brands" : ""}`}
            role="group"
            aria-label={filter.label}
        >
            {visibleValues.map((value) => {
                const valueMeta = getFilterValueMeta(value);
                if (!valueMeta) return null;

                const displayLabel = getDisplayLabel(filter, valueMeta.label);
                const valueKey = getValueKey(kind, value, valueMeta.label);
                const pressed = selectedValues.includes(valueKey);

                return (
                    <button
                        key={valueKey}
                        type="button"
                        aria-pressed={pressed}
                        className={`category-products__chip${pressed ? " category-products__chip--active" : ""}`}
                        onClick={(event) => {
                            onToggleValue(filter.key, valueKey, !pressed);
                            revealApplyButton(event.currentTarget);
                        }}
                    >
                        {displayLabel}
                    </button>
                );
            })}
        </div>
    );
}

function CheckList({
    kind,
    filter,
    values,
    selectedValues,
    expanded,
    showAll,
    onToggleExpanded,
    onToggleValue,
    revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    expanded: boolean;
    showAll: boolean;
    onToggleExpanded: () => void;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    revealApplyButton: (target: EventTarget | null) => void;
}) {
    const visibleValues = showAll || expanded ? values : values.slice(0, FILTER_LIST_PREVIEW);
    const canExpand = !showAll && values.length > FILTER_LIST_PREVIEW;

    return (
        <>
            <div className="category-products__check-list" role="group" aria-label={filter.label}>
                {visibleValues.map((value) => {
                    const valueMeta = getFilterValueMeta(value);
                    if (!valueMeta) return null;

                    const displayLabel = getDisplayLabel(filter, valueMeta.label);
                    const valueKey = getValueKey(kind, value, valueMeta.label);
                    const checked = selectedValues.includes(valueKey);

                    return (
                        <label key={valueKey} className="category-products__check">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                    onToggleValue(filter.key, valueKey, event.target.checked);
                                    revealApplyButton(event.currentTarget);
                                }}
                            />
                            <span>{displayLabel}</span>
                        </label>
                    );
                })}
            </div>
            {canExpand && (
                <button type="button" className="category-products__filter-more" onClick={onToggleExpanded}>
                    {expanded ? "Скрыть" : "Посмотреть все"}
                </button>
            )}
        </>
    );
}

function PriceFilter({
    kind,
    filter,
    values,
    selectedValues,
    placeholders,
    onSelectSingle,
    revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    placeholders: {from: string; to: string};
    onSelectSingle: (filterKey: string, valueKey: string | null) => void;
    revealApplyButton: (target: EventTarget | null) => void;
}) {
    const radioName = `filter-price-${kind}-${filter.key}`;

    return (
        <>
            <div className="category-products__price-range">
                <input type="text" readOnly value={placeholders.from}/>
                <input type="text" readOnly value={placeholders.to}/>
            </div>
            <div className="category-products__radio-list" role="radiogroup" aria-label={filter.label}>
                {values.slice(0, PRICE_OPTIONS_PREVIEW).map((value) => {
                    const valueMeta = getFilterValueMeta(value);
                    if (!valueMeta) return null;

                    const valueKey = getValueKey(kind, value, valueMeta.label);
                    const checked = selectedValues.includes(valueKey);

                    return (
                        <label key={valueKey} className="category-products__radio">
                            <input
                                type="radio"
                                name={radioName}
                                checked={checked}
                                onChange={(event) => {
                                    onSelectSingle(filter.key, valueKey);
                                    revealApplyButton(event.currentTarget);
                                }}
                            />
                            <span>{valueMeta.label}</span>
                        </label>
                    );
                })}
                <label className="category-products__radio">
                    <input
                        type="radio"
                        name={radioName}
                        checked={selectedValues.length === 0}
                        onChange={(event) => {
                            onSelectSingle(filter.key, null);
                            revealApplyButton(event.currentTarget);
                        }}
                    />
                    <span>Неважно</span>
                </label>
            </div>
        </>
    );
}

function BooleanFilter({
    kind,
    filter,
    values,
    selectedValues,
    onToggleValue,
    revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    revealApplyButton: (target: EventTarget | null) => void;
}) {
    const value = values[0];
    const valueMeta = value ? getFilterValueMeta(value) : null;
    const valueKey = value ? getValueKey(kind, value, valueMeta?.label ?? "1") : "1";
    const on = selectedValues.includes(valueKey);

    return (
        <div className="category-products__toggle-row">
            <h4>{filter.label}</h4>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                className={`category-products__toggle${on ? " category-products__toggle--on" : ""}`}
                onClick={(event) => {
                    onToggleValue(filter.key, valueKey, !on);
                    revealApplyButton(event.currentTarget);
                }}
            />
        </div>
    );
}
