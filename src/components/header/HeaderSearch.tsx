"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function HeaderSearch() {
    const { isMobile } = useMediaQuery();

    if (isMobile) {
        return (
            <button
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 28,
                    border: "1px solid #ccc",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
            >
                <SearchOutlined style={{ fontSize: 20 }} />
            </button>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Input
                placeholder="Поиск"
                style={{
                    height: 40,
                    border: "1px solid #ccc",
                    borderRadius: 18,
                    fontSize: 16,
                }}
            />
        </div>
    );
}
