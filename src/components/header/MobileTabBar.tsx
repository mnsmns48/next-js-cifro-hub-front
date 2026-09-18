"use client";

import {useState, type ComponentType} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    AppstoreOutlined,
    HomeOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from "@ant-design/icons";

import StubModal from "@/components/header/StubModal";
import "../css/MobileTabBar.css";

interface TabItem {
    href: string;
    label: string;
    icon: ComponentType<{className?: string}>;
    match: (path: string) => boolean;
    stub?: boolean;
}

const tabs: TabItem[] = [
    {href: "/", label: "Главная", icon: HomeOutlined, match: (path: string) => path === "/"},
    {
        href: "/catalog",
        label: "Каталог",
        icon: AppstoreOutlined,
        match: (path: string) => path === "/catalog" || path.startsWith("/catalog/") || path.startsWith("/search"),
    },
    {href: "/cart", label: "Корзина", icon: ShoppingCartOutlined, match: (path: string) => path === "/cart", stub: true},
    {href: "/login", label: "Войти", icon: UserOutlined, match: (path: string) => path === "/login", stub: true},
];

export default function MobileTabBar() {
    const pathname = usePathname();
    const [stubOpen, setStubOpen] = useState(false);

    return (
        <nav className="mobile-tab-bar" aria-label="Мобильная навигация">
            {tabs.map(({href, label, icon: Icon, match, stub}) => {
                const isActive = match(pathname);

                return (
                    <Link
                        key={href}
                        href={href}
                        prefetch={false}
                        className={`mobile-tab-bar__item${isActive ? " mobile-tab-bar__item--active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={stub
                            ? (event) => {
                                event.preventDefault();
                                setStubOpen(true);
                            }
                            : undefined}
                    >
                        <Icon className="mobile-tab-bar__icon"/>
                        <span className="mobile-tab-bar__label">{label}</span>
                    </Link>
                );
            })}
            <StubModal
                open={stubOpen}
                title="Раздел в разработке"
                onClose={() => setStubOpen(false)}
            />
        </nav>
    );
}
