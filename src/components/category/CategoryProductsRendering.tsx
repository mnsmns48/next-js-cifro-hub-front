"use client";

import {
    useCallback,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import Link from "next/link";
import {Empty} from "antd";

import ProductCard from "@/components/ProductCard";
import CatalogBreadcrumbs from "@/components/catalog/CatalogBreadcrumbs";
import {readFilterParams} from "@/components/catalog/catalogListingSearch";

import CategoryAppliedFilterChips from "./CategoryAppliedFilterChips";
import CategoryFilters from "./CategoryFilters";
import CategoryPagination from "./CategoryPagination";
import CategorySortMenu from "./CategorySortMenu";

import {
    COMPACT_PAGINATION_QUERY,
    MOBILE_MEDIA_QUERY,
    PRIORITY_CARD_COUNT,
    buildAppliedFilterChips,
    buildVisualFilters,
    scrollListingToTop,
    setSelectedFilterValue,
    toggleSelectedFilter,
    type ParsedCategoryListing, ApiFilter,
} from "./categoryListing";

import {useBodyScrollLock} from "./useBodyScrollLock";
import {useListingSearch} from "./useListingSearch";
import {useMediaQuery} from "./useMediaQuery";

import "../css/ProductGrid.css";
import "../css/CategoryProducts.css";

interface CategoryProductsRenderingProps {
    initialData: ParsedCategoryListing | null;
    initialPathError: boolean;
}

const EMPTY_FILTERS: ApiFilter[] = [];

export default function CategoryProductsRendering({initialData, initialPathError}: CategoryProductsRenderingProps) {
    const {listingSearchRef, replaceListingUrl, urlFilters, urlSort, urlPage} = useListingSearch();
    const isMobileViewport = useMediaQuery(MOBILE_MEDIA_QUERY);
    const isCompactPagination = useMediaQuery(COMPACT_PAGINATION_QUERY);
    const [isPending, startTransition] = useTransition();
    const [draftFilters, setDraftFilters] = useState<Record<string, string[]> | null>(null);
    const [mobilePanel, setMobilePanel] = useState<"filters" | null>(null);
    const topAnchorRef = useRef<HTMLDivElement | null>(null);
    const products = initialData?.products ?? [];
    const breadcrumbs = initialData?.breadcrumbs ?? [];
    const metaFilters = initialData?.metaFilters ?? EMPTY_FILTERS;
    const skuFilters = initialData?.skuFilters ?? EMPTY_FILTERS;
    const modelFilters = initialData?.modelFilters ?? EMPTY_FILTERS;
    const sortOptions = initialData?.sortOptions ?? [];
    const sortActive = initialData?.sortActive ?? "";
    const currentPage = initialData?.page ?? 1;
    const totalPages = initialData?.totalPages ?? 0;
    const pathError = initialPathError;
    const filtersOpen = isMobileViewport && mobilePanel === "filters";
    useBodyScrollLock(filtersOpen);
    const selectedFilters = draftFilters ?? urlFilters;
    const visualFilters = useMemo(() => buildVisualFilters(metaFilters, skuFilters, modelFilters),
        [metaFilters, skuFilters, modelFilters]);
    const hasVisualFilters = visualFilters.length > 0;
    const appliedFilterChips = useMemo(() => buildAppliedFilterChips(
            metaFilters,
            skuFilters,
            modelFilters,
            urlFilters),
        [
            metaFilters,
            skuFilters,
            modelFilters,
            urlFilters,
        ],
    );

    const uiSort = urlSort || sortActive;
    const activeSortLabel = sortOptions.find(
        (option) => option.key === uiSort,
    )?.label ?? "Сортировка";
    const discardDraftFilters = useCallback(() => {
        setDraftFilters(null);
        setMobilePanel(null)
    }, []);

    const navigateListing = (
        action: () => void,
    ) => {
        startTransition(() => {
            action();
        });
    };

    const commitFilters = (
        filters: Record<string, string[]>,
    ) => {
        scrollListingToTop(
            topAnchorRef.current,
        );

        navigateListing(() => {
            replaceListingUrl({
                filters,
                page: 1,
            });
        });
    };

    const applySelectedFilters = () => {
        commitFilters(selectedFilters);
        setMobilePanel(null);
    };

    const currentFilters = () =>
        draftFilters ??
        readFilterParams(
            new URLSearchParams(
                listingSearchRef.current,
            ),
        );

    const toggleFilterValue = (
        filterKey: string,
        valueKey: string,
        checked: boolean,
    ) => {
        const next = toggleSelectedFilter(
            currentFilters(),
            filterKey,
            valueKey,
            checked,
        );

        if (isMobileViewport) {
            setDraftFilters(next);
            return;
        }

        commitFilters(next);
    };

    const selectSingleFilterValue = (
        filterKey: string,
        valueKey: string | null,
    ) => {
        const next = setSelectedFilterValue(
            currentFilters(),
            filterKey,
            valueKey,
        );

        if (isMobileViewport) {
            setDraftFilters(next);
            return;
        }

        commitFilters(next);
    };

    const clearAllSelectedFilters = () => {
        if (isMobileViewport) {
            setDraftFilters({});
            return;
        }

        commitFilters({});
    };

    const removeAppliedFilterValue = (
        filterKey: string,
        valueKey: string,
    ) => {
        commitFilters(
            toggleSelectedFilter(
                urlFilters,
                filterKey,
                valueKey,
                false,
            ),
        );
    };

    const applySort = (sort: string) => {
        scrollListingToTop(
            topAnchorRef.current,
        );

        navigateListing(() => {
            replaceListingUrl({
                sort,
                page: 1,
            });
        });
    };

    const handlePageChange = (
        page: number,
    ) => {
        if (
            isPending ||
            page === currentPage ||
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        scrollListingToTop(
            topAnchorRef.current,
        );

        navigateListing(() => {
            replaceListingUrl({page});
        });
    };

    return (
        <>
            <div ref={topAnchorRef}/>

            {breadcrumbs.length > 0 && (
                <CatalogBreadcrumbs
                    currentLast
                    items={breadcrumbs.map(
                        (item) => ({
                            key: `${item.id}-${item.label}`,
                            label: item.label,
                            slug: item.slug,
                            parent_id: item.parent_id,
                        }),
                    )}
                />
            )}

            <div
                className={
                    `category-products__layout${
                        hasVisualFilters &&
                        !pathError
                            ? ""
                            : " category-products__layout--no-filters"
                    }`
                }
            >
                {!pathError &&
                    hasVisualFilters && (
                        <CategoryFilters visualFilters={visualFilters}
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
                    {!pathError &&
                        (
                            sortOptions.length > 0 ||
                            appliedFilterChips.length > 0 ||
                            (
                                hasVisualFilters &&
                                isMobileViewport
                            )
                        ) && (
                            <section className="category-products__toolbar"
                                     aria-label="Сортировка и фильтры">
                                {isMobileViewport ? (
                                    <div className="category-products__mobile-actions">
                                        {hasVisualFilters && (
                                            <button type="button"
                                                    className="category-products__action-btn category-products__action-btn--filter"
                                                    aria-expanded={filtersOpen}
                                                    onClick={() => setMobilePanel("filters")}>
                                                <span className="category-products__action-filter-icon"
                                                      aria-hidden/>
                                                <span>
                                                    Фильтр
                                                </span>
                                            </button>
                                        )}

                                        {sortOptions.length > 0 && (
                                            <CategorySortMenu variant="mobile" options={sortOptions}
                                                              activeKey={uiSort}
                                                              activeLabel={activeSortLabel}
                                                              loading={isPending}
                                                              onSelect={applySort}/>
                                        )}
                                    </div>
                                ) : sortOptions.length > 0 ? (
                                    <CategorySortMenu
                                        variant="desktop"
                                        options={sortOptions}
                                        activeKey={uiSort}
                                        activeLabel={activeSortLabel}
                                        loading={isPending}
                                        onSelect={applySort}/>
                                ) : null}

                                <CategoryAppliedFilterChips chips={appliedFilterChips}
                                                            onRemove={removeAppliedFilterValue}/>
                            </section>
                        )}

                    {pathError ? (
                        <section className="category-products__path-error">
                            <h2>
                                Категория не найдена
                            </h2>
                            <p>
                                Похоже, путь категории
                                устарел или неполный.
                            </p>
                            <Link href="/catalog">
                                Вернуться в каталог
                            </Link>
                        </section>
                    ) : products.length > 0 ? (
                        <div className="product-grid">
                            {products.map(
                                (p, index) => (
                                    <ProductCard key={p.origin}
                                                 origin={p.origin}
                                                 title={p.title}
                                                 price={p.output_price}
                                                 preview={p.preview}
                                                 pics={p.pics}
                                                 shortSpecs={p.short_specs}
                                                 priority={index < PRIORITY_CARD_COUNT}
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <section className="category-products__empty">
                            <Empty image={Empty.PRESENTED_IMAGE_DEFAULT}
                                   styles={{
                                       image: {
                                           height: 180,
                                       },
                                       description: {
                                           fontSize: 16,
                                       },
                                   }}
                                   description="Товары не найдены"
                            >
                                {urlPage > 1 && (
                                    <button type="button"
                                            onClick={() =>
                                                commitFilters(
                                                    selectedFilters,
                                                )
                                            }
                                    >
                                        На первую страницу
                                    </button>
                                )}
                            </Empty>
                        </section>
                    )}

                    {!pathError && (
                        <CategoryPagination currentPage={currentPage}
                                            totalPages={totalPages}
                                            compact={isCompactPagination}
                                            loading={isPending}
                                            hasItems={products.length > 0}
                                            onPageChange={handlePageChange}
                        />
                    )}
                </section>
            </div>
        </>
    );
}