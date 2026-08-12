import Link from "next/link";

export default function NotFound() {
    return (
        <section
            style={{
                minHeight: "40vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: "48px 16px",
                textAlign: "center",
            }}
        >
            <p style={{fontSize: 48, fontWeight: 700, margin: 0}}>404</p>
            <h1 style={{fontSize: 20, fontWeight: 600, margin: 0}}>Страница не найдена</h1>
            <p style={{margin: 0, color: "#707f8d", fontSize: 14}}>
                Проверьте адрес или вернитесь на главную
            </p>
            <Link
                href="/"
                style={{
                    marginTop: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    background: "#e2fc2a",
                    border: "1px solid #e5e5e5",
                    fontWeight: 600,
                    fontSize: 14,
                }}
            >
                На главную
            </Link>
        </section>
    );
}
