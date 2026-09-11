"use client";

import {useState, useEffect, useRef} from "react";
import ProductCard, {type ShortSpec} from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ServerError from "@/components/ServerError";

import "./css/ProductGrid.css";

interface Product {
    id: number;
    origin: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}

interface InfiniteProductRenderingProps {
    menuLevels?: string;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

export default function InfiniteProductRendering({menuLevels = "0"}: InfiniteProductRenderingProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const cursorRef = useRef<number | null>(null);
    const menuLevelsRef = useRef(menuLevels);
    const abortControllerRef = useRef<AbortController | null>(null);

    async function loadProducts(initial = false) {
        if (loadingRef.current) return;
        if (!initial && !hasMoreRef.current) return;

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

            if (!initial && cursorRef.current) {
                params.append("cursor", cursorRef.current.toString());
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/products?${params.toString()}`,
                {signal: controller.signal},
            ).catch((err: unknown) => {
                if (isAbortError(err)) return null;
                throw err;
            });

            if (controller.signal.aborted || !res) return;

            if (!res.ok) {
                setError(true);
                return;
            }

            const data = await res.json();
            if (controller.signal.aborted) return;

            const nextProducts: Product[] = Array.isArray(data.products) ? data.products : [];

            setProducts((prev) => {
                const base = initial ? [] : prev;
                const merged = [...base, ...nextProducts];
                return merged.filter(
                    (item, index, arr) => arr.findIndex((x) => x.origin === item.origin) === index
                );
            });

            cursorRef.current = data.next_cursor;
            hasMoreRef.current = Boolean(data.has_more);
            setError(false);
        } catch (err: unknown) {
            if (isAbortError(err) || controller.signal.aborted) return;
            setError(true);
        } finally {
            if (!controller.signal.aborted) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        menuLevelsRef.current = menuLevels;
        loadingRef.current = false;
        hasMoreRef.current = true;
        cursorRef.current = null;

        const id = setTimeout(() => {
            setProducts([]);
            setError(false);
            void loadProducts(true);
        }, 0);

        return () => {
            clearTimeout(id);
            abortControllerRef.current?.abort();
        };
    }, [menuLevels]);

    useEffect(() => {
        if (!error) return;

        const id = setInterval(() => {
            void loadProducts(true);
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

    const isInitialLoad = loading && products.length === 0;
    const skeletonCount = isInitialLoad ? 12 : 6;

    return (
        <>
            {error ? (
                <ServerError/>
            ) : (
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
                            <ProductCardSkeleton key={`skeleton-${i}`}/>
                        ))
                    }

                    <div ref={sentinelRef} className="product-grid-sentinel"/>
                </div>
            )}
        </>
    );
}
