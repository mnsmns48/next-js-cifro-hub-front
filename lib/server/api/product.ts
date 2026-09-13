import "server-only";

import {API3_SSR} from "@/lib/api";

export async function getProduct(origin: string) {
    const response = await fetch(
        `${API3_SSR}/product?origin=${encodeURIComponent(origin)}`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load product: ${response.status}`,
        );
    }

    return response.json();
}