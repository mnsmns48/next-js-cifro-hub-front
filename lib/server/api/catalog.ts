import "server-only";
import {API3_SSR} from "../../api";


export interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    slug?: string | null;
    parent_id: number;
    depth: number;
}


export async function getCatalogLevels(): Promise<HubLevel[]> {
    const response = await fetch(
        `${API3_SSR}/init_levels`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load catalog levels: ${response.status}`,
        );
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
}