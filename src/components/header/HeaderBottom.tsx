"use client";

import HeaderCatalogButton from "./HeaderCatalogButton";
import HeaderActions from "./HeaderActions";
import HeaderSearch from "./HeaderSearch";
import {Image} from "antd";
import Link from "next/link";


export default function HeaderBottom() {
    return (
        <>
            <div style={{
                background: "#ffffff",
                height: 120,
                display: "flex",
                alignItems: "center",
                borderRadius: "0 0 20px 20px",
                gap: 6
            }}>
                <div style={{padding: "10px", margin: "10px",}}>
                    <Link href="/" style={{
                        display: "flex",
                        alignItems: "center",
                        background: "linear-gradient(135deg, #3e3e3e 0%, #404040 100%)",
                        borderRadius: 20,
                        padding: "6px 12px",
                        gap: 12,
                        textDecoration: "none",
                        width: 200,
                        height: 75,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                        <Image src="/logo-cifro-hub.svg" alt="CifroHub Logo" preview={false}/>
                        <HeaderCatalogButton/>
                    </Link>
                </div>

                <div style={{flex: 1}}>
                    <HeaderSearch/>
                </div>
                <HeaderActions/>
            </div>
        </>
    );
}
