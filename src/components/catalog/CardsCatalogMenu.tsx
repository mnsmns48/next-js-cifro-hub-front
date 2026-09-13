"use client";

import Link from "next/link";
import {Card} from "antd";

import {toCatalogLevelHref} from "./catalogHref";
import {catalogSidebarLevels} from "./catalogLevels";
import type {HubLevel} from "@/types/catalog";

import "../css/CardsCatalogMenu.css";

const PLACEHOLDER = "/images/placeholder.svg";

function CategoryIcon({
                          src,
                          alt,
                          className,
                      }: {
    src?: string | null;
    alt: string;
    className: string;
}) {
    return (
        <img
            src={src || PLACEHOLDER}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
            }}
        />
    );
}

export default function CardsCatalogMenu({
                                             levels,
                                         }: {
    levels: HubLevel[];
}) {
    const levelsById = new Map(
        levels.map((level) => [level.id, level]),
    );

    const cards = catalogSidebarLevels(levels);

    return (
        <div className="cards-container">
            {cards.map((card) => (
                <Link
                    key={card.id}
                    href={toCatalogLevelHref(card, levelsById)}
                    className="card-item"
                >
                    <Card hoverable className="card-catalog">
                        <div className="card-icon-wrap">
                            <CategoryIcon
                                src={card.icon}
                                alt={card.label}
                                className="card-image"
                            />
                        </div>

                        <div className="card-title">
                            {card.label}
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}