export interface RouteItem {
    path_id: number;
    label: string;
    slug?: string | null;
    parent_id?: number | null;
}

export interface SpecRow {
    param: string;
    value: string;
    alias?: string;
    label?: string;
}

export interface SpecFeature {
    title: string;
    alias?: string;
    rows: SpecRow[];
}

export interface ProductAttr {
    id?: number;
    value?: string;
    alias?: string;
    label?: string;
    key?: {
        key?: string;
        alias?: string;
        label?: string;
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
    color?: {
        alias?: string | null;
        label?: string | null;
        value?: string | null;
    } | null;
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

export function formatSpecValue(param: string, value: string): string {
    return param.trim().toLocaleLowerCase("ru-RU") === "производитель"
        ? value.toLocaleUpperCase("ru-RU")
        : value;
}

export function attrLabel(attr: ProductAttr): string {
    return attr.key?.alias || attr.key?.label || attr.key?.key || attr.alias || "";
}

export function attrDisplayValue(attr: ProductAttr): string {
    return (attr.alias || attr.value || "").trim();
}

function normalizeTitlePart(value: string): string {
    return value.trim().toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

function titleHasPart(title: string, part: string): boolean {
    const needle = normalizeTitlePart(part);
    if (!needle) return false;
    const tokens = normalizeTitlePart(title).split(/[^a-z0-9а-я]+/).filter(Boolean);
    return tokens.includes(needle);
}

function colorAttrKey(attr: ProductAttr): string {
    return (attr.key?.key ?? "").trim().toLowerCase();
}

export function findProductColor(product: ProductDetailData): {
    alias: string;
    label: string;
} | null {
    if (product.color) {
        const alias = (product.color.alias ?? "").trim();
        const label = (product.color.label ?? product.color.value ?? "").trim();
        if (alias || label) return {alias, label};
    }

    const colorAttrs = (product.attrs ?? []).filter((attr) => {
        const key = colorAttrKey(attr);
        return key === "color" || key.endsWith("_color") || key.includes("color");
    });
    if (colorAttrs.length === 0) return null;

    const preferred = colorAttrs.find((attr) => colorAttrKey(attr) === "color")
        ?? colorAttrs.find((attr) => {
            const alias = (attr.alias ?? "").trim();
            const label = (attr.label ?? attr.value ?? "").trim();
            return titleHasPart(product.title, alias) || titleHasPart(product.title, label);
        })
        ?? colorAttrs.find((attr) => colorAttrKey(attr) === "watch_case_color")
        ?? colorAttrs[0];
    const alias = (preferred.alias ?? "").trim();
    const label = (preferred.label ?? preferred.value ?? "").trim();
    if (!alias && !label) return null;
    return {alias, label};
}

export function buildProductTitle(product: ProductDetailData): string {
    const title = product.title.trim();
    const color = findProductColor(product);
    if (!color) return title;

    const extra = [color.alias, color.label].filter((part, index, parts) => {
        if (!part) return false;
        if (index > 0 && normalizeTitlePart(part) === normalizeTitlePart(parts[0] ?? "")) return false;
        return !titleHasPart(title, part);
    });

    return extra.length > 0 ? `${title} ${extra.join(" ")}` : title;
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
        add(attrLabel(attr), attrDisplayValue(attr));
    });

    product.full_specs?.features?.forEach((feature) => {
        feature.rows?.forEach((row) => add(row.alias?.trim() || row.param, row.value));
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
    return (product?.full_specs?.features ?? [])
        .filter((item) => item.rows?.length)
        .map((feature) => ({
            title: (feature.alias?.trim() || feature.title).trim(),
            rows: feature.rows.map((row) => ({
                param: (row.alias?.trim() || row.param).trim(),
                value: row.value,
            })),
        }))
        .filter((feature) => feature.title && feature.rows.length > 0);
}
