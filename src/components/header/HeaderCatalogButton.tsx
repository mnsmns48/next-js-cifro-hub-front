"use client";
import {Button} from "antd";
import {HolderOutlined} from "@ant-design/icons";

export default function HeaderCatalogButton() {
    return (
        <Button style={{background: "transparent", border: "none", color: "#fff", fontSize: 18, fontWeight: 400}}
                icon={<span style={{color: "#e2fc2a", fontSize: 25}}><HolderOutlined /></span>}>
            Каталог
        </Button>

    );
}
