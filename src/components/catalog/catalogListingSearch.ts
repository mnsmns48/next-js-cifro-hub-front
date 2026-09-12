const RESERVED_LISTING_KEYS = new Set(["page", "sort", "limit", "path"]);

export function parsePageParam(value: string | null): number {
    if (!value) return 1;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function readFilterParams(searchParams: URLSearchParams): Record<string, string[]> {
    const next: Record<string, string[]> = {};
    for (const [key, value] of searchParams.entries()) {
        const trimmed = value.trim();
        if (RESERVED_LISTING_KEYS.has(key) || !trimmed) continue;
        const bucket = next[key] ?? [];
        bucket.push(trimmed);
        next[key] = bucket;
    }
    return next;
}

export function buildListingSearch(input: {
    filters: Record<string, string[]>;
    sort: string;
    page: number;
}): string {
    const params = new URLSearchParams();
    const keys = Object.keys(input.filters).sort();
    for (const key of keys) {
        const seen = new Set<string>();
        for (const raw of input.filters[key] ?? []) {
            const value = raw.trim();
            if (!value || seen.has(value)) continue;
            seen.add(value);
            params.append(key, value);
        }
    }

    const sort = input.sort.trim();
    if (sort) params.set("sort", sort);
    if (input.page > 1) params.set("page", String(input.page));

    return params.toString();
}

export function applyListingToCategoryParams(
    params: URLSearchParams,
    listing: URLSearchParams,
    limit: number,
): void {
    params.set("page", String(parsePageParam(listing.get("page"))));
    params.set("limit", String(limit));

    const sort = listing.get("sort")?.trim();
    if (sort) params.set("sort", sort);

    for (const [key, value] of listing.entries()) {
        const trimmed = value.trim();
        if (RESERVED_LISTING_KEYS.has(key) || !trimmed) continue;
        params.append(key, trimmed);
    }
}
