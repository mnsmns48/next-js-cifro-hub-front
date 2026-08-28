import CategoryProductsRendering from "@/components/category/CategoryProductsRendering";

export default async function CatalogSlugPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const {slug} = await params;
    const categoryPath = slug.join("/");

    return <CategoryProductsRendering categoryPath={categoryPath} />;
}
