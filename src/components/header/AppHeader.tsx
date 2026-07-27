"use client";

import {useState} from "react";
import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import InfoSlider from "@/components/header/InfoSlider";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import PopUpCatalogMenu from "@/components/catalog/PopUpCatalogMenu";

export default function AppHeader() {
    const [catalogOpen, setCatalogOpen] = useState(false);

    return (
        <>
            {catalogOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,.35)",
                    zIndex: 900,
                }}
                     onMouseEnter={() => setCatalogOpen(false)}
                />
            )}

            <div className="layout-wrapper" style={{position: "relative", zIndex: 1000}}>
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
                    <HeaderCatalogButton setOpen={setCatalogOpen}/>
                    <HeaderSearch/>
                    <InfoSlider/>
                    <HeaderActions/>
                </div>

                {catalogOpen && (
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
                <PopUpCatalogMenu open={catalogOpen} setOpen={setCatalogOpen}/>
            </div>
        </>
    );
}
