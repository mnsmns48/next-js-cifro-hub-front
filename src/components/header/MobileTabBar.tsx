"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    AppstoreOutlined,
    HomeOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from "@ant-design/icons";

import "../css/MobileTabBar.css";

const tabs = [
    {href: "/", label: "Главная", icon: HomeOutlined, match: (path: string) => path === "/"},
    {
        href: "/catalog",
        label: "Каталог",
        icon: AppstoreOutlined,
        match: (path: string) => path === "/catalog" || path.startsWith("/search"),
    },
    {href: "/cart", label: "Корзина", icon: ShoppingCartOutlined, match: (path: string) => path === "/cart"},
    {href: "/login", label: "Войти", icon: UserOutlined, match: (path: string) => path === "/login"},
];

export default function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav className="mobile-tab-bar" aria-label="Мобильная навигация">
            {tabs.map(({href, label, icon: Icon, match}) => {
                const isActive = match(pathname);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`mobile-tab-bar__item${isActive ? " mobile-tab-bar__item--active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <Icon className="mobile-tab-bar__icon"/>
                        <span className="mobile-tab-bar__label">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
