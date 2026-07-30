"use client";

import { useEffect, useState } from "react";
import { Menu, Spin } from "antd";
import type { MenuProps } from "antd";
import { Dispatch, SetStateAction } from "react";

import "../css/PopUpCatalogMenu.css";

interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    parent_id: number;
    depth: number;
}

interface PopUpCatalogMenuProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function PopUpCatalogMenu({ open, setOpen }: PopUpCatalogMenuProps) {
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

    if (!open) return null;

    if (loading) {
        return (
            <div className="popup-loading">
                <Spin size="small" />
            </div>
        );
    }

    const depth0 = levels.filter(l => l.depth === 0).sort((a, b) => a.sort_order - b.sort_order);
    const depth1 = levels.filter(l => l.depth === 1).sort((a, b) => a.sort_order - b.sort_order);
    const depth2 = levels.filter(l => l.depth === 2).sort((a, b) => a.sort_order - b.sort_order);

    const buildMenuTree = (): MenuProps["items"] =>
        depth0.map(d0 => {
            const childrenLevel1 = depth1.filter(l => l.parent_id === d0.id);

            return {
                key: String(d0.id),
                icon: d0.icon ? <img src={d0.icon} className="menu-icon-lvl0" /> : undefined,
                label: d0.label,

                children: childrenLevel1.map(l1 => {
                    const childrenLevel2 = depth2.filter(l => l.parent_id === l1.id);

                    if (childrenLevel2.length > 0) {
                        return {
                            key: String(l1.id),
                            icon: l1.icon ? <img src={l1.icon} className="menu-icon-lvl1" /> : undefined,
                            label: l1.label,

                            children: childrenLevel2.map(l2 => ({
                                key: String(l2.id),
                                icon: l2.icon ? <img src={l2.icon} className="menu-icon-lvl2" /> : undefined,
                                label: l2.label,
                            })),
                        };
                    }

                    return {
                        key: String(l1.id),
                        icon: l1.icon ? <img src={l1.icon} className="menu-icon-lvl1" /> : undefined,
                        label: l1.label,
                    };
                }),
            };
        });

    return (
        <>
            {/* Hover zone */}
            <div
                className="popup-hover-zone"
                onMouseEnter={() => setOpen(true)}
            />

            {/* Popup menu */}
            <div
                className="popup-catalog-menu"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <Menu
                    className="popup-menu"
                    mode="vertical"
                    triggerSubMenuAction="hover"
                    items={buildMenuTree()}
                    onClick={(item) => {
                        const id = Number(item.key);
                        window.location.href = `/search?menu=${id}`;
                    }}
                />
            </div>
        </>
    );
}
