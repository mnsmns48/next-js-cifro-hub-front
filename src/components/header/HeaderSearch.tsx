"use client";

import {Input} from "antd";

export default function HeaderSearch() {
    return (
        <Input
            placeholder="Поиск ..."
            style={{
                width: "100%",
                height: 48,
                padding: "0 12px",
                border: "1px solid #ccc",
                borderRadius: 18,
                fontSize: 16,
            }}
        />
    );
}
