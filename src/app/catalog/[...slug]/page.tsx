import CategoryProductsRendering from "@/components/category/CategoryProductsRendering";
import {getCategory} from "../../../../lib/server/api/category";


function buildListingSearch(
    searchParams: Record<
        string,
        string | string[] | undefined
    >,
): string {
    const result = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (typeof value === "string") {
            result.append(key, value);
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                result.append(key, item);
            }
        }
    }

    return result.toString();
}

export default async function CatalogSlugPage({
                                                  params,
                                                  searchParams,
                                              }: {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<
        Record<
            string,
            string | string[] | undefined
        >
    >;
}) {
    const {slug} = await params;
    const query = await searchParams;

    const categoryPath = slug.join("/");
    const listingSearch = buildListingSearch(query);

    const result = await getCategory(
        categoryPath,
        listingSearch,
    );

    return (
        <CategoryProductsRendering
            key={`${categoryPath}?${listingSearch}`}
            initialData={
                result.ok
                    ? result.data
                    : null
            }
            initialPathError={!result.ok}
        />
    );
}