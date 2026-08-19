import CardsCatalogMenu from "@/components/catalog/CardsCatalogMenu";
import InfiniteProductRendering from "@/components/InfiniteProductRendering";

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ menu?: string | string[] }>;
}) {
    const params = await searchParams;
    const menu = Array.isArray(params.menu) ? params.menu[0] : params.menu;

    if (menu) {
        return <InfiniteProductRendering menuLevels={menu} />;
    }

    return <CardsCatalogMenu />;
}
