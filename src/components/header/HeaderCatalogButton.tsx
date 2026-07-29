"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Image} from "antd";
import {HolderOutlined} from "@ant-design/icons";
import {useMediaQuery} from "@/hooks/useMediaQuery";

interface HeaderCatalogButtonProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HeaderCatalogButton({setOpen}: HeaderCatalogButtonProps) {
    const pathname = usePathname();
    const target = pathname === "/catalog" ? "/" : "/catalog";

    const {isMobile, isTablet} = useMediaQuery();

    const handleMouseEnter = () => {
        if (!isMobile) setOpen(true);
    };

    const handleMouseLeave = () => {
        if (!isMobile) setOpen(false);
    };

    // 📱 MOBILE — только иконка
    if (isMobile) {
        return (
            <Link
                href={target}
                style={{
                    width: "100%",
                    height: 50,
                    background: "#4a4a4a",
                    borderRadius: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
            >
                <HolderOutlined style={{fontSize: 26, color: "#e2fc2a"}}/>
            </Link>
        );
    }


    const height = isTablet ? 50 : 60;
    const logoSize = isTablet ? 55 : 70;
    const fontSize = isTablet ? 14 : 16;
    const iconSize = isTablet ? 16 : 20;
    const paddingLeft = isTablet ? 10 : 14;
    const paddingRight = isTablet ? 10 : 14;

    return (
        <Link
            href={target}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#4a4a4a",
                borderRadius: 18,
                textDecoration: "none",
                width: "100%",
                height,
                cursor: "pointer",
            }}
        >
            <Image
                src="/logo-cifro-hub.svg"
                alt="CifroHub Logo"
                preview={false}
                style={{width: logoSize, paddingLeft}}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingRight,
                    color: "#fff",
                    fontSize,
                    fontWeight: 500,
                }}
            >
                <span style={{color: "#e2fc2a", fontSize: iconSize}}>
                    <HolderOutlined/>
                </span>
                КАТАЛОГ
            </div>
        </Link>
    );
}
