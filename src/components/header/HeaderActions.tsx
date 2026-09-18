"use client";

import {useState} from "react";
import {
    AlignCenterOutlined,
    ShoppingCartOutlined,
    StarFilled,
    UserOutlined,
} from "@ant-design/icons";

import StubModal from "@/components/header/StubModal";
import "../css/HeaderActions.css";

const ACTIONS = [
    {icon: <AlignCenterOutlined/>, label: "Сравнение"},
    {icon: <StarFilled/>, label: "Избранное"},
    {icon: <UserOutlined/>, label: "Профиль"},
    {icon: <ShoppingCartOutlined/>, label: "Корзина"},
];

export default function HeaderActions() {
    const [stubOpen, setStubOpen] = useState(false);

    return (
        <div className="header-actions-wrapper">
            {ACTIONS.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    className="header-action-item"
                    onClick={() => setStubOpen(true)}
                >
                    <span className="header-action-icon-wrapper">
                        <span className="header-action-icon">
                            {action.icon}
                        </span>
                    </span>
                    <span className="header-action-label">{action.label}</span>
                </button>
            ))}
            <StubModal
                open={stubOpen}
                title="Раздел в разработке"
                onClose={() => setStubOpen(false)}
            />
        </div>
    );
}
