"use client";

import { Card, Row, Col, Typography } from "antd";
import {
    MobileOutlined,
    LaptopOutlined,
    CustomerServiceOutlined,
    HomeOutlined,
    TabletOutlined,
    UsbOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const categories = [
    { title: "Смартфоны", icon: <MobileOutlined /> },
    { title: "Ноутбуки", icon: <LaptopOutlined /> },
    { title: "Аудио", icon: <CustomerServiceOutlined /> },
    { title: "Умный дом", icon: <HomeOutlined /> },
    { title: "Планшеты", icon: <TabletOutlined /> },
    { title: "Аксессуары", icon: <UsbOutlined /> },
];

export default function Categories() {
    return (
        <section style={{ padding: "40px 24px" }}>
            <Row gutter={[24, 24]}>
                {categories.map((cat) => (
                    <Col key={cat.title} xs={12} sm={8} md={8} lg={4}>
                        <Card
                            hoverable
                            style={{
                                textAlign: "center",
                                padding: "20px 0",
                                borderRadius: 12,
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.icon}</div>
                            <Text strong>{cat.title}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </section>
    );
}
