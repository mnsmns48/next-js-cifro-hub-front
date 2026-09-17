"use client";

import {useState} from "react";
import {SearchOutlined} from "@ant-design/icons";

import StubModal from "@/components/header/StubModal";
import "../css/HeaderSearch.css";

export default function HeaderSearch() {
    const [stubOpen, setStubOpen] = useState(false);

    return (
        <div className="header-search-wrapper">
            <button
                type="button"
                className="header-search-field"
                aria-label="Поиск по сайту"
                onClick={() => setStubOpen(true)}
            >
                <SearchOutlined className="header-search-field__icon header-search-field__icon--search" aria-hidden/>
                <span className="header-search-field__placeholder">Поиск по сайту</span>
            </button>
            <StubModal
                open={stubOpen}
                title="Поиск временно недоступен"
                onClose={() => setStubOpen(false)}
            />
        </div>
    );
}
