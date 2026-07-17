"use client";

import {useState, useEffect, useRef} from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
    id: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
}

export default function ProductsTest() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    async function loadProducts(initial = false) {
        if (loading) return;
        if (!initial && !hasMore) return;

        setLoading(true);

        const params = new URLSearchParams({
            limit: "24",
            menu_levels: "0",
        });

        if (!initial && cursor) {
            params.append("cursor", cursor.toString());
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api3/products?${params.toString()}`);
        const data = await res.json();

        setProducts(prev => {
            const merged = [...prev, ...data.products];
            return merged.filter(
                (item, index, arr) => arr.findIndex(x => x.id === item.id) === index
            );

        });

        setCursor(data.next_cursor);
        setHasMore(data.has_more);
        setLoading(false);
    }

    useEffect(() => {
        (async () => {
            await loadProducts(true);
        })();
    }, []);

    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    loadProducts();
                }
            },
            {
                rootMargin: "200px",
            }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [cursor, hasMore]);

    return (
        <>
            <div style={{
                display: "flex",
                gap: 12,
                padding: "20px",
                justifyContent: "space-between",
                flexWrap: "wrap",
                background: "#fafafa",
                borderRadius: 16,
            }}>
                {products.map(p => (
                    <ProductCard
                        key={p.id}
                        title={p.title}
                        price={p.output_price}
                        image={p.preview || (p.pics?.[0] ?? "/images/placeholder.jpg")}
                    />
                ))}
            </div>

            <div ref={sentinelRef} style={{height: 1}}/>

            {loading && (
                <div style={{textAlign: "center", padding: 20}}>
                    Загрузка...
                </div>
            )}
        </>
    );
}
