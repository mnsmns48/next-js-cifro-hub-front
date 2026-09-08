import {Suspense} from "react";

import CategoryProductsRendering from "@/components/category/CategoryProductsRendering";

export default async function CatalogSlugPage({
    params,
    searchParams,
}: {
    params: Promise<{slug: string[]}>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {slug} = await params;
    await searchParams;
    const categoryPath = slug.join("/");

    return (
        <Suspense>
            <CategoryProductsRendering key={categoryPath} categoryPath={categoryPath} />
        </Suspense>
    );
}
