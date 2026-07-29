"use client";

import {useEffect, useState, useRef} from "react";
import {Card, Spin, Menu} from "antd";
import type {MenuProps} from "antd";
import "../css/CardsCatalogMenu.css"
import Image from "next/image";
import {useMediaQuery} from "@/hooks/useMediaQuery";

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

    const containerRef = useRef<HTMLDivElement | null>(null);

    const { isMobile } = useMediaQuery();


    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/init_levels`)
            .then(res => res.json())
            .then(data => {
                setLevels(data);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!containerRef.current) return;

            if (!containerRef.current.contains(e.target as Node)) {
                setExpandedCardId(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div style={{padding: 40, textAlign: "center"}}>
                <Spin size="small"/>
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
                label: (
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                        {l1.icon && (
                            <img src={l1.icon}
                                 alt={l1.label}
                                 style={{width: 18, height: 18, objectFit: "contain"}}
                            />
                        )}
                        {l1.label}
                    </div>
                ),
                children:
                    level2.length > 0
                        ? level2.map(l2 => ({
                            key: String(l2.id),
                            label: (
                                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                    {l2.icon && (
                                        <img src={l2.icon}
                                             alt={l2.label}
                                             style={{width: 16, height: 16, objectFit: "contain"}}
                                        />
                                    )}
                                    {l2.label}
                                </div>
                            ),
                        }))
                        : undefined,
            };
        });
    };


    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "space-between",
                alignItems: "flex-start",
            }}
        >
            {depth0.map(d0 => {
                const isExpanded = expandedCardId === d0.id;

                return (
                    <div
                        key={d0.id}
                        style={{
                            minWidth: isMobile ? 160 : 190,
                            maxWidth: isMobile ? 180 : 220,
                            flex: isMobile ? "1 1 160px" : "1 1 190px",
                            position: "relative",
                        }}
                    >
                        <Card
                            hoverable
                            className="card-catalog-menu"
                            style={{
                                height: isMobile ? 120 : 140,
                                borderRadius: 28,
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
                                            height: isMobile ? 80 : 100,
                                            objectFit: "contain",
                                            padding: isMobile ? 12 : 20,
                                        }}
                                    />
                                ) : null
                            }
                        >
                            <div
                                style={{
                                    fontSize: isMobile ? 12 : 14,
                                    fontWeight: 600,
                                    textAlign: "center",
                                    padding: 0,
                                }}
                            >
                                {d0.label}
                            </div>
                        </Card>

                        {isExpanded && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    minHeight: isMobile ? 120 : 140,
                                    background: "rgba(255,255,255,0.98)",
                                    borderRadius: 28,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    padding: isMobile ? 16 : 20,
                                    zIndex: 10,
                                }}
                                className="card-catalog-menu"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        paddingBottom: 8,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        src={d0.icon ?? "/images/placeholder.jpg"}
                                        alt={d0.label}
                                        width={isMobile ? 22 : 25}
                                        height={isMobile ? 22 : 25}
                                        style={{ objectFit: "contain" }}
                                    />

                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: isMobile ? 13 : 14,
                                            color: "#555555",
                                        }}
                                    >
                                        {d0.label}
                                    </div>
                                </div>

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
