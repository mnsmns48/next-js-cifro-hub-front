"use client";

import {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Spin} from "antd";

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

export default function PopUpCatalogMenu({open, setOpen}: PopUpCatalogMenuProps) {
    const router = useRouter();
    const [levels, setLevels] = useState<HubLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    useEffect(() => {
        async function loadLevels() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/init_levels`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLevels(data);
                }
            } finally {
                setLoading(false);
            }
        }

        void loadLevels();
    }, []);

    const depth0 = useMemo(
        () => levels.filter((l) => l.depth === 0).sort((a, b) => a.sort_order - b.sort_order),
        [levels],
    );
    const depth1 = useMemo(
        () => levels.filter((l) => l.depth === 1).sort((a, b) => a.sort_order - b.sort_order),
        [levels],
    );
    const depth2 = useMemo(
        () => levels.filter((l) => l.depth === 2).sort((a, b) => a.sort_order - b.sort_order),
        [levels],
    );

    useEffect(() => {
        if (depth0.length === 0) return;
        setActiveCategoryId((prev) => {
            if (prev !== null && depth0.some((item) => item.id === prev)) {
                return prev;
            }
            return depth0[0].id;
        });
    }, [depth0]);

    const activeGroups = useMemo(() => {
        if (activeCategoryId === null) return [];
        return depth1.filter((item) => item.parent_id === activeCategoryId);
    }, [activeCategoryId, depth1]);

    const navigateToMenu = (id: number) => {
        setOpen(false);
        router.push(`/catalog?menu=${id}`);
    };

    if (!open) return null;

    return (
        <>
            <div className="popup-hover-zone" onMouseEnter={() => setOpen(true)}/>
            <div
                className="popup-catalog-menu"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {loading ? (
                    <div className="popup-loading">
                        <Spin size="small"/>
                    </div>
                ) : (
                    <div className="mega-menu">
                        <aside className="mega-menu__sidebar">
                            {depth0.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`mega-menu__category${activeCategoryId === category.id ? " mega-menu__category--active" : ""}`}
                                    onMouseEnter={() => setActiveCategoryId(category.id)}
                                    onClick={() => navigateToMenu(category.id)}
                                >
                                    {category.icon && (
                                        <img
                                            src={category.icon}
                                            alt=""
                                            className="mega-menu__category-icon"
                                        />
                                    )}
                                    <span>{category.label}</span>
                                </button>
                            ))}
                        </aside>

                        <div className="mega-menu__content">
                            {activeGroups.length === 0 ? (
                                <p className="mega-menu__empty">Подкатегории не найдены</p>
                            ) : (
                                <div className="mega-menu__groups">
                                    {activeGroups.map((group) => {
                                        const items = depth2.filter((item) => item.parent_id === group.id);

                                        return (
                                            <section key={group.id} className="mega-menu__group">
                                                <button
                                                    type="button"
                                                    className="mega-menu__group-title"
                                                    onClick={() => navigateToMenu(group.id)}
                                                >
                                                    {group.label}
                                                </button>

                                                {items.length > 0 ? (
                                                    <ul className="mega-menu__links">
                                                        {items.map((item) => (
                                                            <li key={item.id}>
                                                                <button
                                                                    type="button"
                                                                    className="mega-menu__link"
                                                                    onClick={() => navigateToMenu(item.id)}
                                                                >
                                                                    {item.label}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </section>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
