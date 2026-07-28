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
        <div style={{display: "flex", gap: 16, width: "40%"}}>
            {actions.map((a) => (
                <IconButton key={a.label} icon={a.icon} label={a.label}/>
            ))}
        </div>
    );
}

// function IconButton({icon, label}: { icon: React.ReactNode; label: string }) {
//     const [hover, setHover] = useState(false);
//
//     return (
//         <div style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer"}}
//              onMouseEnter={() => setHover(true)}
//              onMouseLeave={() => setHover(false)}>
//             <div style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 12,
//                 background: "#616161",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 transition: "color 0.2s ease",
//             }}>
//                 <div style={{fontSize: 15, color: hover ? "#e2fc2a" : "#ffffff", transition: "color 0.2s ease"}}>
//                     {icon}
//                 </div>
//             </div>
//
//             <div style={{fontSize: 12, color: "#999999", marginTop: 6, textAlign: "center"}}>
//                 {label}
//             </div>
//         </div>
//     );
// }


function IconButton({icon, label}: { icon: React.ReactNode; label: string }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                textDecoration: hover ? "line-through" : "none",
                opacity: hover ? 0.6 : 1,
                transition: "opacity 0.2s ease, text-decoration 0.2s ease",
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
                }}
            >
                <div
                    style={{
                        fontSize: 15,
                        color: hover ? "#e3e3e3" : "#ffffff",
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

            <div
                style={{
                    position: "absolute",
                    bottom: -40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 12px",
                    background: "#000",
                    color: "#fff",
                    fontSize: 12,
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                    opacity: hover ? 1 : 0,
                    pointerEvents: "none",
                    transition: "opacity 0.2s ease",
                }}
            >
                Сейчас недоступно
            </div>
        </div>
    );
}
