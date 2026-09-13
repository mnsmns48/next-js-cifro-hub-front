"use client";

import {useEffect, useRef, useState} from "react";

import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ServerError from "@/components/ServerError";



import "./css/ProductGrid.css";
import {Product, ProductsResponse} from "../../lib/server/api/product";

interface InfiniteProductRenderingProps {
    menuLevels?: string;
    initialData: ProductsResponse;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

export default function InfiniteProductRendering({menuLevels = "0", initialData,}: InfiniteProductRenderingProps) {
    const [products, setProducts] = useState<Product[]>(initialData.products);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);

    const hasMoreRef = useRef(initialData.has_more);
    const cursorRef = useRef<number | null>(
        initialData.next_cursor,
    );

    const menuLevelsRef = useRef(menuLevels);

    const abortControllerRef =
        useRef<AbortController | null>(null);

    async function loadProducts() {
        if (loadingRef.current) return;
        if (!hasMoreRef.current) return;

        abortControllerRef.current?.abort();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                limit: "24",
                menu_levels: menuLevelsRef.current,
            });

            if (cursorRef.current !== null) {
                params.set(
                    "cursor",
                    cursorRef.current.toString(),
                );
            }

            const res = await fetch(
                `/api3/products?${params.toString()}`,
                {
                    signal: controller.signal,
                },
            );

            if (!res.ok) {
                throw new Error(
                    `Failed to load products: ${res.status}`,
                );
            }

            const data = await res.json();

            if (controller.signal.aborted) {
                return;
            }

            const nextProducts: Product[] =
                Array.isArray(data.products)
                    ? data.products
                    : [];

            setProducts((prev) => {
                const origins = new Set(
                    prev.map((item) => item.origin),
                );

                return [
                    ...prev,
                    ...nextProducts.filter(
                        (item) => !origins.has(item.origin),
                    ),
                ];
            });

            cursorRef.current =
                data.next_cursor ?? null;

            hasMoreRef.current =
                Boolean(data.has_more);

            setError(false);
        } catch (err: unknown) {
            if (
                isAbortError(err) ||
                controller.signal.aborted
            ) {
                return;
            }

            setError(true);
        } finally {
            if (!controller.signal.aborted) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }


    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!error) return;

        const id = setInterval(() => {
            void loadProducts();
        }, 20000);

        return () => clearInterval(id);
    }, [error]);

    useEffect(() => {
        if (error || loading || products.length === 0) return;
        if (!hasMoreRef.current) return;
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return;
                if (loadingRef.current || !hasMoreRef.current) return;
                void loadProducts();
            },
            {
                rootMargin: "300px",
            }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [error, loading, products.length]);

    const skeletonCount = 6;

    return (
        <>
            {error && products.length === 0 ? (
                <ServerError/>
            ) : (
                <>
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

                        {loading &&
                            Array.from({length: skeletonCount}).map((_, i) => (
                                <ProductCardSkeleton
                                    key={`skeleton-${i}`}
                                />
                            ))
                        }

                        {!error && (
                            <div
                                ref={sentinelRef}
                                className="product-grid-sentinel"
                            />
                        )}
                    </div>

                    {error && products.length > 0 && (
                        <div className="product-grid-load-error">
                            Не удалось загрузить следующие товары.
                            Повторная попытка будет выполнена автоматически.
                        </div>
                    )}
                </>
            )}
        </>
    );
};