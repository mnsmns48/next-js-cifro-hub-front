import type {ShortSpec} from "@/components/ProductCard";

export interface Product {
    id: number;
    origin: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}

export interface Breadcrumb {
    id: number;
    label: string;
    slug?: string | null;
    parent_id?: number | null;
}

export interface SortOption {
    key: string;
    label: string;
}

export interface FilterValue {
    id?: number;
    label?: string;
    slug?: string | null;
    count?: number | string;
    description?: string;
    subtitle?: string;
    hint?: string;
}

export interface ApiFilter {
    key: string;
    label: string;
    type?: string;
    values?: Array<string | FilterValue>;
    active?: unknown[];
}

export type FilterKind = "meta" | "sku" | "model";

export interface VisualFilter {
    kind: FilterKind;
    filter: ApiFilter;
    values: FilterValue[];
}

export interface ParsedCategoryListing {
    products: Product[];
    breadcrumbs: Breadcrumb[];
    metaFilters: ApiFilter[];
    skuFilters: ApiFilter[];
    modelFilters: ApiFilter[];
    sortOptions: SortOption[];
    sortActive: string;
    page: number;
    totalPages: number;
}

export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
export const COMPACT_PAGINATION_QUERY = "(max-width: 430px)";
export const PAGE_SIZE = 24;
export const FILTER_LIST_PREVIEW = 5;
export const CHIP_PREVIEW = 8;
export const BRAND_CHIP_PREVIEW = 6;
export const PRICE_OPTIONS_PREVIEW = 12;
export const SKELETON_COUNT = 12;
export const PRIORITY_CARD_COUNT = 8;
export const ERROR_RETRY_MS = 20_000;
export const HEADER_SELECTOR = ".app-header-wrapper";
export const LISTING_SCROLL_GAP_PX = 8;

export function normalizePath(path: string): string {
    return path.trim();
}

export function getWindowListingSearch(): string {
    if (typeof window === "undefined") return "";
    return window.location.search.replace(/^\?/, "");
}

export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

export function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : [];
}

export function buildPageItems(
    currentPage: number,
    totalPages: number,
    compact = false,
): Array<number | "dots-left" | "dots-right"> {
    if (compact) {
        if (totalPages <= 5) {
            return Array.from({length: totalPages}, (_, index) => index + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, "dots-right", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, "dots-left", totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, "dots-left", currentPage, "dots-right", totalPages];
    }

    if (totalPages <= 7) {
        return Array.from({length: totalPages}, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "dots-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [1, "dots-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "dots-left", currentPage - 1, currentPage, currentPage + 1, "dots-right", totalPages];
}

export function scrollListingToTop(anchor: HTMLElement | null) {
    if (typeof window === "undefined") return;

    const header = document.querySelector(HEADER_SELECTOR);
    const headerOffset = header instanceof HTMLElement ? header.offsetHeight : 0;
    const anchorTop = anchor
        ? anchor.getBoundingClientRect().top + window.scrollY
        : 0;
    const targetTop = Math.max(0, anchorTop - headerOffset - LISTING_SCROLL_GAP_PX);

    window.scrollTo({top: targetTop, left: 0, behavior: "auto"});

    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
        main.scrollTo({top: targetTop, left: 0, behavior: "auto"});
    }
}

function normalizeFilterValue(value: string | FilterValue): FilterValue | null {
    if (typeof value === "string") {
        const label = value.trim();
        return label ? {label} : null;
    }

    return value;
}

export function getFilterValues(filter: ApiFilter): FilterValue[] {
    if (!Array.isArray(filter.values)) return [];
    return filter.values
        .map(normalizeFilterValue)
        .filter((value): value is FilterValue => value !== null);
}

export function getFilterValueMeta(value: FilterValue): {label: string} | null {
    const rawLabel = value?.label?.trim();
    if (!rawLabel) return null;

    const rawCount = value.count;
    const countFromField = rawCount === undefined || rawCount === null ? "" : String(rawCount).trim();
    const labelParts = countFromField ? null : rawLabel.match(/^(.*?)(?:\s*\(([\d\s]+)\))$/);
    const label = (labelParts?.[1] ?? rawLabel).trim();
    return label ? {label} : null;
}

function parseNumber(text: string): number | null {
    const digits = text.replace(/[^\d]/g, "");
    if (!digits) return null;
    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberRu(value: number): string {
    return new Intl.NumberFormat("ru-RU").format(value);
}

export function getPricePlaceholders(values: FilterValue[]): {from: string; to: string} {
    const bounds: number[] = [];
    for (const value of values) {
        const raw = value?.label?.trim();
        if (!raw) continue;
        const matches = raw.match(/\d[\d\s]*/g) ?? [];
        for (const match of matches) {
            const numeric = parseNumber(match);
            if (numeric !== null) {
                bounds.push(numeric);
            }
        }
    }

    if (bounds.length === 0) {
        return {from: "от", to: "до"};
    }

    const sorted = [...bounds].sort((a, b) => a - b);
    return {
        from: `от ${formatNumberRu(sorted[0])}`,
        to: `до ${formatNumberRu(sorted[sorted.length - 1])}`,
    };
}

export function isPriceFilter(filter: ApiFilter): boolean {
    return filter.key === "price";
}

export function isBooleanFilter(filter: ApiFilter, values: FilterValue[]): boolean {
    const type = (filter.type ?? "").trim();
    return (type === "bool" || type === "boolean" || type === "toggle" || type === "switch")
        && values.length >= 1;
}

export function isBrandFilter(filter: ApiFilter): boolean {
    return filter.key === "brand";
}

function capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getDisplayLabel(filter: ApiFilter, label: string): string {
    return isBrandFilter(filter) ? capitalizeFirstLetter(label) : label;
}

export function getValueKey(kind: FilterKind, value: FilterValue, label: string): string {
    const slug = value.slug?.trim();
    if (slug) return slug;
    if (kind === "model") return label;
    if (value.id !== undefined && value.id !== null) return String(value.id);
    return label;
}

export function uniqueFilterValues(kind: FilterKind, values: FilterValue[]): FilterValue[] {
    const seen = new Set<string>();
    const unique: FilterValue[] = [];

    for (const value of values) {
        const valueMeta = getFilterValueMeta(value);
        if (!valueMeta) continue;

        const valueKey = getValueKey(kind, value, valueMeta.label);
        if (!valueKey || seen.has(valueKey)) continue;

        seen.add(valueKey);
        unique.push(value);
    }

    return unique;
}

export function filterExpandKey(kind: FilterKind, filterKey: string): string {
    return `${kind}-${filterKey}`;
}

function normalizeSearchText(value: string): string {
    return value.trim().toLowerCase().replaceAll("ё", "е");
}

export function valueMatchesQuery(filter: ApiFilter, value: FilterValue, query: string): boolean {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return true;

    const valueMeta = getFilterValueMeta(value);
    if (!valueMeta) return false;

    return normalizeSearchText(getDisplayLabel(filter, valueMeta.label)).includes(normalizedQuery);
}

export function buildVisualFilters(
    metaFilters: ApiFilter[],
    skuFilters: ApiFilter[],
    modelFilters: ApiFilter[],
): VisualFilter[] {
    const byKind = (kind: FilterKind, filters: ApiFilter[]): VisualFilter[] =>
        filters
            .map((filter) => ({
                kind,
                filter,
                values: getFilterValues(filter),
            }))
            .filter((entry) => {
                if (isBooleanFilter(entry.filter, entry.values)) return entry.values.length >= 1;
                return entry.values.length > 1;
            });

    return [
        ...byKind("meta", metaFilters),
        ...byKind("sku", skuFilters),
        ...byKind("model", modelFilters),
    ];
}

export function hasSelectedFilters(selected: Record<string, string[]>): boolean {
    return Object.values(selected).some((values) => values.length > 0);
}

export interface AppliedFilterChip {
    id: string;
    filterKey: string;
    valueKey: string;
    label: string;
}

export function buildAppliedFilterChips(
    metaFilters: ApiFilter[],
    skuFilters: ApiFilter[],
    modelFilters: ApiFilter[],
    selected: Record<string, string[]>,
): AppliedFilterChip[] {
    const catalog: VisualFilter[] = [
        ...metaFilters.map((filter) => ({kind: "meta" as const, filter, values: getFilterValues(filter)})),
        ...skuFilters.map((filter) => ({kind: "sku" as const, filter, values: getFilterValues(filter)})),
        ...modelFilters.map((filter) => ({kind: "model" as const, filter, values: getFilterValues(filter)})),
    ];

    const chips: AppliedFilterChip[] = [];

    for (const [filterKey, selectedValues] of Object.entries(selected)) {
        if (!filterKey || selectedValues.length === 0) continue;

        const entries = catalog.filter((entry) => entry.filter.key === filterKey);
        const primary = entries[0];
        const booleanFilter = primary
            ? isBooleanFilter(primary.filter, primary.values)
            : false;

        for (const valueKey of selectedValues) {
            const trimmedKey = valueKey.trim();
            if (!trimmedKey) continue;

            let valueLabel = trimmedKey;
            lookup:
            for (const entry of entries) {
                for (const value of entry.values) {
                    const valueMeta = getFilterValueMeta(value);
                    if (!valueMeta) continue;
                    if (getValueKey(entry.kind, value, valueMeta.label) !== trimmedKey) continue;
                    valueLabel = getDisplayLabel(entry.filter, valueMeta.label);
                    break lookup;
                }
            }

            chips.push({
                id: `${filterKey}-${trimmedKey}`,
                filterKey,
                valueKey: trimmedKey,
                label: booleanFilter ? (primary?.filter.label ?? trimmedKey) : valueLabel,
            });
        }
    }

    return chips;
}

export function toggleSelectedFilter(
    selected: Record<string, string[]>,
    filterKey: string,
    valueKey: string,
    checked: boolean,
): Record<string, string[]> {
    const current = selected[filterKey] ?? [];
    const nextValues = checked
        ? [...current, valueKey]
        : current.filter((item) => item !== valueKey);

    return {
        ...selected,
        [filterKey]: nextValues,
    };
}

export function setSelectedFilterValue(
    selected: Record<string, string[]>,
    filterKey: string,
    valueKey: string | null,
): Record<string, string[]> {
    return {
        ...selected,
        [filterKey]: valueKey ? [valueKey] : [],
    };
}

export function parseCategoryListing(data: unknown, fallbackPage: number): ParsedCategoryListing {
    const payload = (data ?? {}) as Record<string, unknown>;
    const filters = (payload.filters ?? {}) as Record<string, unknown>;
    const sort = (payload.sort ?? {}) as Record<string, unknown>;
    const pagination = (payload.pagination ?? {}) as Record<string, unknown>;

    const sortOptions = asArray<SortOption>(sort.options);
    const apiSortActive = typeof sort.active === "string" ? sort.active : "";
    const sortActive = sortOptions.some((option) => option.key === apiSortActive)
        ? apiSortActive
        : (sortOptions[0]?.key ?? "");

    const products = asArray<Product>(payload.products);
    const apiPage = Number(pagination.page);
    const apiTotalPages = Number(pagination.total_pages);
    const page = Number.isFinite(apiPage) && apiPage > 0 ? apiPage : fallbackPage;
    const totalPages = Number.isFinite(apiTotalPages) && apiTotalPages > 0
        ? apiTotalPages
        : (products.length > 0 ? 1 : 0);

    return {
        products,
        breadcrumbs: asArray<Breadcrumb>(payload.breadcrumbs),
        metaFilters: asArray<ApiFilter>(filters.meta_filters),
        skuFilters: asArray<ApiFilter>(filters.sku_filters),
        modelFilters: asArray<ApiFilter>(filters.model_filters),
        sortOptions,
        sortActive,
        page,
        totalPages,
    };
}
