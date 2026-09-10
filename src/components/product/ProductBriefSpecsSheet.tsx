"use client";

import {useEffect} from "react";
import {CloseOutlined, InfoCircleOutlined} from "@ant-design/icons";

import {useBodyScrollLock} from "@/components/category/useBodyScrollLock";
import type {BriefSheetSpec} from "./productDetail";

export default function ProductBriefSpecsSheet({
    specs,
    onClose,
}: {
    specs: BriefSheetSpec[];
    onClose: () => void;
}) {
    useBodyScrollLock(true);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="product-detail__brief-sheet-backdrop" onClick={onClose}>
            <section
                className="product-detail__brief-sheet"
                role="dialog"
                aria-modal="true"
                aria-label="Краткие характеристики товара"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="product-detail__brief-sheet-header">
                    <h3>Краткие характеристики</h3>
                    <button type="button" aria-label="Закрыть" onClick={onClose}>
                        <CloseOutlined/>
                    </button>
                </header>

                <div className="product-detail__brief-sheet-content">
                    <ul className="product-detail__brief-sheet-list">
                        {specs.map((row) => (
                            <li key={`brief-sheet-${row.label}`}>
                                <span className="product-detail__brief-sheet-list-icon" aria-hidden>
                                    {row.icon ? (
                                        <img src={row.icon} alt=""/>
                                    ) : (
                                        <InfoCircleOutlined/>
                                    )}
                                </span>
                                <div className="product-detail__brief-sheet-list-text">
                                    <strong>{row.value}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
