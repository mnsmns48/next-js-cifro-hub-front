import Link from "next/link";

import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";

export default function AppHeaderCatalogOnly() {
    return (
        <div
            style={{
                background: "#fafafa",
                borderRadius: 18,
                height: 90,
                display: "flex",
                alignItems: "center",
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
                    width: 175,
                    height: 55,
                }}
            >
                <HeaderCatalogButton/>
            </Link>
        </div>
    );
}
