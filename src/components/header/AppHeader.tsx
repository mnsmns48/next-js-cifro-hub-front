"use client";


import HeaderServiceLinks from "@/components/header/HeaderServiceLinks";
import HeaderContact from "@/components/header/HeaderContact";
import Link from "next/link";
import {Image} from "antd";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";
import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";

export default function AppHeader() {
    return (
        <header>
            <div
                style={{
                    background: "#ffffff",
                    height: 120,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0 0 20px 20px",
                    padding: "0 10px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 25,
                        padding: "0 10px",
                    }}
                >
                    <div style={{flex: 1, display: "flex", justifyContent: "center"}}>
                        <HeaderServiceLinks/>
                    </div>
                    <HeaderContact/>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        height: 80,
                    }}
                >
                    <div style={{padding: "10px", margin: "10px"}}>
                        <Link
                            href="/"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                background: "linear-gradient(135deg, #3e3e3e 0%, #404040 100%)",
                                borderRadius: 20,
                                padding: "6px 12px",
                                gap: 12,
                                textDecoration: "none",
                                width: 200,
                                height: 70,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                        >
                            <Image
                                src="/logo-cifro-hub.svg"
                                alt="CifroHub Logo"
                                preview={false}
                            />
                            <HeaderCatalogButton/>
                        </Link>
                    </div>

                    <div style={{flex: 1}}>
                        <HeaderSearch/>
                    </div>

                    <HeaderActions/>
                </div>
            </div>
        </header>
    );
}
