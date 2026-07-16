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
            <div style={{
                background: "#fbfbfb",
                height: 100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: "22px",
                padding: "0 10px",
                border: "1px solid #e8e8e8",
            }}>
                {/*<div style={{*/}
                {/*    display: "flex",*/}
                {/*    alignItems: "center",*/}
                {/*    justifyContent: "end",*/}
                {/*    padding: "8px 20px 25px 20px"*/}
                {/*}}>*/}
                {/*    <HeaderContact/>*/}
                {/*</div>*/}

                <div style={{display: "flex", alignItems: "center", gap: 6, height: 60}}>
                    <div style={{padding: "10px", margin: "10px"}}>
                        <Link href="/" style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#454545",
                            borderRadius: 18,
                            padding: "6px 14px",
                            gap: 6,
                            textDecoration: "none",
                            width: 220,
                            height: 70,
                        }}
                        >
                            <Image src="/logo-cifro-hub.svg" alt="CifroHub Logo" preview={false}/>
                            <HeaderCatalogButton/>
                        </Link>
                    </div>

                    <div style={{flex: 1}}>
                        <HeaderSearch/>
                    </div>
                    <HeaderActions/>
                </div>
                {/*<div style={{flex: 1, display: "flex", justifyContent: "center", padding: "23px"}}>*/}
                {/*    <HeaderServiceLinks/>*/}
                {/*</div>*/}
            </div>

        </header>
    );
}
