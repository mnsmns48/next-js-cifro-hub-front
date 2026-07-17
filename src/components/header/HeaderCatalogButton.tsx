"use client";
import {Button} from "antd";
import {HolderOutlined} from "@ant-design/icons";

export default function HeaderCatalogButton() {
    return (
        <Button size="small"
                style={{background: "transparent", border: "none", color: "#ffffff", fontSize: 16, fontWeight: 500}}
                icon={<span style={{color: "#e2fc2a", fontSize: 18}}><HolderOutlined/></span>}>
            КАТАЛОГ
        </Button>
    );
}
