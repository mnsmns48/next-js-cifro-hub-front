"use client";
import {Button} from 'antd'

export default function HeaderCatalogButton() {
    return (
        <Button
            style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: 14,
            }}
        >
            Каталог
        </Button>
    );
}
