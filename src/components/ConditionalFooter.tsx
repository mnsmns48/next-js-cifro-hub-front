"use client";

import {usePathname} from "next/navigation";

import AppFooter from "@/components/AppFooter";

export default function ConditionalFooter() {
    const pathname = usePathname();

    if (pathname === "/") {
        return <div className="home-tab-bar-spacer" aria-hidden/>;
    }

    return <AppFooter/>;
}
