"use client";
import {HolderOutlined} from "@ant-design/icons";
import {Image} from "antd";

export default function HeaderCatalogButton() {
    return (
        <>
            <Image src="/logo-cifro-hub.svg" alt="CifroHub Logo" preview={false}
                   style={{width: 65, paddingLeft: 12}}/>
            <div style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                gap: 6,
                paddingRight: 12
            }}>
            <span style={{color: "#e2fc2a", fontSize: 18}}>
                <HolderOutlined/>
            </span>
                КАТАЛОГ
            </div>
        </>
    );
}
