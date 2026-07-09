"use client";

export default function HeaderActions() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 13,
            }}
        >
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                Сравнение
            </button>

            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                Избранное
            </button>

            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                Корзина
            </button>

            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                Вход
            </button>
        </div>
    );
}
