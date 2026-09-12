"use client";

import Image from "next/image";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";

import {isRemoteUrl} from "./productDetail";
import {useGallerySwipe} from "./useGallerySwipe";

export default function ProductGallery({
    title,
    images,
    currentUrl,
    activeIndex,
    useNativeImg,
    onStep,
    onSelect,
    onImageError,
    onOpenLightbox,
}: {
    title: string;
    images: string[];
    currentUrl: string | null;
    activeIndex: number;
    useNativeImg: boolean;
    onStep: (delta: number) => void;
    onSelect: (index: number) => void;
    onImageError: () => void;
    onOpenLightbox: () => void;
}) {
    const swipe = useGallerySwipe(images.length > 1, onStep);

    return (
        <div className="product-detail__gallery">
            <div className="product-detail__main-image-wrap">
                <button
                    type="button"
                    className="product-detail__main-image"
                    aria-label="Открыть фото на весь экран"
                    disabled={!currentUrl}
                    onTouchStart={swipe.onTouchStart}
                    onTouchEnd={swipe.onTouchEnd}
                    onClick={() => {
                        if (swipe.consumeClick()) return;
                        if (currentUrl) onOpenLightbox();
                    }}
                >
                    {currentUrl ? (
                        isRemoteUrl(currentUrl) && !useNativeImg ? (
                            <Image
                                src={currentUrl}
                                alt={title}
                                fill
                                unoptimized
                                sizes="(min-width: 1100px) 420px, 100vw"
                                className="product-detail__photo"
                                onError={onImageError}
                            />
                        ) : (
                            <img src={currentUrl} alt={title} className="product-detail__photo-native"/>
                        )
                    ) : (
                        <img src="/images/placeholder.svg" alt="" className="product-detail__photo-native"/>
                    )}
                </button>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="product-detail__gallery-arrow product-detail__gallery-arrow--prev"
                            aria-label="Предыдущее фото"
                            onClick={() => onStep(-1)}
                        >
                            <LeftOutlined/>
                        </button>
                        <button
                            type="button"
                            className="product-detail__gallery-arrow product-detail__gallery-arrow--next"
                            aria-label="Следующее фото"
                            onClick={() => onStep(1)}
                        >
                            <RightOutlined/>
                        </button>
                    </>
                )}
            </div>
            {images.length > 1 && (
                <div className="product-detail__thumbs">
                    {images.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            className={`product-detail__thumb${index === activeIndex ? " product-detail__thumb--active" : ""}`}
                            onClick={() => onSelect(index)}
                        >
                            <img src={url} alt=""/>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
