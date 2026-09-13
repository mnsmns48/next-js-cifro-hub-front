import "server-only";

import {API3_SSR} from "@/lib/api";

export async function getCategory(
    params: URLSearchParams,
) {
    const response = await fetch(
        `${API3_SSR}/category?${params.toString()}`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load category: ${response.status}`,
        );
    }

    return response.json();
}