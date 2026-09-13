import ProductDetail from "@/components/product/ProductDetail";
import {notFound} from "next/navigation";
import {getProduct} from "../../../../lib/server/api/product";


function extractOrigin(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
        return trimmed;
    }

    const match = trimmed.match(/(\d+)$/);
    return match?.[1] ?? null;
}

export default async function ProductPage({
                                              params,
                                          }: {
    params: Promise<{ origin: string }>;
}) {
    const {origin: rawOrigin} = await params;
    const origin = extractOrigin(rawOrigin);

    if (!origin) {
        notFound();
    }

    const product = await getProduct(origin);

    if (!product) {
        notFound();
    }

    return (
        <ProductDetail key={product.origin} product={product}/>
    );
}