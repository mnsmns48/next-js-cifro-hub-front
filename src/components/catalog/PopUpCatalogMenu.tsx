import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";


import {toCatalogLevelHref} from "./catalogHref";
import {catalogChildren, catalogSidebarLevels} from "./catalogLevels";
import type {HubLevel} from "@/types/catalog";

import "../css/PopUpCatalogMenu.css";

export interface PopUpCatalogMenuProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    levels: HubLevel[];
}

export default function PopUpCatalogMenu({open, setOpen, levels}: PopUpCatalogMenuProps) {
    const router = useRouter();

    const [activeCategoryId, setActiveCategoryId] =
        useState<number | null>(null);

    const sidebarItems = useMemo(
        () => catalogSidebarLevels(levels),
        [levels],
    );

    const levelsById = useMemo(
        () => new Map(
            levels.map((level) => [level.id, level]),
        ),
        [levels],
    );

    const resolvedActiveCategoryId = useMemo(() => {
        if (activeCategoryId !== null && sidebarItems.some((item) => item.id === activeCategoryId)) {
            return activeCategoryId;
        }
        return sidebarItems[0]?.id ?? null;
    }, [activeCategoryId, sidebarItems]);

    const activeGroups = useMemo(() => {
        if (resolvedActiveCategoryId === null) return [];
        return catalogChildren(levels, resolvedActiveCategoryId);
    }, [resolvedActiveCategoryId, levels]);

    const navigateToMenu = (level: HubLevel) => {
        setOpen(false);
        router.push(toCatalogLevelHref(level, levelsById));
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

                <div className="mega-menu">
                    <aside className="mega-menu__sidebar">
                        {sidebarItems.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={`mega-menu__category${resolvedActiveCategoryId === category.id ? " mega-menu__category--active" : ""}`}
                                onMouseEnter={() => setActiveCategoryId(category.id)}
                                onClick={() => navigateToMenu(category)}
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
                                    const items = catalogChildren(levels, group.id);

                                    return (
                                        <section key={group.id} className="mega-menu__group">
                                            <button
                                                type="button"
                                                className="mega-menu__group-title"
                                                onClick={() => navigateToMenu(group)}
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
                                                                onClick={() => navigateToMenu(item)}
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
            </div>
        </>
    );
}
