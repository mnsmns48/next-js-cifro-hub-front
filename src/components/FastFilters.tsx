"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

const filters = [
    { label: "Цена", query: "sort=price" },
    { label: "Бренд", query: "sort=brand" },
    { label: "Наличие", query: "in_stock=1" },
    { label: "Новинки", query: "new=1" },
    { label: "Скидки", query: "discount=1" },
];

export default function FastFilters() {
    const router = useRouter();

    const applyFilter = (query: string) => {
        router.push(`/catalog?${query}`);
    };

    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                padding: "12px 0",
            }}
        >
            {filters.map((f) => (
                <Button
                    key={f.label}
                    size="small"
                    onClick={() => applyFilter(f.query)}
                    style={{
                        padding: "0 12px",
                        height: 28,
                        borderRadius: 6,
                    }}
                >
                    {f.label}
                </Button>
            ))}
        </div>
    );
}
