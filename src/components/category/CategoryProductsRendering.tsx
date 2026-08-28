"use client";

import {useCallback, useEffect, useRef, useState} from "react";
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

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
const MOBILE_LIMIT = 24;
const DESKTOP_LIMIT = 25;

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

export default function CategoryProductsRendering({categoryPath}: CategoryProductsRenderingProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [pathError, setPathError] = useState(false);
    const [pageError, setPageError] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(getPageSizeForViewport);
    const [isCompactPagination, setIsCompactPagination] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(max-width: 430px)").matches,
    );

    const loadingRef = useRef(false);
    const productsCountRef = useRef(0);
    const pathRef = useRef(normalizePath(categoryPath));
    const topAnchorRef = useRef<HTMLDivElement | null>(null);

    const loadProducts = useCallback(async (page: number) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                path: pathRef.current,
                page: page.toString(),
                limit: pageSize.toString(),
            });

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/category?${params.toString()}`,
            ).catch(() => null);

            if (!res || !res.ok) {
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

            const apiPage = Number(data?.pagination?.page);
            const apiTotalPages = Number(data?.pagination?.total_pages);
            const nextPage = Number.isFinite(apiPage) && apiPage > 0 ? apiPage : page;
            const nextTotalPages =
                Number.isFinite(apiTotalPages) && apiTotalPages > 0 ? apiTotalPages : nextPage;

            setCurrentPage(nextPage);
            setTotalPages(nextTotalPages);
            setBreadcrumbs(nextBreadcrumbs);
            setProducts(nextProducts);
            setError(false);
            setPathError(false);
            setPageError(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
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
        pathRef.current = normalizePath(categoryPath);
        loadingRef.current = false;

        const id = setTimeout(() => {
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
        if (!error) return;

        const id = setInterval(() => {
            void loadProducts(currentPage);
        }, 20000);

        return () => clearInterval(id);
    }, [currentPage, error, loadProducts]);

    const isInitialLoad = loading && products.length === 0;
    const skeletonCount = 12;
    const pageItems = buildPageItems(currentPage, totalPages, isCompactPagination);

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
        </>
    );
}
