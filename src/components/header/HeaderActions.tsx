"use client";

import {
    AlignCenterOutlined,
    ShoppingCartOutlined,
    StarFilled,
    UserOutlined
} from "@ant-design/icons";
import {JSX, useState} from "react";
import {useMediaQuery} from "@/hooks/useMediaQuery";

interface ActionItem {
    icon: JSX.Element;
    label: string;
}

export default function HeaderActions() {
    const {isMobile} = useMediaQuery();

    const actions: ActionItem[] = [
        {icon: <AlignCenterOutlined/>, label: "Сравнение"},
        {icon: <StarFilled/>, label: "Избранное"},
        {icon: <UserOutlined/>, label: "Профиль"},
        {icon: <ShoppingCartOutlined/>, label: "Корзина"},
    ];

    if (isMobile) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "flex-end",
                }}
            >
                {actions.map((a) => (
                    <div
                        key={a.label}
                        style={{
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 12,
                        }}
                    >
                        {a.icon}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                justifyContent: "flex-end",
            }}
        >
            {actions.map((a) => (
                <IconButton key={a.label} icon={a.icon} label={a.label}/>
            ))}
        </div>
    );
}

function IconButton({icon, label}: { icon: JSX.Element; label: string }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    background: "#616161",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease",
                }}
            >
                <div
                    style={{
                        fontSize: 15,
                        color: hover ? "#e2fc2a" : "#ffffff",
                        transition: "color 0.2s ease",
                    }}
                >
                    {icon}
                </div>
            </div>

            <div
                style={{
                    fontSize: 12,
                    color: "#999999",
                    marginTop: 6,
                    textAlign: "center",
                }}
            >
                {label}
            </div>
        </div>
    );
}
