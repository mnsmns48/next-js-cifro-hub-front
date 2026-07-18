"use client";

import {
    AlignCenterOutlined,
    ShoppingCartOutlined,
    StarFilled,
    UserOutlined
} from "@ant-design/icons";
import {useState} from "react";

export default function HeaderActions() {
    const actions = [
        {icon: <AlignCenterOutlined/>, label: "Сравнение"},
        {icon: <StarFilled/>, label: "Избранное"},
        {icon: <ShoppingCartOutlined/>, label: "Корзина"},
        {icon: <UserOutlined/>, label: "Вход"},
    ];

    return (
        <div style={{display: "flex", gap: 25, padding: 20}}>
            {actions.map((a) => (
                <IconButton key={a.label} icon={a.icon} label={a.label}/>
            ))}
        </div>
    );
}

function IconButton({icon, label}: { icon: React.ReactNode; label: string }) {
    const [hover, setHover] = useState(false);

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer"}}
             onMouseEnter={() => setHover(true)}
             onMouseLeave={() => setHover(false)}>
            <div style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: "#616161",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
            }}>
                <div style={{fontSize: 15, color: hover ? "#e2fc2a" : "#ffffff", transition: "color 0.2s ease"}}>
                    {icon}
                </div>
            </div>

            <div style={{fontSize: 12, color: "#999999", marginTop: 6, textAlign: "center"}}>
                {label}
            </div>
        </div>
    );
}
