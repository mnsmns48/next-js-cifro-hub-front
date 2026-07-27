"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";

interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    parent_id: number;
    depth: number;
}

export default function CardsCatalogMenu() {
    const [levels, setLevels] = useState<HubLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/init_levels`)
            .then(res => res.json())
            .then(data => {
                setLevels(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    const depth0 = levels
        .filter(l => l.depth === 0)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 20,
                padding: 10,
            }}
        >
            {depth0.map(item => (
                <div
                    key={item.id}
                    onClick={() => {
                        window.location.href = `/search?menu=${item.id}`;
                    }}
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "transform .15s ease, box-shadow .15s ease",
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.transform = "translateY(-4px)";
                        el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                >
                    {/* Картинка */}
                    {item.icon && (
                        <img
                            src={item.icon}
                            alt={item.label}
                            style={{
                                width: 80,
                                height: 80,
                                objectFit: "contain",
                                marginBottom: 12,
                            }}
                        />
                    )}

                    {/* Название */}
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#333",
                        }}
                    >
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
