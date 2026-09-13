import PageContainer from "@/components/PageContainer";
import InfiniteProductRendering from "@/components/InfiniteProductRendering";
import {getProducts} from "../../lib/server/api/products";


export default async function HomePage() {
    const initialData = await getProducts("0", 24);

    return (
        <main>
            <PageContainer>
                <InfiniteProductRendering
                    menuLevels="0"
                    initialData={initialData}
                />
            </PageContainer>
        </main>
    );
}