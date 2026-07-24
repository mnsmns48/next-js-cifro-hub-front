import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";

import InfoSlider from "@/components/header/InfoSlider";
import AppHeaderCatalogLogoBtn from "@/components/header/AppHeaderCatalogLogoBtn";

export default function AppHeaderSearchActions() {
    return (
        <>
            <div style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: 18,
                height: 90,
                gap: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
            }}>
                <AppHeaderCatalogLogoBtn/>
                <HeaderSearch/>
                <InfoSlider/>
                <HeaderActions/>
            </div>
        </>
    );
}
