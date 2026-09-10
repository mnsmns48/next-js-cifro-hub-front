"use client";

import {useEffect} from "react";
import {CloseOutlined, RightOutlined} from "@ant-design/icons";

import {useBodyScrollLock} from "@/components/category/useBodyScrollLock";

function ProsConsLists({pros, cons}: {pros: string[]; cons: string[]}) {
    return (
        <>
            {pros.length > 0 && (
                <div className="product-detail__pros-cons-block product-detail__pros-cons-block--pros">
                    <h3>Преимущества</h3>
                    <ul className="product-detail__pros">
                        {pros.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
            {cons.length > 0 && (
                <div className="product-detail__pros-cons-block product-detail__pros-cons-block--cons">
                    <h3>Недостатки</h3>
                    <ul className="product-detail__cons">
                        {cons.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

export default function ProductProsCons({
    pros,
    cons,
    sheetOpen,
    onOpen,
    onClose,
}: {
    pros: string[];
    cons: string[];
    sheetOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}) {
    useBodyScrollLock(sheetOpen);

    useEffect(() => {
        if (!sheetOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, sheetOpen]);

    return (
        <>
            <div className="product-detail__pros-cons">
                <ProsConsLists pros={pros} cons={cons}/>
            </div>

            <button type="button" className="product-detail__pros-trigger" onClick={onOpen}>
                <span>Преимущества и недостатки</span>
                <RightOutlined className="product-detail__pros-trigger-arrow"/>
            </button>

            {sheetOpen && (
                <div className="product-detail__pros-sheet-backdrop" onClick={onClose}>
                    <section
                        className="product-detail__pros-sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Плюсы и минусы товара"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className="product-detail__pros-sheet-header">
                            <button type="button" aria-label="Закрыть" onClick={onClose}>
                                <CloseOutlined/>
                            </button>
                        </header>
                        <div className="product-detail__pros-sheet-content">
                            {pros.length > 0 && (
                                <div>
                                    <h3>Преимущества</h3>
                                    <ul className="product-detail__pros">
                                        {pros.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {cons.length > 0 && (
                                <div>
                                    <h3>Недостатки</h3>
                                    <ul className="product-detail__cons">
                                        {cons.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
