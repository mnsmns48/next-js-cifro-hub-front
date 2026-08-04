"use client";

import {useState} from "react";
import {usePathname} from "next/navigation";

import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import InfoSlider from "@/components/header/InfoSlider";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import PopUpCatalogMenu from "@/components/catalog/PopUpCatalogMenu";

import "../css/AppHeader.css";

export default function AppHeader() {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const pathname = usePathname();
    const isCatalogPage = pathname === "/catalog";


    const showPopUpMenu = !isCatalogPage;

    return (
        <>
            {catalogOpen && showPopUpMenu && (
                <div className="catalog-overlay" onMouseEnter={() => setCatalogOpen(false)}/>
            )}

            <div className="app-header-wrapper">
                <div className="app-header">
                    <div className="header-catalog">
                        <HeaderCatalogButton setOpen={setCatalogOpen}/>
                    </div>

                    <div className="header-search">
                        <HeaderSearch/>
                    </div>

                    <div className="header-slider">
                        <InfoSlider/>
                    </div>

                    <div className="header-actions">
                        <HeaderActions/>
                    </div>
                </div>

                {catalogOpen && showPopUpMenu && (
                    <div
                        className="catalog-hover-zone"
                        onMouseEnter={() => setCatalogOpen(true)}
                    />
                )}

                {showPopUpMenu && (
                    <PopUpCatalogMenu open={catalogOpen} setOpen={setCatalogOpen}/>
                )}
            </div>
        </>
    );
}
