"use client";

import {useState, useEffect, useRef} from "react";
import ProductCard from "@/components/ProductCard";
import {WarningOutlined} from "@ant-design/icons";

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
    const [error, setError] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    async function loadProducts(initial = false) {
        if (loading) return;
        if (!initial && !hasMore) return;

        setLoading(true);

        try {
            const params = new URLSearchParams({
                limit: "24",
                menu_levels: "0",
            });

            if (!initial && cursor) {
                params.append("cursor", cursor.toString());
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api3/products?${params.toString()}`
            ).catch(() => null);

            if (!res || !res.ok) {
                setError(true);
                return;
            }

            const data = await res.json();

            setProducts(prev => {
                const merged = [...prev, ...data.products];
                return merged.filter(
                    (item, index, arr) => arr.findIndex(x => x.id === item.id) === index
                );
            });

            setCursor(data.next_cursor);
            setHasMore(data.has_more);
            setError(false);
        } finally {
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
        if (!sentinelRef.current || error) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    void loadProducts();
                }
            },
            {
                rootMargin: "200px",
            }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [cursor, hasMore, error]);

    return (
        <>
            {error ? (
                <div style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    background: "#fff4f4",
                    border: "1px solid #ffd6d6",
                    borderRadius: 12,
                    fontSize: 20,
                    fontWeight: 500,
                    maxWidth: 600,
                    margin: "40px auto"
                }}>
                    База недоступна

                    <div style={{marginTop: 12, fontSize: 28}}>
                        <WarningOutlined/>
                    </div>
                </div>

            ) : (
                <>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            padding: "20px",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            background: "#fafafa",
                            borderRadius: 16,
                        }}
                    >
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
            )}
        </>
    );
}
