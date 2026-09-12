"use client";

import Link from "next/link";
import {useState} from "react";

import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import HeaderPromoBanner from "@/components/header/HeaderPromoBanner";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import PopUpCatalogMenu from "@/components/catalog/PopUpCatalogMenu";

import "../css/AppHeader.css";

export default function AppHeader() {
    const [catalogOpen, setCatalogOpen] = useState(false);

    return (
        <>
            {catalogOpen && (
                <div className="catalog-overlay" onClick={() => setCatalogOpen(false)}/>
            )}

            <div className={`app-header-wrapper${catalogOpen ? " app-header-wrapper--catalog-open" : ""}`}>
                <div className="app-header">
                    <Link href="/" className="header-mobile-logo" aria-label="На главную">
                        <img
                            src="/logo-cifro-hub.svg"
                            alt="Cifro Hub"
                            className="header-mobile-logo__image"
                        />
                    </Link>

                    <div className="header-catalog">
                        <HeaderCatalogButton setOpen={setCatalogOpen} showPopUpMenu/>
                    </div>

                    <div className="header-center">
                        <div className="header-search">
                            <HeaderSearch/>
                        </div>
                        <HeaderPromoBanner inline/>
                    </div>

                    <div className="header-actions">
                        <HeaderActions/>
                    </div>
                </div>

                {catalogOpen && (
                    <div
                        className="catalog-hover-zone"
                        onMouseEnter={() => setCatalogOpen(true)}
                    />
                )}

                <PopUpCatalogMenu open={catalogOpen} setOpen={setCatalogOpen}/>
            </div>
        </>
    );
}
