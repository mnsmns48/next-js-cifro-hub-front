"use client";

import {SearchOutlined} from "@ant-design/icons";

import "../css/HeaderSearch.css";

export default function HeaderSearch() {
    return (
        <div className="header-search-wrapper">
            <label className="header-search-field">
                <SearchOutlined className="header-search-field__icon header-search-field__icon--search" aria-hidden/>

                <input
                    type="search"
                    placeholder="Поиск по сайту"
                    className="header-search-field__input"
                    aria-label="Поиск по сайту"
                />
            </label>
        </div>
    );
}
