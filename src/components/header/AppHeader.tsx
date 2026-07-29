"use client";

import {useState} from "react";
import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import InfoSlider from "@/components/header/InfoSlider";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import PopUpCatalogMenu from "@/components/catalog/PopUpCatalogMenu";
import {usePathname} from "next/navigation";
import {useMediaQuery} from "@/hooks/useMediaQuery";

export default function AppHeader() {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const pathname = usePathname();
    const isCatalogPage = pathname === "/catalog";

    const {isMobile, isTablet, isDesktop} = useMediaQuery();

    let catalogWidth;
    let searchWidth;
    let sliderWidth;
    let actionsWidth;

    switch (true) {
        case isMobile:
            catalogWidth = "20%";
            searchWidth = "20%";
            sliderWidth = "0%";
            actionsWidth = "60%";
            break;

        case isTablet:
            catalogWidth = "20%";
            searchWidth = "20%";
            sliderWidth = "20%";
            actionsWidth = "40%";
            break;

        case isDesktop:
            catalogWidth = "15%";
            searchWidth = "25%";
            sliderWidth = "35%";
            actionsWidth = "25%";
            break;

        default:
            catalogWidth = "15%";
            searchWidth = "25%";
            sliderWidth = "25%";
            actionsWidth = "35%";
    }


    const showSlider = !isMobile;
    const showPopUpMenu = !isMobile && !isCatalogPage;

    return (
        <>
            {catalogOpen && showPopUpMenu && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.35)",
                        zIndex: 900,
                    }}
                    onMouseEnter={() => setCatalogOpen(false)}
                />
            )}

            <div className="layout-wrapper" style={{position: "relative", zIndex: 1000}}>
                <div
                    style={{
                        background: "#fafafa",
                        border: "1px solid #e8e8e8",
                        borderRadius: 18,
                        height: 90,
                        gap: 18,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px",
                    }}
                >
                    <div style={{width: catalogWidth}}>
                        <HeaderCatalogButton setOpen={setCatalogOpen}/>
                    </div>

                    <div style={{width: searchWidth}}>
                        <HeaderSearch/>
                    </div>

                    {showSlider && (
                        <div style={{width: sliderWidth}}>
                            <InfoSlider/>
                        </div>
                    )}

                    <div style={{width: actionsWidth}}>
                        <HeaderActions/>
                    </div>
                </div>

                {catalogOpen && showPopUpMenu && (
                    <div
                        onMouseEnter={() => setCatalogOpen(true)}
                        style={{
                            position: "absolute",
                            top: 70,
                            left: 0,
                            width: "100%",
                            height: 32,
                            background: "transparent",
                            pointerEvents: "auto",
                        }}
                    />
                )}

                {showPopUpMenu && (
                    <PopUpCatalogMenu open={catalogOpen} setOpen={setCatalogOpen}/>
                )}
            </div>
        </>
    );
}
