"use client";

import { SearchOutlined } from "@ant-design/icons";
import "../css//HeaderSearch.css";

export default function HeaderSearch() {
    return (
        <div className="header-search-wrapper">
            <button className="header-search-button">
                <SearchOutlined className="header-search-icon" />
            </button>

            <input
                type="text"
                placeholder="Поиск..."
                className="header-search-input"
            />
        </div>
    );
}
