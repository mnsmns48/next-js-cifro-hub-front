"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ServerError from "@/components/ServerError";
import CatalogBreadcrumbs from "@/components/catalog/CatalogBreadcrumbs";
import {applyListingToCategoryParams, parsePageParam} from "@/components/catalog/catalogListingSearch";

import CategoryFilters from "./CategoryFilters";
import CategoryPagination from "./CategoryPagination";
import CategorySortMenu from "./CategorySortMenu";
import {
    COMPACT_PAGINATION_QUERY,
    ERROR_RETRY_MS,
    MOBILE_MEDIA_QUERY,
    PAGE_SIZE,
    PRIORITY_CARD_COUNT,
    SKELETON_COUNT,
    buildVisualFilters,
    isAbortError,
    normalizePath,
    parseCategoryListing,
    scrollListingToTop,
    setSelectedFilterValue,
    toggleSelectedFilter,
    type ApiFilter,
    type Breadcrumb,
    type Product,
    type SortOption,
} from "./categoryListing";
import {useBodyScrollLock} from "./useBodyScrollLock";
import {useListingSearch} from "./useListingSearch";
import {useMediaQuery} from "./useMediaQuery";

import "../css/ProductGrid.css";
import "../css/CategoryProducts.css";

export default function CategoryProductsRendering({categoryPath}: {categoryPath: string}) {
    const {
        listingSearch,
        replaceListingUrl,
        urlFilters,
        urlSort,
        urlPage,
    } = useListingSearch();

    const isMobileViewport = useMediaQuery(MOBILE_MEDIA_QUERY);
    const isCompactPagination = useMediaQuery(COMPACT_PAGINATION_QUERY);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [pathError, setPathError] = useState(false);
    const [pageError, setPageError] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [metaFilters, setMetaFilters] = useState<ApiFilter[]>([]);
    const [skuFilters, setSkuFilters] = useState<ApiFilter[]>([]);
    const [modelFilters, setModelFilters] = useState<ApiFilter[]>([]);
    const [draftFilters, setDraftFilters] = useState<Record<string, string[]> | null>(null);
    const [draftForSearch, setDraftForSearch] = useState(listingSearch);
    const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
    const [sortActive, setSortActive] = useState("");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [totalPages, setTotalPages] = useState(1);
    const [mobilePanel, setMobilePanel] = useState<"filters" | null>(null);

    const productsCountRef = useRef(0);
    const topAnchorRef = useRef<HTMLDivElement | null>(null);
    const requestIdRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const filtersOpen = isMobileViewport && mobilePanel === "filters";
    useBodyScrollLock(filtersOpen);

    if (draftForSearch !== listingSearch) {
        setDraftForSearch(listingSearch);
        setDraftFilters(null);
        setLoading(true);
    }

    const selectedFilters = draftFilters ?? urlFilters;
    const visualFilters = useMemo(
        () => buildVisualFilters(metaFilters, skuFilters, modelFilters),
        [metaFilters, skuFilters, modelFilters],
    );
    const hasVisualFilters = visualFilters.length > 0;
    const uiSort = urlSort || sortActive;
    const activeSortLabel = sortOptions.find((option) => option.key === uiSort)?.label ?? "Сортировка";
    const isInitialLoad = loading && products.length === 0;

    const discardDraftFilters = useCallback(() => {
        setDraftFilters(null);
        setMobilePanel(null);
    }, []);

    const loadProducts = useCallback(async () => {
        const listing = new URLSearchParams(listingSearch);
        const page = parsePageParam(listing.get("page"));
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const fail = () => {
            if (productsCountRef.current === 0 || page === 1) {
                setError(true);
            } else {
                setPageError(true);
            }
            setPathError(false);
        };

        try {
            const params = new URLSearchParams({
                path: normalizePath(categoryPath),
            });
            applyListingToCategoryParams(params, listing, PAGE_SIZE);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/category?${params.toString()}`,
                {signal: controller.signal},
            ).catch((err: unknown) => {
                if (isAbortError(err)) return null;
                throw err;
            });

            if (requestId !== requestIdRef.current || !res) return;

            if (!res.ok) {
                if (res.status === 400 || res.status === 404) {
                    setPathError(true);
                    setError(false);
                    setPageError(false);
                    return;
                }
                fail();
                return;
            }

            const listingData = parseCategoryListing(await res.json(), page);
            if (requestId !== requestIdRef.current) return;

            setSortOptions(listingData.sortOptions);
            setSortActive(listingData.sortActive);
            setMetaFilters(listingData.metaFilters);
            setSkuFilters(listingData.skuFilters);
            setModelFilters(listingData.modelFilters);
            setCurrentPage(listingData.page);
            setTotalPages(listingData.totalPages);
            setBreadcrumbs(listingData.breadcrumbs);
            setProducts(listingData.products);
            setError(false);
            setPathError(false);
            setPageError(false);
        } catch {
            if (requestId !== requestIdRef.current) return;
            fail();
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [categoryPath, listingSearch]);

    useEffect(() => {
        productsCountRef.current = products.length;
    }, [products.length]);

    useEffect(() => {
        // Fetch listing when path or query changes; state updates after the response.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch category listing
        void loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    useEffect(() => {
        if (!error) return;
        const id = setInterval(() => {
            setLoading(true);
            void loadProducts();
        }, ERROR_RETRY_MS);
        return () => clearInterval(id);
    }, [error, loadProducts]);

    const applySelectedFilters = () => {
        replaceListingUrl({filters: selectedFilters, page: 1});
        setPageError(false);
        setMobilePanel(null);
        scrollListingToTop(topAnchorRef.current);
    };

    const toggleFilterValue = (filterKey: string, valueKey: string, checked: boolean) => {
        setDraftFilters((prev) => toggleSelectedFilter(prev ?? urlFilters, filterKey, valueKey, checked));
    };

    const selectSingleFilterValue = (filterKey: string, valueKey: string | null) => {
        setDraftFilters((prev) => setSelectedFilterValue(prev ?? urlFilters, filterKey, valueKey));
    };

    const clearAllSelectedFilters = () => {
        setDraftFilters({});
        setPageError(false);
        scrollListingToTop(topAnchorRef.current);
        replaceListingUrl({filters: {}, page: 1});
    };

    const applySort = (sort: string) => {
        setPageError(false);
        scrollListingToTop(topAnchorRef.current);
        replaceListingUrl({sort, page: 1});
    };

    const handlePageChange = (page: number) => {
        if (loading || page === currentPage || page < 1 || page > totalPages) return;
        scrollListingToTop(topAnchorRef.current);
        replaceListingUrl({page});
    };

    return (
        <>
            <div ref={topAnchorRef}/>

            {breadcrumbs.length > 0 && (
                <CatalogBreadcrumbs
                    currentLast
                    items={breadcrumbs.map((item) => ({
                        key: `${item.id}-${item.label}`,
                        label: item.label,
                        slug: item.slug,
                        parent_id: item.parent_id,
                    }))}
                />
            )}

            <div className={`category-products__layout${hasVisualFilters && !pathError && !error ? "" : " category-products__layout--no-filters"}`}>
                {!pathError && !error && hasVisualFilters && (
                    <CategoryFilters
                        visualFilters={visualFilters}
                        selectedFilters={selectedFilters}
                        isMobileViewport={isMobileViewport}
                        mobileOpen={filtersOpen}
                        onDiscardDraft={discardDraftFilters}
                        onApply={applySelectedFilters}
                        onToggleValue={toggleFilterValue}
                        onSelectSingle={selectSingleFilterValue}
                        onClearAll={clearAllSelectedFilters}
                    />
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
                                            aria-expanded={filtersOpen}
                                            onClick={() => setMobilePanel("filters")}
                                        >
                                            <span className="category-products__action-filter-icon" aria-hidden/>
                                            <span>Фильтр</span>
                                        </button>
                                    )}
                                    {sortOptions.length > 0 && (
                                        <CategorySortMenu
                                            variant="mobile"
                                            options={sortOptions}
                                            activeKey={uiSort}
                                            activeLabel={activeSortLabel}
                                            loading={loading}
                                            onSelect={applySort}
                                        />
                                    )}
                                </div>
                            ) : sortOptions.length > 0 ? (
                                <CategorySortMenu
                                    variant="desktop"
                                    options={sortOptions}
                                    activeKey={uiSort}
                                    activeLabel={activeSortLabel}
                                    loading={loading}
                                    onSelect={applySort}
                                />
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
                                        priority={index < PRIORITY_CARD_COUNT}
                                    />
                                ))}

                                {isInitialLoad &&
                                    Array.from({length: SKELETON_COUNT}).map((_, i) => (
                                        <ProductCardSkeleton key={`category-skeleton-${i}`}/>
                                    ))}
                            </div>
                        </>
                    )}

                    {!error && !pathError && (
                        <CategoryPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            compact={isCompactPagination}
                            loading={loading}
                            onPageChange={handlePageChange}
                        />
                    )}
                </section>
            </div>
        </>
    );
}
