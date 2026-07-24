"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import HeaderCatalogButton from "@/components/header/HeaderCatalogButton";

export default function AppHeaderCatalogLogoBtn() {
    const pathname = usePathname();
    const target = pathname === "/catalog" ? "/" : "/catalog";

    return (
        <div style={{
            background: "#fafafa",
            borderRadius: 18,
            height: 90,
            display: "flex",
            alignItems: "center",
        }}>
            <Link href={target}
                  style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#4a4a4a",
                      borderRadius: 18,
                      textDecoration: "none",
                      width: 175,
                      height: 55,
                  }}>
                <HeaderCatalogButton/>
            </Link>
        </div>
    );
}
