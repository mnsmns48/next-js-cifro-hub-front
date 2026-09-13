import CardsCatalogMenu from "@/components/catalog/CardsCatalogMenu";
import {getCatalogLevels} from "../../../lib/server/api/catalog";


export default async function CatalogPage() {
    const levels = await getCatalogLevels();

    return <CardsCatalogMenu levels={levels}/>;
}