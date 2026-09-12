import {redirect} from "next/navigation";

import {toCatalogHref} from "@/components/catalog/catalogHref";

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
