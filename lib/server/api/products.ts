import "server-only";
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

export async function getProducts(
    menuLevels: string = "0",
    limit: number = 24,
): Promise<ProductsResponse> {
    const params = new URLSearchParams({
        limit: limit.toString(),
        menu_levels: menuLevels,
    });

    const response = await fetch(
        `${API3_SSR}/products?${params.toString()}`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load products: ${response.status}`,
        );
    }

    const data = await response.json();

    return {
        products: Array.isArray(data.products)
            ? data.products
            : [],
        next_cursor: data.next_cursor ?? null,
        has_more: Boolean(data.has_more),
    };
}