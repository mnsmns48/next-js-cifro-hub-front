"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import { Dispatch, SetStateAction } from "react";

import "../css/HeaderCatalogButton.css";

interface HeaderCatalogButtonProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function HeaderCatalogButton({ setOpen }: HeaderCatalogButtonProps) {
    const pathname = usePathname();
    const target = pathname === "/catalog" ? "/" : "/catalog";

    const handleMouseEnter = () => {
        setOpen(true);
    };

    const handleMouseLeave = () => {
        setOpen(false);
    };

    return (
        <Link
            href={target}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="header-catalog-link"
        >
            <Image
                src="/logo-cifro-hub.svg"
                alt="CifroHub Logo"
                preview={false}
                className="header-catalog-logo"
            />

            <div className="header-catalog-text">
                <span className="header-catalog-icon">
                    <HolderOutlined />
                </span>
                КАТАЛОГ
            </div>
        </Link>
    );
}
