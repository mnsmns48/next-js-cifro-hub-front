import ProductDetail from "@/components/product/ProductDetail";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ origin: string }>;
}) {
    const {origin} = await params;
    return <ProductDetail origin={origin} />;
}
