"use client";

import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";

export default function HeaderBottom() {
    return (
        <div
            style={{
                background: "#fff",
                borderTop: "1px solid #e5e5e5",
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 16px",
            }}
        >
            <div style={{ flex: 1, marginRight: 16 }}>
                <HeaderSearch />
            </div>

            <HeaderActions />
        </div>
    );
}
