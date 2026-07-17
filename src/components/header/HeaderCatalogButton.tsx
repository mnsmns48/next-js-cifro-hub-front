"use client";
import {HolderOutlined} from "@ant-design/icons";

export default function HeaderCatalogButton() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                gap: 6,
                padding: "0 4px"
            }}
        >
            <span style={{color: "#e2fc2a", fontSize: 18}}>
                <HolderOutlined />
            </span>
            КАТАЛОГ
        </div>
    );
}
