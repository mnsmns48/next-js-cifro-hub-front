import "server-only";
import {API3_SSR} from "../../api";
import {HubLevel} from "@/types/catalog";


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