"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
    const router = useRouter();
    const [value, setValue] = useState("");

    const handleSearch = () => {
        if (!value.trim()) return;
        router.push(`/search?q=${encodeURIComponent(value)}`);
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
                padding: "16px 0",
            }}
        >
            <Input
                size="large"
                placeholder="Поиск товаров..."
                prefix={<SearchOutlined />}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
            />
        </div>
    );
}
