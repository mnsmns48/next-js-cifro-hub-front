"use client";

import {Input} from "antd";

export default function HeaderSearch() {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <Input placeholder="Поиск"
                   style={{height: 40, border: "1px solid #ccc", borderRadius: 18, fontSize: 16}}/>
        </div>
    );
}
