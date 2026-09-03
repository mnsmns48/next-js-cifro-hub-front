"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";

import ProductCard, {type ShortSpec} from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ServerError from "@/components/ServerError";

import "../css/ProductGrid.css";
import "../css/CategoryProducts.css";

interface Product {
    id: number;
    origin: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}

interface Breadcrumb {
    id: number;
    label: string;
    slug?: string | null;
}

interface CategoryProductsRenderingProps {
    categoryPath: string;
}

interface SortOption {
    key: string;
    label: string;
}

interface FilterValue {
    id?: number;
    label?: string;
    count?: number | string;
    description?: string;
    subtitle?: string;
    hint?: string;
}

interface ApiFilter {
    key: string;
    label: string;
    type?: string;
    values?: FilterValue[];
    active?: unknown[];
}

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
const COMPACT_PAGINATION_QUERY = "(max-width: 430px)";
const MOBILE_LIMIT = 24;
const DESKTOP_LIMIT = 24;

function normalizePath(path: string): string {
    return path.trim();
}

function getPageSizeForViewport(): number {
    if (typeof window === "undefined") {
        return DESKTOP_LIMIT;
    }

    return window.matchMedia(MOBILE_MEDIA_QUERY).matches ? MOBILE_LIMIT : DESKTOP_LIMIT;
}

function toCatalogHref(slug?: string | null): string {
    const normalized = slug?.trim().replace(/^\/+|\/+$/g, "");
    if (!normalized) return "/catalog";

    const segments = normalized.split("/").filter(Boolean).map(encodeURIComponent);
    return `/catalog/${segments.join("/")}`;
}

function slugSegment(slug?: string | null): string | null {
    const normalized = slug?.trim().replace(/^\/+|\/+$/g, "");
    if (!normalized) return null;
    const parts = normalized.split("/").filter(Boolean);
    return parts.at(-1) ?? null;
}

function buildPageItems(
    currentPage: number,
    totalPages: number,
    compact = false,
): Array<number | "dots-left" | "dots-right"> {
    if (compact) {
        if (totalPages <= 5) {
            return Array.from({length: totalPages}, (_, index) => index + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, "dots-right", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, "dots-left", totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, "dots-left", currentPage, "dots-right", totalPages];
    }

    if (totalPages <= 7) {
        return Array.from({length: totalPages}, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "dots-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [1, "dots-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "dots-left", currentPage - 1, currentPage, currentPage + 1, "dots-right", totalPages];
}

function forceScrollToTop(anchor: HTMLDivElement | null) {
    if (typeof window === "undefined") return;

    const header = document.querySelector(".app-header-wrapper");
    const headerOffset = header instanceof HTMLElement ? header.offsetHeight : 0;
    const extraGap = 8;
    const anchorTop = anchor
        ? anchor.getBoundingClientRect().top + window.scrollY
        : 0;
    const targetTop = Math.max(0, anchorTop - headerOffset - extraGap);

    window.scrollTo({top: targetTop, left: 0, behavior: "auto"});

    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
        main.scrollTo({top: targetTop, left: 0, behavior: "auto"});
    }
}

function getFilterValueMeta(value: FilterValue): {label: string; count: string; subtitle: string} | null {
    const rawLabel = value?.label?.trim();
    if (!rawLabel) return null;

    const rawCount = value.count;
    const countFromField = rawCount === undefined || rawCount === null ? "" : String(rawCount).trim();
    const labelParts = countFromField ? null : rawLabel.match(/^(.*?)(?:\s*\(([\d\s]+)\))$/);

    const label = (labelParts?.[1] ?? rawLabel).trim();
    if (!label) return null;

    const count = (countFromField || labelParts?.[2] || "").trim();
    const subtitle = (value.subtitle || value.description || value.hint || "").trim();

    return {label, count, subtitle};
}

function parseNumber(text: string): number | null {
    const digits = text.replace(/[^\d]/g, "");
    if (!digits) return null;
    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberRu(value: number): string {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function getPricePlaceholders(values: FilterValue[]): {from: string; to: string} {
    const bounds: number[] = [];
    for (const value of values) {
        const raw = value?.label?.trim();
        if (!raw) continue;
        const matches = raw.match(/\d[\d\s]*/g) ?? [];
        for (const match of matches) {
            const numeric = parseNumber(match);
            if (numeric !== null) {
                bounds.push(numeric);
            }
        }
    }

    if (bounds.length === 0) {
        return {from: "от", to: "до"};
    }

    const sorted = [...bounds].sort((a, b) => a - b);
    return {
        from: `от ${formatNumberRu(sorted[0])}`,
        to: `до ${formatNumberRu(sorted[sorted.length - 1])}`,
    };
}

function isResolutionFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key.includes("resolution") || key.includes("razresh") || label.includes("разреш");
}

function isPriceFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key.includes("price") || label.includes("цена");
}

const FILTER_LIST_PREVIEW = 5;
const CHIP_PREVIEW = 8;
const BRAND_CHIP_PREVIEW = 6;

function isColorFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key.includes("color") || key.includes("colour") || key.includes("цвет") || label.includes("цвет");
}

function isBooleanFilter(filter: ApiFilter, values: FilterValue[]): boolean {
    const type = (filter.type ?? "").trim().toLowerCase();
    if (type.includes("bool") || type.includes("toggle") || type.includes("switch")) {
        return values.length >= 1;
    }

    if (values.length !== 1) return false;

    const blob = `${filter.key} ${filter.label} ${values[0]?.label ?? ""}`.toLowerCase();
    return /скидк|discount|новинк|toggle|switch/.test(blob);
}

function isBrandFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key.includes("brand") || label.includes("бренд");
}

function isDeviceModelFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key === "model" || key.includes("device_model") || label.includes("модель");
}

function withModelFilterFirst<T extends {filter: ApiFilter}>(entries: T[]): T[] {
    const index = entries.findIndex((entry) => isDeviceModelFilter(entry.filter));
    if (index <= 0) return entries;

    const next = [...entries];
    const [modelFilter] = next.splice(index, 1);
    next.unshift(modelFilter);
    return next;
}

function capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDisplayLabel(filter: ApiFilter, label: string): string {
    return isBrandFilter(filter) ? capitalizeFirstLetter(label) : label;
}

function getValueKey(value: FilterValue, label: string): string {
    return typeof value.id === "number" ? String(value.id) : label;
}

export default function CategoryProductsRendering({categoryPath}: CategoryProductsRenderingProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [pathError, setPathError] = useState(false);
    const [pageError, setPageError] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [skuFilters, setSkuFilters] = useState<ApiFilter[]>([]);
    const [modelFilters, setModelFilters] = useState<ApiFilter[]>([]);
    const [selectedSkuFilters, setSelectedSkuFilters] = useState<Record<string, string[]>>({});
    const [selectedModelFilters, setSelectedModelFilters] = useState<Record<string, string[]>>({});
    const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
    const [sortActive, setSortActive] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(getPageSizeForViewport);
    const [isCompactPagination, setIsCompactPagination] = useState(
        () => typeof window !== "undefined" && window.matchMedia(COMPACT_PAGINATION_QUERY).matches,
    );
    const [isMobileViewport, setIsMobileViewport] = useState(
        () => typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches,
    );
    const [mobilePanel, setMobilePanel] = useState<"filters" | null>(null);
    const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});

    const productsCountRef = useRef(0);
    const sortRef = useRef("");
    const pathRef = useRef(normalizePath(categoryPath));
    const topAnchorRef = useRef<HTMLDivElement | null>(null);
    const sortMenuRef = useRef<HTMLDetailsElement | null>(null);
    const lockedScrollYRef = useRef(0);
    const requestIdRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadProducts = useCallback(async (page: number) => {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                path: pathRef.current,
                page: page.toString(),
                limit: pageSize.toString(),
            });
            if (sortRef.current) {
                params.set("sort", sortRef.current);
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/category?${params.toString()}`,
                {signal: controller.signal},
            ).catch((err: unknown) => {
                if (
                    err instanceof DOMException &&
                    err.name === "AbortError"
                ) {
                    return null;
                }
                throw err;
            });

            if (requestId !== requestIdRef.current) {
                return;
            }

            if (!res) {
                return;
            }

            if (!res.ok) {
                if (res && (res.status === 400 || res.status === 404)) {
                    setPathError(true);
                    setError(false);
                    setPageError(false);
                    return;
                }

                if (productsCountRef.current === 0 || page === 1) {
                    setError(true);
                } else {
                    setPageError(true);
                }
                setPathError(false);
                return;
            }

            const data = await res.json();
            const nextProducts: Product[] = Array.isArray(data.products) ? data.products : [];
            const nextBreadcrumbs: Breadcrumb[] = Array.isArray(data.breadcrumbs) ? data.breadcrumbs : [];
            const nextSkuFilters: ApiFilter[] = Array.isArray(data?.filters?.sku_filters) ? data.filters.sku_filters : [];
            const nextModelFilters: ApiFilter[] = Array.isArray(data?.filters?.model_filters) ? data.filters.model_filters : [];
            const nextSortOptions: SortOption[] = Array.isArray(data?.sort?.options) ? data.sort.options : [];
            const apiSortActive = typeof data?.sort?.active === "string" ? data.sort.active : "";
            const nextSortActive = nextSortOptions.some((option) => option.key === apiSortActive)
                ? apiSortActive
                : (nextSortOptions[0]?.key ?? "");

            const apiPage = Number(data?.pagination?.page);
            const apiTotalPages = Number(data?.pagination?.total_pages);
            const nextPage = Number.isFinite(apiPage) && apiPage > 0 ? apiPage : page;
            const nextTotalPages =
                Number.isFinite(apiTotalPages) && apiTotalPages > 0 ? apiTotalPages : nextPage;

            if (requestId !== requestIdRef.current) {
                return;
            }

            sortRef.current = nextSortActive;
            setSortOptions(nextSortOptions);
            setSortActive(nextSortActive);
            setSkuFilters(nextSkuFilters);
            setModelFilters(nextModelFilters);
            setCurrentPage(nextPage);
            setTotalPages(nextTotalPages);
            setBreadcrumbs(nextBreadcrumbs);
            setProducts(nextProducts);
            setError(false);
            setPathError(false);
            setPageError(false);
        } catch {
            if (requestId !== requestIdRef.current) {
                return;
            }

            if (productsCountRef.current === 0 || page === 1) {
                setError(true);
            } else {
                setPageError(true);
            }
            setPathError(false);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [pageSize]);

    useEffect(() => {
        productsCountRef.current = products.length;
    }, [products.length]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const updatePageSize = () => setPageSize(mediaQuery.matches ? MOBILE_LIMIT : DESKTOP_LIMIT);

        updatePageSize();
        mediaQuery.addEventListener("change", updatePageSize);
        return () => mediaQuery.removeEventListener("change", updatePageSize);
    }, []);

    useEffect(() => {
        const compactQuery = window.matchMedia("(max-width: 430px)");
        const updateCompact = () => setIsCompactPagination(compactQuery.matches);

        updateCompact();
        compactQuery.addEventListener("change", updateCompact);
        return () => compactQuery.removeEventListener("change", updateCompact);
    }, []);

    useEffect(() => {
        const mobileQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const updateMobile = () => {
            const nextIsMobile = mobileQuery.matches;
            setIsMobileViewport(nextIsMobile);
            if (!nextIsMobile) {
                setMobilePanel(null);
            }
        };
        updateMobile();
        mobileQuery.addEventListener("change", updateMobile);
        return () => mobileQuery.removeEventListener("change", updateMobile);
    }, []);

    useEffect(() => {
        if (!isMobileViewport) return;
        if (!mobilePanel) {
            return;
        }

        const {body} = document;
        lockedScrollYRef.current = window.scrollY;
        body.style.position = "fixed";
        body.style.top = `-${lockedScrollYRef.current}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";

        return () => {
            const scrollY = lockedScrollYRef.current;
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.width = "";
            body.style.overflow = "";
            window.scrollTo(0, scrollY);
        };
    }, [mobilePanel, isMobileViewport]);

    useEffect(() => {
        pathRef.current = normalizePath(categoryPath);
        sortRef.current = "";

        const id = setTimeout(() => {
            setSkuFilters([]);
            setModelFilters([]);
            setSelectedSkuFilters({});
            setSelectedModelFilters({});
            setExpandedFilters({});
            setSortOptions([]);
            setSortActive("");
            setCurrentPage(1);
            setTotalPages(1);
            setProducts([]);
            setBreadcrumbs([]);
            setError(false);
            setPathError(false);
            setPageError(false);
            void loadProducts(1);
        }, 0);

        return () => clearTimeout(id);
    }, [categoryPath, pageSize, loadProducts]);

    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
                sortMenuRef.current.removeAttribute("open");
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    useEffect(() => {
        if (!error) return;

        const id = setInterval(() => {
            void loadProducts(currentPage);
        }, 20000);

        return () => clearInterval(id);
    }, [currentPage, error, loadProducts]);

    const isInitialLoad = loading && products.length === 0;
    const skeletonCount = 12;
    const pageItems = buildPageItems(currentPage, totalPages, isCompactPagination);
    const activeSortLabel = sortOptions.find((option) => option.key === sortActive)?.label ?? "Сортировка";
    const visualFilters = useMemo(() => {
        const byKind = (kind: "sku" | "model", filters: ApiFilter[]) =>
            filters
                .map((filter) => ({
                    kind,
                    filter,
                    values: Array.isArray(filter.values) ? filter.values : [],
                }))
                .filter((entry) => {
                    if (isResolutionFilter(entry.filter) || isColorFilter(entry.filter)) return false;
                    if (isBooleanFilter(entry.filter, entry.values)) return entry.values.length >= 1;
                    return entry.values.length > 1;
                });

        return [
            ...withModelFilterFirst(byKind("sku", skuFilters)),
            ...byKind("model", modelFilters),
        ];
    }, [skuFilters, modelFilters]);
    const hasVisualFilters = visualFilters.length > 0;

    const toggleFilterValue = (
        kind: "sku" | "model",
        filterKey: string,
        valueKey: string,
        checked: boolean,
    ) => {
        const setter = kind === "sku" ? setSelectedSkuFilters : setSelectedModelFilters;
        setter((prev) => {
            const current = prev[filterKey] ?? [];
            const next = checked
                ? [...current, valueKey]
                : current.filter((item) => item !== valueKey);
            return {
                ...prev,
                [filterKey]: next,
            };
        });
    };
    const selectSingleFilterValue = (
        kind: "sku" | "model",
        filterKey: string,
        valueKey: string | null,
    ) => {
        const setter = kind === "sku" ? setSelectedSkuFilters : setSelectedModelFilters;
        setter((prev) => ({
            ...prev,
            [filterKey]: valueKey ? [valueKey] : [],
        }));
    };
    const getSelectedValues = (kind: "sku" | "model", filterKey: string) =>
        kind === "sku" ? (selectedSkuFilters[filterKey] ?? []) : (selectedModelFilters[filterKey] ?? []);

    const renderChipList = (
        kind: "sku" | "model",
        filter: ApiFilter,
        values: FilterValue[],
        selectedValues: string[],
        expanded: boolean,
    ) => {
        const previewCount = isBrandFilter(filter) ? BRAND_CHIP_PREVIEW : CHIP_PREVIEW;
        const visibleValues = expanded ? values.slice(0, 24) : values.slice(0, previewCount);

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
                    const valueKey = getValueKey(value, valueMeta.label);
                    const pressed = selectedValues.includes(valueKey);

                    return (
                        <button
                            key={valueKey}
                            type="button"
                            aria-pressed={pressed}
                            className={`category-products__chip${pressed ? " category-products__chip--active" : ""}`}
                            onClick={() => toggleFilterValue(kind, filter.key, valueKey, !pressed)}
                        >
                            {displayLabel}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderCheckList = (
        kind: "sku" | "model",
        filter: ApiFilter,
        values: FilterValue[],
        selectedValues: string[],
        expanded: boolean,
        onToggleExpanded: () => void,
    ) => {
        const visibleValues = expanded ? values.slice(0, 24) : values.slice(0, FILTER_LIST_PREVIEW);
        const canExpand = values.length > FILTER_LIST_PREVIEW;

        return (
            <>
                <div className="category-products__check-list" role="group" aria-label={filter.label}>
                    {visibleValues.map((value) => {
                        const valueMeta = getFilterValueMeta(value);
                        if (!valueMeta) return null;

                        const displayLabel = getDisplayLabel(filter, valueMeta.label);
                        const valueKey = getValueKey(value, valueMeta.label);
                        const checked = selectedValues.includes(valueKey);

                        return (
                            <label key={valueKey} className="category-products__check">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                        toggleFilterValue(kind, filter.key, valueKey, event.target.checked);
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
    };

    const renderPriceFilter = (
        kind: "sku" | "model",
        filter: ApiFilter,
        values: FilterValue[],
        selectedValues: string[],
        placeholders: {from: string; to: string},
    ) => (
        <>
            <div className="category-products__price-range">
                <input type="text" readOnly value={placeholders.from}/>
                <input type="text" readOnly value={placeholders.to}/>
            </div>
            <div className="category-products__radio-list" role="radiogroup" aria-label={filter.label}>
                {values.slice(0, 12).map((value) => {
                    const valueMeta = getFilterValueMeta(value);
                    if (!valueMeta) return null;

                    const valueKey = getValueKey(value, valueMeta.label);
                    const checked = selectedValues.includes(valueKey);

                    return (
                        <label key={valueKey} className="category-products__radio">
                            <input
                                type="radio"
                                name={`filter-price-${kind}-${filter.key}`}
                                checked={checked}
                                onChange={() => selectSingleFilterValue(kind, filter.key, valueKey)}
                            />
                            <span>{valueMeta.label}</span>
                        </label>
                    );
                })}
                <label className="category-products__radio">
                    <input
                        type="radio"
                        name={`filter-price-${kind}-${filter.key}`}
                        checked={selectedValues.length === 0}
                        onChange={() => selectSingleFilterValue(kind, filter.key, null)}
                    />
                    <span>Неважно</span>
                </label>
            </div>
        </>
    );

    const renderBooleanFilter = (
        kind: "sku" | "model",
        filter: ApiFilter,
        values: FilterValue[],
        selectedValues: string[],
    ) => {
        const value = values[0];
        const valueMeta = value ? getFilterValueMeta(value) : null;
        const valueKey = value ? getValueKey(value, valueMeta?.label ?? "1") : "1";
        const on = selectedValues.includes(valueKey);

        return (
            <div className="category-products__toggle-row">
                <h4>{filter.label}</h4>
                <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    className={`category-products__toggle${on ? " category-products__toggle--on" : ""}`}
                    onClick={() => toggleFilterValue(kind, filter.key, valueKey, !on)}
                />
            </div>
        );
    };

    const handlePageChange = (page: number) => {
        if (loading || page === currentPage || page < 1 || page > totalPages) return;

        forceScrollToTop(topAnchorRef.current);
        void loadProducts(page);
    };

    return (
        <>
            <div ref={topAnchorRef}/>

            {breadcrumbs.length > 0 && (
                <nav className="category-products__breadcrumbs" aria-label="Навигация">
                    {(() => {
                        const chain: string[] = [];

                        return breadcrumbs.map((item, index) => {
                            const segment = slugSegment(item.slug);
                            if (segment) {
                                chain.push(segment);
                            }

                            const href = chain.length > 0 ? toCatalogHref(chain.join("/")) : "/catalog";
                            const hasSlug = Boolean(segment);

                            return (
                                <span key={`${item.id}-${item.label}`}>
                                    {index > 0 ? <span className="category-products__sep">›</span> : null}
                                    {hasSlug ? (
                                        <Link href={href}>{item.label}</Link>
                                    ) : (
                                        <span>{item.label}</span>
                                    )}
                                </span>
                            );
                        });
                    })()}
                </nav>
            )}

            <div className={`category-products__layout${hasVisualFilters && !pathError && !error ? "" : " category-products__layout--no-filters"}`}>
                {!pathError && !error && hasVisualFilters && (
                    <aside
                        className={`category-products__sidebar${isMobileViewport ? " category-products__sidebar--mobile" : ""}${mobilePanel === "filters" ? " category-products__sidebar--open" : ""}`}
                        aria-hidden={isMobileViewport && mobilePanel !== "filters"}
                    >
                        {isMobileViewport && (
                            <button
                                type="button"
                                aria-label="Закрыть фильтры"
                                className="category-products__sidebar-backdrop"
                                onClick={() => setMobilePanel(null)}
                            />
                        )}

                        <section className="category-products__filters" aria-label="Фильтры">
                            {isMobileViewport && (
                                <header className="category-products__filters-mobile-head">
                                    <h3>Фильтры</h3>
                                    <button
                                        type="button"
                                        className="category-products__filters-mobile-cancel"
                                        onClick={() => setMobilePanel(null)}
                                    >
                                        Отмена
                                    </button>
                                </header>
                            )}

                            <div className="category-products__filters-grid">
                                {visualFilters.map(({kind, filter, values}) => {
                                    const isPrice = isPriceFilter(filter);
                                    const isBoolean = isBooleanFilter(filter, values);
                                    const isBrand = isBrandFilter(filter);
                                    const pricePlaceholders = isPrice ? getPricePlaceholders(values) : null;
                                    const selectedValues = getSelectedValues(kind, filter.key);
                                    const expandKey = `${kind}-${filter.key}`;
                                    const expanded = Boolean(expandedFilters[expandKey]);
                                    const listPreviewCount = isMobileViewport
                                        ? (isBrand ? BRAND_CHIP_PREVIEW : CHIP_PREVIEW)
                                        : FILTER_LIST_PREVIEW;
                                    const canExpand = isPrice || isBoolean
                                        ? false
                                        : values.length > listPreviewCount;
                                    const toggleExpanded = () => {
                                        setExpandedFilters((prev) => ({
                                            ...prev,
                                            [expandKey]: !prev[expandKey],
                                        }));
                                    };

                                    if (isBoolean) {
                                        return (
                                            <section key={filter.key} className="category-products__filter-group">
                                                {renderBooleanFilter(kind, filter, values, selectedValues)}
                                            </section>
                                        );
                                    }

                                    return (
                                        <section key={filter.key} className="category-products__filter-group">
                                            <div className="category-products__filter-head">
                                                <h4>{filter.label}</h4>
                                                {isMobileViewport && canExpand && (
                                                    <button
                                                        type="button"
                                                        className="category-products__filter-all"
                                                        onClick={toggleExpanded}
                                                    >
                                                        {expanded ? "Скрыть" : "Все"}
                                                    </button>
                                                )}
                                            </div>
                                            {isPrice && pricePlaceholders
                                                ? renderPriceFilter(kind, filter, values, selectedValues, pricePlaceholders)
                                                : isMobileViewport
                                                    ? renderChipList(kind, filter, values, selectedValues, expanded)
                                                    : renderCheckList(
                                                        kind,
                                                        filter,
                                                        values,
                                                        selectedValues,
                                                        expanded,
                                                        toggleExpanded,
                                                    )}
                                        </section>
                                    );
                                })}
                            </div>

                            {isMobileViewport && (
                                <footer className="category-products__filters-mobile-footer">
                                    <button type="button" onClick={() => setMobilePanel(null)}>
                                        Готово
                                    </button>
                                </footer>
                            )}
                        </section>
                    </aside>
                )}

                <section className="category-products__main">
                    {!pathError && !error && (sortOptions.length > 0 || (hasVisualFilters && isMobileViewport)) && (
                        <section className="category-products__toolbar" aria-label="Сортировка">
                            {isMobileViewport ? (
                                <div className="category-products__mobile-actions">
                                    {hasVisualFilters && (
                                        <button
                                            type="button"
                                            className="category-products__action-btn category-products__action-btn--filter"
                                            aria-expanded={mobilePanel === "filters"}
                                            onClick={() => setMobilePanel("filters")}
                                        >
                                            <span className="category-products__action-filter-icon" aria-hidden/>
                                            <span>Фильтр</span>
                                        </button>
                                    )}
                                    {sortOptions.length > 0 && (
                                        <details className="category-products__sort-menu category-products__sort-menu--mobile" ref={sortMenuRef}>
                                            <summary className="category-products__action-btn category-products__action-btn--sort">
                                                <span className="category-products__action-sort-label">{activeSortLabel}</span>
                                                <span className="category-products__action-caret" aria-hidden/>
                                            </summary>

                                            <div className="category-products__sort-dropdown" role="menu" aria-label="Варианты сортировки">
                                                {sortOptions.map((option) => {
                                                    const isActive = option.key === sortActive;
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
                                                                sortRef.current = option.key;
                                                                setSortActive(option.key);
                                                                setPageError(false);
                                                                sortMenuRef.current?.removeAttribute("open");
                                                                forceScrollToTop(topAnchorRef.current);
                                                                void loadProducts(1);
                                                            }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            ) : sortOptions.length > 0 ? (
                                <details className="category-products__sort-menu" ref={sortMenuRef}>
                                    <summary className="category-products__sort-trigger">
                                        <span className="category-products__sort-trigger-text">
                                            {activeSortLabel}
                                        </span>
                                    </summary>

                                    <div className="category-products__sort-dropdown" role="menu" aria-label="Варианты сортировки">
                                        {sortOptions.map((option) => {
                                            const isActive = option.key === sortActive;
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
                                                        sortRef.current = option.key;
                                                        setSortActive(option.key);
                                                        setPageError(false);
                                                        sortMenuRef.current?.removeAttribute("open");
                                                        forceScrollToTop(topAnchorRef.current);
                                                        void loadProducts(1);
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </details>
                            ) : null}
                        </section>
                    )}

                    {pathError ? (
                        <section className="category-products__path-error">
                            <h2>Категория не найдена</h2>
                            <p>Похоже, путь категории устарел или неполный.</p>
                            <Link href="/catalog">Вернуться в каталог</Link>
                        </section>
                    ) : error ? (
                        <ServerError/>
                    ) : (
                        <>
                            {pageError && (
                                <p className="category-products__page-error">
                                    Не удалось загрузить выбранную страницу. Попробуйте еще раз.
                                </p>
                            )}

                            <div className="product-grid">
                                {products.map((p, index) => (
                                    <ProductCard
                                        key={p.origin}
                                        origin={p.origin}
                                        title={p.title}
                                        price={p.output_price}
                                        preview={p.preview}
                                        pics={p.pics}
                                        shortSpecs={p.short_specs}
                                        priority={index < 8}
                                    />
                                ))}

                                {isInitialLoad &&
                                    Array.from({length: skeletonCount}).map((_, i) => (
                                        <ProductCardSkeleton key={`category-skeleton-${i}`}/>
                                    ))}
                            </div>
                        </>
                    )}

                    {!error && !pathError && totalPages > 1 && (
                        <nav className="category-products__pagination" aria-label="Пагинация категорий">
                            <button
                                type="button"
                                className="category-products__page-btn category-products__page-btn--prev"
                                disabled={loading || currentPage <= 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                {isCompactPagination ? "‹" : "Назад"}
                            </button>

                            <div className="category-products__page-list" aria-label="Номера страниц">
                                {pageItems.map((item) => {
                                    if (typeof item !== "number") {
                                        return (
                                            <span key={item} className="category-products__page-dots" aria-hidden>
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = item === currentPage;
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`category-products__page-number${isActive ? " category-products__page-number--active" : ""}`}
                                            disabled={loading || isActive}
                                            aria-current={isActive ? "page" : undefined}
                                            onClick={() => handlePageChange(item)}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                className="category-products__page-btn category-products__page-btn--next"
                                disabled={loading || currentPage >= totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                {isCompactPagination ? "›" : "Вперед"}
                            </button>
                        </nav>
                    )}
                </section>
            </div>
        </>
    );
}
