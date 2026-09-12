"use client";

import {useEffect, useState} from "react";

import {isCatalogRoot} from "./catalogHref";

export interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    slug?: string | null;
    parent_id: number;
    depth: number;
}

let levelsRequest: Promise<HubLevel[]> | null = null;

function loadCatalogLevels(): Promise<HubLevel[]> {
    if (!levelsRequest) {
        levelsRequest = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/init_levels`)
            .then(async (res) => {
                if (!res.ok) {
                    levelsRequest = null;
                    return [];
                }
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            })
            .catch(() => {
                levelsRequest = null;
                return [];
            });
    }

    return levelsRequest;
}

export function catalogChildren(levels: HubLevel[], parentId: number): HubLevel[] {
    return levels
        .filter((item) => item.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order);
}

export function catalogSidebarLevels(levels: HubLevel[]): HubLevel[] {
    const depth0 = levels
        .filter((level) => level.depth === 0)
        .sort((a, b) => a.sort_order - b.sort_order);

    if (depth0.length === 1 && isCatalogRoot(depth0[0])) {
        return catalogChildren(levels, depth0[0].id);
    }

    return depth0;
}

export function useCatalogLevels() {
    const [levels, setLevels] = useState<HubLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        void loadCatalogLevels()
            .then((data) => {
                if (!cancelled) setLevels(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return {levels, loading};
}
