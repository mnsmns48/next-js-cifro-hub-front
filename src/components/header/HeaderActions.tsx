"use client";

import {
    AlignCenterOutlined,
    ShoppingCartOutlined,
    StarFilled,
    UserOutlined
} from "@ant-design/icons";
import { JSX, useState } from "react";

import "../css/HeaderActions.css";

interface ActionItem {
    icon: JSX.Element;
    label: string;
}

export default function HeaderActions() {
    const actions: ActionItem[] = [
        { icon: <AlignCenterOutlined />, label: "Сравнение" },
        { icon: <StarFilled />, label: "Избранное" },
        { icon: <UserOutlined />, label: "Профиль" },
        { icon: <ShoppingCartOutlined />, label: "Корзина" },
    ];

    return (
        <div className="header-actions-wrapper">
            {actions.map((a) => (
                <IconButton key={a.label} icon={a.icon} label={a.label} />
            ))}
        </div>
    );
}

function IconButton({ icon, label }: { icon: JSX.Element; label: string }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            className="header-action-item"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="header-action-icon-wrapper">
                <div
                    className="header-action-icon"
                    style={{ color: hover ? "#e2fc2a" : "#ffffff" }}
                >
                    {icon}
                </div>
            </div>

            <div className="header-action-label">{label}</div>
        </div>
    );
}
