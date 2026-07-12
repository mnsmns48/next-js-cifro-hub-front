"use client";

import HeaderServiceLinks from "./HeaderServiceLinks";
import HeaderContact from "./HeaderContact";

export default function HeaderTop() {
    return (
        <div style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            gap: 12
        }}>
            <HeaderServiceLinks/>
            <HeaderContact/>
        </div>
    );
}
