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
                padding: "6px 10px",
                lineHeight: "78px",
                whiteSpace: "nowrap",
            }}
        >
            <Link
                href="/"
                style={{
                    display: "inline-block",
                    background: "#454545",
                    borderRadius: 18,
                    textDecoration: "none",
                    paddingLeft: 12,
                    width: 170,
                    height: 60,
                    verticalAlign: "middle",
                    lineHeight: "60px",
                }}
            >
                <Image src="/logo-cifro-hub.svg" alt="CifroHub Logo" preview={false} />
                <HeaderCatalogButton />
            </Link>
        </div>
    );
}
