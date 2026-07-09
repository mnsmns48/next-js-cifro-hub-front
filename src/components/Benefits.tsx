"use client";

import { Row, Col, Card, Typography } from "antd";
import {
    ThunderboltOutlined,
    SafetyCertificateOutlined,
    SmileOutlined,
    RocketOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const benefits = [
    {
        title: "Быстрая доставка",
        description: "Оперативная логистика по всей стране.",
        icon: <RocketOutlined />,
    },
    {
        title: "Честные цены",
        description: "Прозрачная стоимость без скрытых надбавок.",
        icon: <SafetyCertificateOutlined />,
    },
    {
        title: "Проверенные бренды",
        description: "Только надёжные производители и сертифицированные товары.",
        icon: <ThunderboltOutlined />,
    },
    {
        title: "Умный поиск",
        description: "Находим нужное за секунды благодаря продвинутому алгоритму.",
        icon: <SmileOutlined />,
    },
];

export default function Benefits() {
    return (
        <section style={{ padding: "60px 24px" }}>
            <Title level={3} style={{ textAlign: "center", marginBottom: 40 }}>
                Почему выбирают ЦифроХаб
            </Title>

            <Row gutter={[24, 24]}>
                {benefits.map((b) => (
                    <Col key={b.title} xs={24} sm={12} md={12} lg={6}>
                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                padding: "24px",
                                borderRadius: 12,
                                minHeight: 200,
                            }}
                        >
                            <div style={{ fontSize: 40, marginBottom: 16 }}>{b.icon}</div>
                            <Paragraph strong style={{ fontSize: 18 }}>
                                {b.title}
                            </Paragraph>
                            <Paragraph type="secondary">{b.description}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </section>
    );
}
