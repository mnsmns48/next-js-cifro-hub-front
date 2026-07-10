"use client";

import HeaderCatalogButton from "./HeaderCatalogButton";
import HeaderServiceLinks from "./HeaderServiceLinks";
import HeaderContact from "./HeaderContact";

export default function HeaderTop() {
    return (
        <div style={{
            background: "#ffd400",
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px"
        }}>
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
                <div style={{fontWeight: 600}}>LOGO</div>
                <HeaderCatalogButton/>
            </div>
            <HeaderServiceLinks/>
            <HeaderContact/>
        </div>
    );
}
