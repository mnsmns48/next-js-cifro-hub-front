"use client";

import Link from "next/link";
import { Typography } from "antd";

const { Text } = Typography;

const categories = [
    { title: "Смартфоны", slug: "smartphones" },
    { title: "Ноутбуки", slug: "laptops" },
    { title: "Аудио", slug: "audio" },
    { title: "Умный дом", slug: "smart-home" },
    { title: "Планшеты", slug: "tablets" },
    { title: "Аксессуары", slug: "accessories" },
];

export default function CategoryList() {
    return (
        <section style={{ padding: "8px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {categories.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/catalog/${cat.slug}`}
                        style={{
                            fontSize: 16,
                            padding: "4px 0",
                            color: "#1677ff",
                            lineHeight: 1.3,
                        }}
                    >
                        <Text>{cat.title}</Text>
                    </Link>
                ))}
            </div>
        </section>
    );
}
