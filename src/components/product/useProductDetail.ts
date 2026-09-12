"use client";

import {useEffect, useState} from "react";

import {isAbortError, type ProductDetailData} from "./productDetail";

export function useProductDetail(origin: string) {
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);
        setProduct(null);

        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api3/product?origin=${encodeURIComponent(origin)}`,
            {signal: controller.signal},
        )
            .then((res) => {
                if (!res.ok) throw new Error("product");
                return res.json();
            })
            .then((data: ProductDetailData) => {
                setProduct(data);
                setError(false);
            })
            .catch((err: unknown) => {
                if (isAbortError(err)) return;
                setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [origin]);

    return {product, loading, error};
}
