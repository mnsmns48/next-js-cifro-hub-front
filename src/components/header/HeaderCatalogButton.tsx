"use client";
import {Button} from "antd";
import {UnorderedListOutlined} from "@ant-design/icons";

export default function HeaderCatalogButton() {
    return (
        <Button style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 17,
            fontWeight: 400,
        }}
                icon={<span style={{color: "#e2fc2a", fontSize: 22}}><UnorderedListOutlined/></span>}>
            Каталог
        </Button>

    );
}
