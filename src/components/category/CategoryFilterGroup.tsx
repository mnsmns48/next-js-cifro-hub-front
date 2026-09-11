"use client";

import {type RefObject} from "react";
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
    uniqueFilterValues,
    isBooleanFilter,
    isBrandFilter,
    isPriceFilter,
    valueMatchesQuery,
    type ApiFilter,
    type FilterKind,
    type FilterValue,
    type VisualFilter,
} from "./categoryListing";

export default function CategoryFilterGroup({
    entry,
    selectedValues,
    expanded,
    query,
    isMobileViewport,
    showReset,
    resetButtonRef,
    onQueryChange,
    onToggleExpanded,
    onToggleValue,
    onSelectSingle,
    onClearAll,
    // Для кнопки OK: revealApplyButton,
}: {
    entry: VisualFilter;
    selectedValues: string[];
    expanded: boolean;
    query: string;
    isMobileViewport: boolean;
    showReset: boolean;
    resetButtonRef: RefObject<HTMLButtonElement | null>;
    onQueryChange: (expandKey: string, value: string) => void;
    onToggleExpanded: (expandKey: string) => void;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    onSelectSingle: (filterKey: string, valueKey: string | null) => void;
    onClearAll: () => void;
    // Для кнопки OK: revealApplyButton: (target: EventTarget | null) => void;
}) {
    const {kind, filter} = entry;
    const values = uniqueFilterValues(kind, entry.values);
    const isPrice = isPriceFilter(filter);
    const isBoolean = isBooleanFilter(filter, values);
    const isBrand = isBrandFilter(filter);
    const expandKey = filterExpandKey(kind, filter.key);
    const hasQuery = query.trim().length > 0;
    const matchedValues = hasQuery
        ? values.filter((value) => valueMatchesQuery(filter, value, query))
        : values;
    const showSearch = kind !== "model" && !isPrice && !isBoolean;
    const useChipList = isMobileViewport;
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
                    showReset={showReset}
                    resetButtonRef={resetButtonRef}
                    onToggleValue={onToggleValue}
                    onClearAll={onClearAll}
                    // Для кнопки OK: revealApplyButton={revealApplyButton}
                />
            </section>
        );
    }

    return (
        <section className="category-products__filter-group">
            <div className="category-products__filter-head">
                <h4>{filter.label}</h4>
                {(showReset || (useChipList && canExpand)) && (
                    <div className="category-products__filter-head-actions">
                        {showReset && (
                            <button
                                ref={resetButtonRef}
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
                        // Для кнопки OK: revealApplyButton={revealApplyButton}
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
                                // Для кнопки OK: revealApplyButton={revealApplyButton}
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
                                // Для кнопки OK: revealApplyButton={revealApplyButton}
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
    // Для кнопки OK: revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    expanded: boolean;
    showAll: boolean;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    // Для кнопки OK: revealApplyButton: (target: EventTarget | null) => void;
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
                        onClick={() => {
                            onToggleValue(filter.key, valueKey, !pressed);
                            // Для кнопки OK: revealApplyButton(event.currentTarget);
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
    // Для кнопки OK: revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    expanded: boolean;
    showAll: boolean;
    onToggleExpanded: () => void;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    // Для кнопки OK: revealApplyButton: (target: EventTarget | null) => void;
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
                                    // Для кнопки OK: revealApplyButton(event.currentTarget);
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
    // Для кнопки OK: revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    placeholders: {from: string; to: string};
    onSelectSingle: (filterKey: string, valueKey: string | null) => void;
    // Для кнопки OK: revealApplyButton: (target: EventTarget | null) => void;
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
                                onChange={() => {
                                    onSelectSingle(filter.key, valueKey);
                                    // Для кнопки OK: revealApplyButton(event.currentTarget);
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
                        onChange={() => {
                            onSelectSingle(filter.key, null);
                            // Для кнопки OK: revealApplyButton(event.currentTarget);
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
    showReset,
    resetButtonRef,
    onToggleValue,
    onClearAll,
    // Для кнопки OK: revealApplyButton,
}: {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
    selectedValues: string[];
    showReset: boolean;
    resetButtonRef: RefObject<HTMLButtonElement | null>;
    onToggleValue: (filterKey: string, valueKey: string, checked: boolean) => void;
    onClearAll: () => void;
    // Для кнопки OK: revealApplyButton: (target: EventTarget | null) => void;
}) {
    const value = values[0];
    const valueMeta = value ? getFilterValueMeta(value) : null;
    const valueKey = value ? getValueKey(kind, value, valueMeta?.label ?? "1") : "1";
    const on = selectedValues.includes(valueKey);

    return (
        <div className="category-products__toggle-row">
            <h4>{filter.label}</h4>
            {showReset && (
                <button
                    ref={resetButtonRef}
                    type="button"
                    className="category-products__filter-reset"
                    onClick={onClearAll}
                >
                    Сбросить все
                </button>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={on}
                className={`category-products__toggle${on ? " category-products__toggle--on" : ""}`}
                onClick={() => {
                    onToggleValue(filter.key, valueKey, !on);
                    // Для кнопки OK: revealApplyButton(event.currentTarget);
                }}
            />
        </div>
    );
}
