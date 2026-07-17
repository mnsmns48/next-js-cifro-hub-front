"use client";

import {Card, Rate, Button} from "antd";

interface ProductCardProps {
    title: string;
    price: string | number;
    image: string;
}

export default function ProductCard({title, price, image}: ProductCardProps) {
    return (
        <Card hoverable style={{
            width: 210,
            height: 360,
            flex: "0 0 auto",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}
              cover={
                  <div
                      style={{
                          height: 180,
                          padding: 15,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",

                      }}
                  >
                      <img src={image}
                           alt={title}
                           style={{
                               maxWidth: "100%",
                               maxHeight: "100%",
                               objectFit: "contain",
                               display: "block",
                           }}
                      />
                  </div>
              }

        >
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 400,
                    marginBottom: 6,
                    height: 22,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {title}
            </div>

            <div style={{height: 20, display: "flex", alignItems: "center"}}>
                <Rate disabled defaultValue={4} style={{fontSize: 14}}/>
            </div>

            <div style={{
                fontSize: 20,
                fontWeight: 700,
                margin: "12px 0",
                height: 24,
                display: "flex",
                alignItems: "center",
            }}
            >
                {price} ₽
            </div>

            <div style={{marginTop: "auto"}}>
                <Button
                    type="primary"
                    style={{
                        width: "100%",
                        height: 40,
                        borderRadius: 12,
                        background: "#e2fc2a",
                        border: "1px solid #e8e8e8",
                        color: "#000",
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    В корзину
                </Button>
            </div>
        </Card>


    );
}
