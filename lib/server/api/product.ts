import "server-only";


import {ProductDetailData} from "@/components/product/productDetail";
import {API3_SSR} from "../../api";
import {ShortSpec} from "@/components/productCard";


export interface Product {
    id: number;
    origin: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}

export interface ProductsResponse {
    products: Product[];
    next_cursor: number | null;
    has_more: boolean;
}


export async function getProduct(origin: string): Promise<ProductDetailData | null> {
    const response = await fetch(
        `${API3_SSR}/product?origin=${encodeURIComponent(origin)}`,
        {
            cache: "no-store",
        },
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            `Failed to load product: ${response.status}`,
        );
    }

    return response.json();
}