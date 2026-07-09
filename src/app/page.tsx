import PageContainer from "@/components/PageContainer";
import SearchBar from "@/components/SearchBar";
import CategoryList from "@/components/CategoryList";
import FastFilters from "@/components/FastFilters";

export default function HomePage() {
    return (
        <main>
            <PageContainer>
                <SearchBar />
                <CategoryList />
                <FastFilters />
            </PageContainer>
        </main>
    );
}
