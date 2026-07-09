"use client";

import Link from "next/link";

const links = [
    { label: "О сайте", href: "/about" },
    { label: "Доставка", href: "/delivery" },
    { label: "Новости", href: "/news" },
    { label: "Контакты", href: "/contacts" },
];

export default function HeaderServiceLinks() {
    return (
        <nav style={{ display: "flex", gap: 12, fontSize: 13 }}>
            {links.map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "#000" }}>
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}
