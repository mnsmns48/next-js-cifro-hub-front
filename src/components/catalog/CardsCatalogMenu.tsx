"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Menu } from "antd";
import type { MenuProps } from "antd";

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
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

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

    const depth0 = levels.filter(l => l.depth === 0).sort((a, b) => a.sort_order - b.sort_order);
    const depth1 = levels.filter(l => l.depth === 1);
    const depth2 = levels.filter(l => l.depth === 2);

    const buildMenu = (rootId: number): MenuProps["items"] => {
        const level1 = depth1.filter(l => l.parent_id === rootId);

        return level1.map(l1 => {
            const level2 = depth2.filter(l => l.parent_id === l1.id);

            return {
                key: String(l1.id),
                label: l1.label,
                children:
                    level2.length > 0
                        ? level2.map(l2 => ({
                            key: String(l2.id),
                            label: l2.label,
                        }))
                        : undefined,
            };
        });
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
                padding: 10,
            }}
        >
            {depth0.map(d0 => {
                const isExpanded = expandedCardId === d0.id;

                return (
                    <div key={d0.id} style={{ position: "relative" }}>
                        <Card
                            hoverable
                            style={{
                                width: "100%",
                                height: 220,
                                borderRadius: 16,
                                cursor: "pointer",
                                overflow: "hidden",
                            }}
                            onClick={() => {
                                setExpandedCardId(isExpanded ? null : d0.id);
                            }}
                            cover={
                                d0.icon ? (
                                    <img
                                        src={d0.icon}
                                        alt={d0.label}
                                        style={{
                                            width: "100%",
                                            height: 120,
                                            objectFit: "contain",
                                            padding: 10,
                                        }}
                                    />
                                ) : null
                            }
                        >
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    textAlign: "center",
                                }}
                            >
                                {d0.label}
                            </div>
                        </Card>

                        {/* Меню внутри карточки */}
                        {isExpanded && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    background: "rgba(255,255,255,0.98)",
                                    borderRadius: 16,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    padding: 12,
                                    overflowY: "auto",
                                    zIndex: 10,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Menu
                                    mode="inline"
                                    items={buildMenu(d0.id)}
                                    onClick={(item) => {
                                        const id = Number(item.key);
                                        window.location.href = `/search?menu=${id}`;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
