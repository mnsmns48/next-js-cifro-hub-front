"use client";

import Link from "next/link";
import {gtEestiPro} from "@/fonts/gteestipro/gteestipro"


const links = [
    {label: "О сайте", href: "/about"},
    {label: "Новости", href: "/news"},
];

export default function HeaderServiceLinks() {
    return (
        <nav className={gtEestiPro.className} style={{display: "flex", gap: 12, fontSize: 14}}>
            {links.map((l) => (
                <Link key={l.href} href={l.href} style={{color: "#000", textDecoration: "none"}}>
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}
