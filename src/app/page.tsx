import PageContainer from "@/components/PageContainer";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
    return (
        <main>
            <PageContainer>
                <div
                    className="page-container"
                    style={{
                        display: "flex",
                        gap: 20,
                        padding: "20px 0",
                        overflowX: "auto",
                    }}
                >
                    <ProductCard title="Наушники Sony WH‑1000XM4" price="24 990" image="/images/item1.jpg"/>
                    <ProductCard title="Xiaomi Mi Band 8" price="3 990" image="/images/item2.jpg"/>
                    <ProductCard title="Apple iPhone 14" price="79 990" image="/images/item3.jpg"/>
                    <ProductCard title="Кофемашина Philips" price="32 490" image="/images/item4.jpg"/>
                    <ProductCard title="Logitech G Pro Wireless" price="8 490" image="/images/item5.jpg"/>
                </div>

            </PageContainer>
        </main>
    );
}
