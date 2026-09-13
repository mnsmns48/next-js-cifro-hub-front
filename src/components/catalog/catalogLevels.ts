import {isCatalogRoot} from "./catalogHref";
import type {HubLevel} from "@/types/catalog";

export function catalogChildren(
    levels: HubLevel[],
    parentId: number,
): HubLevel[] {
    return levels
        .filter((item) => item.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order);
}

export function catalogSidebarLevels(
    levels: HubLevel[],
): HubLevel[] {
    const depth0 = levels
        .filter((level) => level.depth === 0)
        .sort((a, b) => a.sort_order - b.sort_order);

    if (depth0.length === 1 && isCatalogRoot(depth0[0])) {
        return catalogChildren(levels, depth0[0].id);
    }

    return depth0;
}