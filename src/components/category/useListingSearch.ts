"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import {
    buildListingSearch,
    parsePageParam,
    readFilterParams,
} from "@/components/catalog/catalogListingSearch";

import {getWindowListingSearch} from "./categoryListing";

export function useListingSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const urlListingSearch = searchParams.toString();
    const [listingSearch, setListingSearch] = useState(urlListingSearch);
    const listingSearchRef = useRef(listingSearch);

    const listing = useMemo(() => new URLSearchParams(listingSearch), [listingSearch]);
    const urlFilters = useMemo(() => readFilterParams(listing), [listing]);
    const urlSort = listing.get("sort") ?? "";
    const urlPage = parsePageParam(listing.get("page"));

    const syncFromWindow = useCallback(() => {
        const actual = getWindowListingSearch();
        if (actual === listingSearchRef.current) return;
        listingSearchRef.current = actual;
        setListingSearch(actual);
    }, []);

    const replaceListingUrl = useCallback((next: {
        filters?: Record<string, string[]>;
        sort?: string;
        page?: number;
    }) => {
        const current = new URLSearchParams(listingSearchRef.current);
        const query = buildListingSearch({
            filters: next.filters ?? readFilterParams(current),
            sort: next.sort ?? current.get("sort") ?? "",
            page: next.page ?? parsePageParam(current.get("page")),
        });
        if (query === listingSearchRef.current) return;

        listingSearchRef.current = query;
        setListingSearch(query);
        const href = query ? `${pathname}?${query}` : pathname;
        router.replace(href, {scroll: false});
    }, [pathname, router]);

    useEffect(() => {
        syncFromWindow();
    }, [syncFromWindow, urlListingSearch]);

    useEffect(() => {
        window.addEventListener("popstate", syncFromWindow);
        return () => window.removeEventListener("popstate", syncFromWindow);
    }, [syncFromWindow]);

    return {
        listingSearch,
        listingSearchRef,
        replaceListingUrl,
        urlFilters,
        urlSort,
        urlPage,
    };
}
