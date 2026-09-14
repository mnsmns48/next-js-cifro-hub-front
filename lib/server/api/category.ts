import "server-only";


import {
    applyListingToCategoryParams,
    parsePageParam,
} from "@/components/catalog/catalogListingSearch";

import {
    PAGE_SIZE,
    normalizePath,
    parseCategoryListing,
    type ParsedCategoryListing,
} from "@/components/category/categoryListing";
import {API3_SSR} from "../../api";

export type CategoryResult =
    | {
    ok: true;
    data: ParsedCategoryListing;
}
    | {
    ok: false;
    reason: "path";
};

export async function getCategory(
    categoryPath: string,
    listingSearch: string,
): Promise<CategoryResult> {
    const listing = new URLSearchParams(listingSearch);

    const page = parsePageParam(
        listing.get("page"),
    );

    const params = new URLSearchParams({
        path: normalizePath(categoryPath),
    });

    applyListingToCategoryParams(
        params,
        listing,
        PAGE_SIZE,
    );

    const response = await fetch(
        `${API3_SSR}/category?${params.toString()}`,
        {
            cache: "no-store",
        },
    );

    if (
        response.status === 400 ||
        response.status === 404
    ) {
        return {
            ok: false,
            reason: "path",
        };
    }

    if (!response.ok) {
        throw new Error(
            `Failed to load category: ${response.status}`,
        );
    }

    const data = await response.json();

    return {
        ok: true,
        data: parseCategoryListing(data, page),
    };
}