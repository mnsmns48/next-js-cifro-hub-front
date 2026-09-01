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

function isBrandFilter(filter: ApiFilter): boolean {
    const key = filter.key.trim().toLowerCase();
    const label = filter.label.trim().toLowerCase();
    return key.includes("brand") || label.includes("бренд");
}

function capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
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
                .filter((entry) => !isResolutionFilter(entry.filter) && entry.values.length > 1);

        return [...byKind("sku", skuFilters), ...byKind("model", modelFilters)];
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
    const clearVisualFilters = () => {
        setSelectedSkuFilters({});
        setSelectedModelFilters({});
    };
    const hasSelectedFilters =
        Object.values(selectedSkuFilters).some((items) => items.length > 0) ||
        Object.values(selectedModelFilters).some((items) => items.length > 0);

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
                                    <h3>Фильтр</h3>
                                    <div className="category-products__filters-mobile-actions">
                                        <button
                                            type="button"
                                            className="category-products__filters-reset"
                                            disabled={!hasSelectedFilters}
                                            onClick={clearVisualFilters}
                                        >
                                            Сбросить
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Закрыть фильтры"
                                            onClick={() => setMobilePanel(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </header>
                            )}
                            {!isMobileViewport && (
                                <div className="category-products__filters-head">
                                    <div className="category-products__filters-title">
                                        <span className="category-products__action-filter-icon" aria-hidden/>
                                        <span>Фильтры</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="category-products__filters-reset"
                                        disabled={!hasSelectedFilters}
                                        onClick={clearVisualFilters}
                                    >
                                        Сбросить
                                    </button>
                                </div>
                            )}

                            <div className="category-products__filters-grid">
                                {visualFilters.map(({kind, filter, values}) => {
                                    const isPrice = isPriceFilter(filter);
                                    const pricePlaceholders = isPrice ? getPricePlaceholders(values) : null;

                                    const selectedValues =
                                        selectedSkuFilters[filter.key] ??
                                        selectedModelFilters[filter.key] ??
                                        [];

                                    return (
                                        <details key={filter.key} className="category-products__filter-group" open={isPrice}>
                                            <summary>{filter.label}</summary>
                                            {isPrice && pricePlaceholders && (
                                                <div className="category-products__price-range">
                                                    <input type="text" readOnly value={pricePlaceholders.from}/>
                                                    <input type="text" readOnly value={pricePlaceholders.to}/>
                                                </div>
                                            )}
                                            <div className="category-products__filter-values">
                                                {values.slice(0, 24).map((value, idx) => {
                                                    const valueMeta = getFilterValueMeta(value);
                                                    if (!valueMeta) return null;
                                                    const displayLabel = isBrandFilter(filter)
                                                        ? capitalizeFirstLetter(valueMeta.label)
                                                        : valueMeta.label;

                                                    const valueKey = typeof value.id === "number" ? String(value.id) : valueMeta.label;
                                                    const inputId = `filter-${filter.key}-${idx}`;
                                                    const checked = selectedValues.includes(valueKey);

                                                    return (
                                                        <label key={valueKey} htmlFor={inputId} className="category-products__filter-value">
                                                            <input
                                                                id={inputId}
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(event) => {
                                                                    toggleFilterValue(
                                                                        kind,
                                                                        filter.key,
                                                                        valueKey,
                                                                        event.target.checked,
                                                                    );
                                                                }}
                                                            />
                                                            <span className="category-products__filter-value-text">
                                                                <span className="category-products__filter-value-line">
                                                                    <span className="category-products__filter-value-label">{displayLabel}</span>
                                                                    {valueMeta.count && (
                                                                        <span className="category-products__filter-value-count">
                                                                            ({valueMeta.count})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {valueMeta.subtitle && (
                                                                    <span className="category-products__filter-value-subtitle">
                                                                        {valueMeta.subtitle}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
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
