export interface RouteItem {
    path_id: number;
    label: string;
    slug?: string | null;
    parent_id?: number | null;
}

export interface SpecRow {
    param: string;
    value: string;
}

export interface SpecFeature {
    title: string;
    rows: SpecRow[];
}

export interface ProductAttr {
    id?: number;
    value?: string;
    alias?: string;
    key?: {
        key?: string;
        alias?: string;
    };
}

export interface ProductShortSpec {
    title?: string;
    alias?: string;
    icon?: string | null;
    text?: string | null;
    value?: string | null;
    values?: Record<string, unknown> | null;
}

export interface ProductDetailData {
    id?: number;
    origin: number;
    title: string;
    output_price: number;
    warranty?: string | null;
    preview?: string | null;
    pics?: string[];
    route?: RouteItem[];
    brand_obj?: {brand?: string} | null;
    type_obj?: {type?: string} | null;
    model?: string | null;
    attrs?: ProductAttr[];
    short_specs?: ProductShortSpec[];
    full_specs?: {features?: SpecFeature[]} | null;
    pros_cons?: Record<string, unknown> | null;
}

export interface BriefSheetSpec {
    label: string;
    value: string;
    icon: string | null;
}

export function formatPrice(price: string | number): string {
    return Number(price).toLocaleString("ru-RU");
}

export function isRemoteUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

export function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
}

export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

export function formatSpecValue(param: string, value: string): string {
    return param.trim().toLocaleLowerCase("ru-RU") === "производитель"
        ? value.toLocaleUpperCase("ru-RU")
        : value;
}

export function attrLabel(attr: ProductAttr): string {
    return attr.key?.alias || attr.key?.key || attr.alias || "";
}

export function isUsefulValue(value?: string | null): value is string {
    const text = value?.trim() ?? "";
    if (!text) return false;
    const lower = text.toLowerCase();
    return !lower.includes("нет точной информации") && lower !== "unspecified";
}

export function buildBriefSpecs(product: ProductDetailData, limit: number): SpecRow[] {
    const rows: SpecRow[] = [];
    const seen = new Set<string>();

    const add = (param: string, value?: string | null) => {
        const label = param.trim();
        if (!label || !isUsefulValue(value) || seen.has(label.toLowerCase())) return;
        seen.add(label.toLowerCase());
        rows.push({param: label, value: value.trim()});
    };

    add("Производитель", product.brand_obj?.brand);
    add("Модель", product.model);
    add("Гарантия", product.warranty);

    (product.attrs ?? []).forEach((attr) => {
        add(attrLabel(attr), attr.value);
    });

    product.full_specs?.features?.forEach((feature) => {
        feature.rows?.forEach((row) => add(row.param, row.value));
    });

    return rows.slice(0, limit);
}

export function listFromUnknown(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

export function shortSpecValue(spec: ProductShortSpec): string {
    if (isUsefulValue(spec.text)) return spec.text.trim();
    if (isUsefulValue(spec.value)) return spec.value.trim();
    if (spec.values && typeof spec.values === "object") {
        const values = Object.values(spec.values).filter(
            (entry): entry is string => typeof entry === "string" && isUsefulValue(entry),
        );
        if (values.length > 0) return values.join(", ");
    }
    return "";
}

export function buildBriefSheetSpecs(specs?: ProductShortSpec[]): BriefSheetSpec[] {
    return (specs ?? [])
        .map((spec) => {
            const label = (spec.alias || spec.title || "").trim();
            const value = shortSpecValue(spec);
            const icon = spec.icon?.trim() ? normalizeUrl(spec.icon) : null;
            return {label, value, icon};
        })
        .filter((spec) => spec.label && spec.value);
}

export function getPros(product: ProductDetailData): string[] {
    return listFromUnknown(
        product.pros_cons?.advantage ??
        product.pros_cons?.pros ??
        product.pros_cons?.pluses ??
        product.pros_cons?.advantages,
    );
}

export function getCons(product: ProductDetailData): string[] {
    return listFromUnknown(
        product.pros_cons?.disadvantage ??
        product.pros_cons?.cons ??
        product.pros_cons?.minuses ??
        product.pros_cons?.disadvantages,
    );
}

export function buildProductImages(product: ProductDetailData | null): string[] {
    if (!product) return [];
    return [...new Set(
        [product.preview, ...(product.pics ?? [])]
            .filter((url): url is string => typeof url === "string"),
    )];
}

export function stepGalleryIndex(index: number, length: number, delta: number): number {
    if (length <= 0) return 0;
    return (index + delta + length) % length;
}

export function specFeatures(product: ProductDetailData | null): SpecFeature[] {
    return product?.full_specs?.features?.filter((item) => item.rows?.length) ?? [];
}
