import Link from "next/link";
import { Image } from "antd";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";

export default function AppHeaderCatalogOnly() {
    return (
        <div
            style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: 22,
                height: 90,
                display: "flex",
                alignItems: "center",
                padding: "6px 10px",
            }}
        >
            <Link
                href="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#4a4a4a",
                    borderRadius: 18,
                    textDecoration: "none",
                    paddingLeft: 6,
                    width: 175,
                    height: 55,
                }}
            >
                <Image src="/logo-cifro-hub.svg" alt="CifroHub Logo" preview={false}/>
                <HeaderCatalogButton/>
            </Link>
        </div>
    );
}
