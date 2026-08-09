"use client";

import {useEffect, useState, useRef} from "react";
import {Card, Spin, Menu} from "antd";
import type {MenuProps} from "antd";
import Image from "next/image";

import "../css/CardsCatalogMenu.css";

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
            <div className="cards-loading">
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
                    <div className="menu-item">
                        {l1.icon && (
                            <img src={l1.icon} alt={l1.label} className="menu-icon-lvl1"/>
                        )}
                        {l1.label}
                    </div>
                ),
                children:
                    level2.length > 0
                        ? level2.map(l2 => ({
                            key: String(l2.id),
                            label: (
                                <div className="menu-item">
                                    {l2.icon && (
                                        <img src={l2.icon} alt={l2.label} className="menu-icon-lvl2"/>
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
        <div ref={containerRef} className="cards-container">
            {depth0.map(d0 => {
                const isExpanded = expandedCardId === d0.id;

                return (
                    <div key={d0.id} className="card-item">
                        <Card
                            hoverable
                            className="card-catalog"
                            onClick={() => setExpandedCardId(isExpanded ? null : d0.id)}
                            cover={
                                d0.icon ? (
                                    <img
                                        src={d0.icon}
                                        alt={d0.label}
                                        className="card-image"
                                    />
                                ) : null
                            }
                        >
                            <div className="card-title">{d0.label}</div>
                        </Card>

                        {isExpanded && (
                            <div
                                className="card-expanded"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="expanded-header">
                                    <Image src={d0.icon ?? "/images/placeholder.jpg"}
                                           alt={d0.label}
                                           width={25}
                                           height={25}
                                           className="expanded-icon"
                                    />

                                    <div className="expanded-title">{d0.label}</div>
                                </div>

                                <Menu mode="inline"
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
