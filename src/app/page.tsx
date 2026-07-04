"use client";

import {Button, Typography, Space} from "antd";
import {Button as MobileButton} from "antd-mobile";

const {Title, Paragraph} = Typography;

export default function HomePage() {
    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
        }}
        >
            <Title level={2}>ЦифроХаб — фронтенд запущен</Title>

            <Paragraph style={{maxWidth: 600, textAlign: "center"}}>
                Проект успешно создан. Ant Design и AntD Mobile готовы к работе.
                Можно начинать наполнение архитектуры: каталог, категории, карточки,
                поиск, фильтры, SSR/ISR.
            </Paragraph>

            <Space direction="vertical" size="large" style={{marginTop: 40}}>
                <Button type="primary" size="large" href="/catalog">
                    Перейти в каталог
                </Button>

                <Button size="large" href="/search">
                    Перейти к поиску
                </Button>

                <MobileButton color="primary" size="large">
                    Мобильная кнопка (AntD Mobile)
                </MobileButton>
            </Space>
        </main>
    );
}
