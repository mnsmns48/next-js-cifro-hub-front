export const PLACEHOLDER = "/images/placeholder.svg";

export interface ShortSpec {
    title: string;
    icon?: string | null;
    text?: string | null;
}

export function formatPrice(price: string | number): string {
    return Number(price).toLocaleString("ru-RU");
}

export function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }
    return trimmed;
}

export function isRemoteUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

export function buildImageCandidates(preview?: string | null, pics?: string[]): string[] {
    const candidates: string[] = [];

    const add = (url?: string | null) => {
        if (!url?.trim()) return;
        const normalized = normalizeUrl(url);
        if (!candidates.includes(normalized)) {
            candidates.push(normalized);
        }
    };

    add(preview);
    pics?.forEach(add);

    return candidates;
}

export function canHoverGallery(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function prefersHoverSpecs(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(any-pointer: coarse)").matches
    );
}

function transliterateRu(value: string): string {
    const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
        к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
        х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };

    return value
        .split("")
        .map((char) => map[char] ?? char)
        .join("");
}

export function slugifyTitle(title: string): string {
    const base = transliterateRu(title.trim().toLowerCase())
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");

    return base || "product";
}

export function buildProductHref(title: string, origin?: number): string | null {
    if (!origin) return null;
    return `/product/${slugifyTitle(title)}-${origin}`;
}

export function isUsefulSpec(spec: ShortSpec): boolean {
    const text = spec.text?.trim() ?? "";
    if (!text) return false;

    const lower = text.toLowerCase();
    return !lower.includes("нет точной информации") && lower !== "unspecified";
}

export function pickVisibleSpecs(specs?: ShortSpec[] | null): ShortSpec[] {
    if (!Array.isArray(specs)) return [];
    return specs.filter(isUsefulSpec).slice(0, 10);
}
