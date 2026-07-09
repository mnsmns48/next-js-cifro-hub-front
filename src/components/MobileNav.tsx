"use client";

import Link from "next/link";
import { Button, Space } from "antd-mobile";

export default function MobileNav() {
    return (
        <section
            style={{
                padding: "32px 24px",
                background: "#fff",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <Space direction="vertical" block>
                <Link href="/catalog">
                    <Button color="primary" size="large" block>
                        Каталог
                    </Button>
                </Link>

                <Link href="/search">
                    <Button color="default" size="large" block>
                        Поиск
                    </Button>
                </Link>

                <Link href="/menu">
                    <Button color="primary" size="large" block>
                        Мобильное меню
                    </Button>
                </Link>
            </Space>
        </section>
    );
}
