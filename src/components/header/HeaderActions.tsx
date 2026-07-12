"use client";

import { AlignCenterOutlined, ShoppingCartOutlined, StarFilled, UserOutlined } from "@ant-design/icons";

export default function HeaderActions() {
    const actions = [
        { icon: <AlignCenterOutlined />, label: "Сравнение" },
        { icon: <StarFilled />, label: "Избранное" },
        { icon: <ShoppingCartOutlined />, label: "Корзина" },
        { icon: <UserOutlined />, label: "Вход" },
    ];

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: 20,
            }}
        >
            {actions.map((a) => (
                <div
                    key={a.label}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <div style={{ fontSize: 22, color: "#3a3a3a" }}>
                        {a.icon}
                    </div>

                    <div style={{ fontSize: 12, color: "#999999", marginTop: 2 }}>
                        {a.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
