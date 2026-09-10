"use client";

import {useEffect} from "react";
import {CloseOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";

import {useGallerySwipe} from "./useGallerySwipe";

export default function ProductLightbox({
    title,
    currentUrl,
    activeIndex,
    imageCount,
    onClose,
    onStep,
}: {
    title: string;
    currentUrl: string;
    activeIndex: number;
    imageCount: number;
    onClose: () => void;
    onStep: (delta: number) => void;
}) {
    const canSwipe = imageCount > 1;
    const swipe = useGallerySwipe(canSwipe, onStep);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
            if (!canSwipe) return;
            if (event.key === "ArrowLeft") onStep(-1);
            if (event.key === "ArrowRight") onStep(1);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [canSwipe, onClose, onStep]);

    return (
        <div
            className="product-detail__lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографий товара"
            onClick={onClose}
        >
            <button
                type="button"
                className="product-detail__lightbox-close"
                aria-label="Закрыть"
                onClick={onClose}
            >
                <CloseOutlined/>
            </button>

            {canSwipe && (
                <button
                    type="button"
                    className="product-detail__lightbox-arrow product-detail__lightbox-arrow--prev"
                    aria-label="Предыдущее фото"
                    onClick={(event) => {
                        event.stopPropagation();
                        onStep(-1);
                    }}
                >
                    <LeftOutlined/>
                </button>
            )}

            <div
                className="product-detail__lightbox-image"
                onTouchStart={swipe.onTouchStart}
                onTouchEnd={swipe.onTouchEnd}
                onClick={(event) => event.stopPropagation()}
            >
                <img src={currentUrl} alt={title}/>
            </div>

            {canSwipe && (
                <button
                    type="button"
                    className="product-detail__lightbox-arrow product-detail__lightbox-arrow--next"
                    aria-label="Следующее фото"
                    onClick={(event) => {
                        event.stopPropagation();
                        onStep(1);
                    }}
                >
                    <RightOutlined/>
                </button>
            )}

            <span className="product-detail__lightbox-counter">
                {activeIndex + 1} / {imageCount}
            </span>
        </div>
    );
}
