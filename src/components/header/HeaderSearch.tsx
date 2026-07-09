"use client";

export default function HeaderSearch() {
    return (
        <input
            placeholder="Поиск товаров..."
            style={{
                width: "100%",
                height: 32,
                padding: "0 8px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
            }}
        />
    );
}
