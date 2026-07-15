"use client";

import { Card, Rate, Button } from "antd";

interface ProductCardProps {
    title: string;
    price: string | number;
    image: string;
}

export default function ProductCard({ title, price, image }: ProductCardProps) {
    return (
        <Card
            hoverable
            style={{
                minWidth: 260,
                height: 380,
                flex: "0 0 auto",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}

            cover={
                <img
                    src={image}
                    alt={title}
                    style={{
                        height: 180,
                        objectFit: "cover",
                        background: "#f5f5f5",
                    }}
                />
            }
        >
            <div
                style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 6,
                    minHeight: 48,
                }}
            >
                {title}
            </div>

            <Rate disabled defaultValue={4} style={{ fontSize: 14 }} />

            <div style={{ fontSize: 20, fontWeight: 700, margin: "12px 0" }}>
                {price} ₽
            </div>

            <Button
                type="primary"
                style={{
                    width: "100%",
                    borderRadius: 12,
                    background: "#ffd400",
                    color: "#000",
                    fontWeight: 600,
                }}
            >
                В корзину
            </Button>
        </Card>

    );
}
