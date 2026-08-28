import {redirect} from "next/navigation";

function toCatalogHref(path?: string | null): string {
    const normalized = path?.trim().replace(/^\/+|\/+$/g, "");
    if (!normalized) return "/catalog";

    const segments = normalized.split("/").filter(Boolean).map(encodeURIComponent);
    return `/catalog/${segments.join("/")}`;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ path?: string | string[] }>;
}) {
    const params = await searchParams;
    const path = Array.isArray(params.path) ? params.path[0] : params.path;
    const normalizedPath = path?.trim();

    if (normalizedPath) {
        redirect(toCatalogHref(normalizedPath));
    }

    redirect("/catalog");
}
