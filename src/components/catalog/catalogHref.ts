function catalogSegments(path?: string | null): string[] {
    const normalized = path?.trim().replace(/^\/+|\/+$/g, "") ?? "";
    if (!normalized) return [];
    return normalized.split("/").filter(Boolean);
}

function catalogHrefFromSegments(segments: string[]): string {
    const encoded = segments.map(encodeURIComponent);
    return encoded.length > 0 ? `/catalog/${encoded.join("/")}` : "/catalog";
}

export function slugSegment(slug?: string | null): string | null {
    return catalogSegments(slug).at(-1) ?? null;
}

export function toCatalogHref(path?: string | null): string {
    return catalogHrefFromSegments(catalogSegments(path));
}

export function isCatalogRoot(node: {parent_id: number}): boolean {
    return node.parent_id === 0;
}

export function catalogCrumbHrefs(
    items: Array<{slug?: string | null; parent_id?: number | null}>,
): string[] {
    const chain: string[] = [];

    return items.map((item, index) => {
        const isRoot = item.parent_id === 0 || (item.parent_id == null && index === 0);
        if (!isRoot) {
            const segment = slugSegment(item.slug);
            if (segment) {
                chain.push(segment);
            }
        }

        return catalogHrefFromSegments(chain);
    });
}

export function catalogLevelPath(
    level: {id: number; slug?: string | null; parent_id: number},
    levelsById: Map<number, {id: number; slug?: string | null; parent_id: number}>,
): string | null {
    const segments: string[] = [];
    const visited = new Set<number>();
    let current: {id: number; slug?: string | null; parent_id: number} | undefined = level;

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        const segment = slugSegment(current.slug);
        const isSelected = current.id === level.id;
        const skipHubAncestor = !isSelected && isCatalogRoot(current);
        if (segment && !skipHubAncestor) {
            segments.unshift(segment);
        }
        current = levelsById.get(current.parent_id);
    }

    return segments.length > 0 ? segments.join("/") : null;
}

export function toCatalogLevelHref(
    level: {id: number; slug?: string | null; parent_id: number},
    levelsById: Map<number, {id: number; slug?: string | null; parent_id: number}>,
): string {
    return toCatalogHref(catalogLevelPath(level, levelsById));
}
