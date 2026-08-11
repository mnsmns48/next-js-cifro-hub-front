"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {HolderOutlined} from "@ant-design/icons";
import {Dispatch, SetStateAction} from "react";

import "../css/HeaderCatalogButton.css";

interface HeaderCatalogButtonProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    showPopUpMenu: boolean;
}

export default function HeaderCatalogButton({setOpen, showPopUpMenu}: HeaderCatalogButtonProps) {
    const pathname = usePathname();
    const target = pathname === "/catalog" ? "/" : "/catalog";

    const handleMouseEnter = () => {
        if (showPopUpMenu) {
            setOpen(true);
        }
    };

    return (
        <Link
            href={target}
            onMouseEnter={handleMouseEnter}
            className="header-catalog-link"
        >
            <img
                src="/logo-cifro-hub.svg"
                alt="CifroHub Logo"
                className="header-catalog-logo"
            />

            <div className="header-catalog-text">
                <span className="header-catalog-icon">
                    <HolderOutlined/>
                </span>
                КАТАЛОГ
            </div>
        </Link>
    );
}
