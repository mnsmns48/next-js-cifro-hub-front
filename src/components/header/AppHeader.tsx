"use client";

import { useState } from "react";
import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import InfoSlider from "@/components/header/InfoSlider";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import CatalogMenu from "@/components/catalog/CatalogMenu";

export default function AppHeader() {
    const [catalogOpen, setCatalogOpen] = useState(false);

    return (
        <>
            {/* Backdrop */}
            {catalogOpen && (
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

            {/* Основной контейнер */}
            <div
                className="layout-wrapper"
                style={{
                    position: "relative",
                    zIndex: 1000,
                }}
            >
                {/* Хедер */}
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
                    <HeaderCatalogButton setOpen={setCatalogOpen} />
                    <HeaderSearch />
                    <InfoSlider />
                    <HeaderActions />
                </div>

                {/* Панель каталога */}
                {catalogOpen && (
                    <div
                        onMouseEnter={() => setCatalogOpen(true)}
                        onMouseLeave={() => setCatalogOpen(false)}
                        style={{
                            position: "absolute",
                            top: 102,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "clamp(320px, 90vw, 1416px)",
                            background: "#fff",
                            borderRadius: 28,
                            padding: 20,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                    >
                        <CatalogMenu />
                    </div>
                )}
            </div>
        </>
    );
}
