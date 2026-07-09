"use client";

import { Typography, Button, Space } from "antd";

const { Title, Paragraph } = Typography;

export default function Hero() {
    return (
        <section
            style={{
                width: "100%",
                padding: "80px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "40px",
                flexWrap: "wrap",
            }}
        >
            {/* LEFT SIDE — TEXT */}
            <div style={{ maxWidth: 520 }}>
                <Title level={1} style={{ marginBottom: 24 }}>
                    ЦифроХаб — электроника без лишнего шума
                </Title>

                <Paragraph style={{ fontSize: 18, marginBottom: 32 }}>
                    Каталог, поиск, категории — всё работает быстро, прозрачно и без перегрузки.
                    Современный интерфейс на Next.js 16 + Ant Design.
                </Paragraph>

                <Space size="large">
                    <Button type="primary" size="large" href="/catalog">
                        Перейти в каталог
                    </Button>

                    <Button size="large" href="/search">
                        Поиск товаров
                    </Button>
                </Space>
            </div>

            {/* RIGHT SIDE — VISUAL ACCENT */}
            <div
                style={{
                    flex: "1 1 300px",
                    minHeight: 260,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
                    opacity: 0.9,
                }}
            />
        </section>
    );
}
