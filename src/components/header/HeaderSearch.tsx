"use client";

export default function HeaderSearch() {
    return (
        <input
            placeholder="Поиск ..."
            style={{
                width: "100%",
                height: 48,
                padding: "0 12px",
                border: "1px solid #ccc",
                borderRadius: 20,
                fontSize: 16,
            }}
        />
    );
}
