"use client";

import {useState, useEffect, useRef} from "react";
import ProductCard, {type ShortSpec} from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ServerError from "@/components/ServerError";

import "./css/ProductGrid.css";

interface Product {
    id: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}


export default function InfiniteProductRendering() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const cursorRef = useRef<number | null>(null);

    async function loadProducts(initial = false) {
        if (loadingRef.current) return;
        if (!initial && !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                limit: "24",
                menu_levels: "0",
            });

            if (!initial && cursorRef.current) {
                params.append("cursor", cursorRef.current.toString());
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/products?${params.toString()}`
            ).catch(() => null);

            if (!res || !res.ok) {
                setError(true);
                return;
            }

            const data = await res.json();

            setProducts((prev) => {
                const base = initial ? [] : prev;
                const merged = [...base, ...data.products];
                return merged.filter(
                    (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
                );
            });

            cursorRef.current = data.next_cursor;
            hasMoreRef.current = Boolean(data.has_more);
            setCursor(data.next_cursor);
            setHasMore(Boolean(data.has_more));
            setError(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        const id = setTimeout(() => {
            void loadProducts(true);
        }, 0);

        return () => clearTimeout(id);
    }, []);

    useEffect(() => {
        if (!error) return;

        const id = setInterval(() => {
            void loadProducts(true);
        }, 20000);

        return () => clearInterval(id);
    }, [error]);

    useEffect(() => {
        if (error || products.length === 0) return;
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return;
                if (loadingRef.current || !hasMoreRef.current) return;
                void loadProducts();
            },
            {
                rootMargin: "200px",
            }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [error, products.length === 0]);

    const isInitialLoad = loading && products.length === 0;
    const skeletonCount = isInitialLoad ? 12 : 6;

    return (
        <>
            {error ? (
                <ServerError/>
            ) : (
                <div className="product-grid">
                        {products.map((p, index) => (
                            <ProductCard key={p.id}
                                         title={p.title}
                                         price={p.output_price}
                                         preview={p.preview}
                                         pics={p.pics}
                                         shortSpecs={p.short_specs}
                                         priority={index < 8}/>
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
