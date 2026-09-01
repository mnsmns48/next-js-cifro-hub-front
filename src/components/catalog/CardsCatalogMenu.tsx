"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Card, Spin} from "antd";

import "../css/CardsCatalogMenu.css";

const PLACEHOLDER = "/images/placeholder.svg";

function toCatalogHref(slug?: string | null): string {
    const normalized = slug?.trim().replace(/^\/+|\/+$/g, "");
    if (!normalized) return "/catalog";

    const segments = normalized.split("/").filter(Boolean).map(encodeURIComponent);
    return `/catalog/${segments.join("/")}`;
}

interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    slug?: string | null;
    parent_id: number;
    depth: number;
}

function CategoryIcon({src, alt, className}: {src?: string | null; alt: string; className: string}) {
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

export default function CardsCatalogMenu() {
    const [levels, setLevels] = useState<HubLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/init_levels`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (Array.isArray(data)) {
                    setLevels(data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="cards-loading">
                <Spin size="small"/>
            </div>
        );
    }

    const depth0 = levels
        .filter((l) => l.depth === 0)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="cards-container">
            {depth0.map((d0) => (
                <Link
                    key={d0.id}
                    href={toCatalogHref(d0.slug)}
                    className="card-item"
                >
                    <Card hoverable className="card-catalog">
                        <div className="card-icon-wrap">
                            <CategoryIcon src={d0.icon} alt={d0.label} className="card-image"/>
                        </div>
                        <div className="card-title">{d0.label}</div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
