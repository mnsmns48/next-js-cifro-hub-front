"use client";

import Link from "next/link";
import { gtEestiPro } from "@/fonts/gteestipro/gteestipro"


const links = [
    { label: "Новости", href: "/news" },
    { label: "О сайте", href: "/about" },
];

export default function HeaderServiceLinks() {
    return (
        <nav className={gtEestiPro.className} style={{ display: "flex", gap: 20, fontSize: 18 }}>
            {links.map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "#777777", textDecoration: "none" }}>
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}
