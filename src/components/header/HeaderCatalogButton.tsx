"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image } from "antd";
import { HolderOutlined } from "@ant-design/icons";

interface HeaderCatalogButtonProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HeaderCatalogButton({ setOpen }: HeaderCatalogButtonProps) {
    const pathname = usePathname();
    const target = pathname === "/catalog" ? "/" : "/catalog";

    return (
        <Link
            href={target}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#4a4a4a",
                borderRadius: 18,
                textDecoration: "none",
                width: "20%",
                height: 55,
                cursor: "pointer",
            }}
        >
            <Image
                src="/logo-cifro-hub.svg"
                alt="CifroHub Logo"
                preview={false}
                style={{ width: 65, paddingLeft: 12 }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingRight: 12,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 500,
                }}
            >
                <span style={{ color: "#e2fc2a", fontSize: 18 }}>
                    <HolderOutlined />
                </span>
                КАТАЛОГ
            </div>
        </Link>
    );
}
