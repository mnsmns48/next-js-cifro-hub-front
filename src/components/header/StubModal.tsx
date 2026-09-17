"use client";

import {useEffect} from "react";
import {createPortal} from "react-dom";
import {CloseOutlined} from "@ant-design/icons";

import {useBodyScrollLock} from "@/components/category/useBodyScrollLock";
import "../css/StubModal.css";

export default function StubModal({
    open,
    title,
    onClose,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
}) {
    useBodyScrollLock(open);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="stub-modal" onClick={onClose}>
            <div
                className="stub-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="stub-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="stub-modal__close"
                    aria-label="Закрыть"
                    onClick={onClose}
                >
                    <CloseOutlined/>
                </button>
                <h2 id="stub-modal-title" className="stub-modal__title">{title}</h2>
                <button type="button" className="stub-modal__ok" onClick={onClose}>
                    Понятно
                </button>
            </div>
        </div>,
        document.body,
    );
}
