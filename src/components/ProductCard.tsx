"use client";

import {memo, useEffect, useMemo, useState, type MouseEvent} from "react";
import Image from "next/image";
import {AlignCenterOutlined, CheckOutlined, ShoppingCartOutlined, StarFilled, StarOutlined} from "@ant-design/icons";

import "./css/ProductCard.css";

const PLACEHOLDER = "/images/placeholder.svg";

function formatPrice(price: string | number): string {
    return Number(price).toLocaleString("ru-RU");
}

function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }
    return trimmed;
}

function buildImageCandidates(preview?: string | null, pics?: string[]): string[] {
    const candidates: string[] = [];

    const add = (url?: string | null) => {
        if (!url?.trim()) return;
        const normalized = normalizeUrl(url);
        if (!candidates.includes(normalized)) {
            candidates.push(normalized);
        }
    };

    add(preview);
    pics?.forEach(add);

    return candidates;
}

function isRemoteUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

function canHoverGallery(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

interface ProductCardProps {
    title: string;
    price: string | number;
    preview?: string;
    pics?: string[];
    priority?: boolean;
}

function ProductCard({title, price, preview, pics, priority = false}: ProductCardProps) {
    const candidates = useMemo(() => buildImageCandidates(preview, pics), [preview, pics]);
    const [failedUrls, setFailedUrls] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [useNativeImg, setUseNativeImg] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [compare, setCompare] = useState(false);
    const [inCart, setInCart] = useState(false);

    const images = useMemo(
        () => candidates.filter((url) => !failedUrls.includes(url)),
        [candidates, failedUrls],
    );

    useEffect(() => {
        setFailedUrls([]);
        setActiveIndex(0);
        setUseNativeImg(false);
    }, [candidates]);

    useEffect(() => {
        if (activeIndex >= images.length) {
            setActiveIndex(Math.max(0, images.length - 1));
        }
    }, [activeIndex, images.length]);

    const showPlaceholder = images.length === 0;
    const currentUrl = images[activeIndex] ?? null;
    const hasGallery = images.length > 1;

    const handleImageError = () => {
        if (!currentUrl) {
            return;
        }

        if (!useNativeImg && isRemoteUrl(currentUrl)) {
            setUseNativeImg(true);
            return;
        }

        setFailedUrls((prev) => (prev.includes(currentUrl) ? prev : [...prev, currentUrl]));
        setUseNativeImg(false);
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!hasGallery || !canHoverGallery()) return;

        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width <= 0) return;

        const ratio = (e.clientX - rect.left) / rect.width;
        const nextIndex = Math.min(
            images.length - 1,
            Math.max(0, Math.floor(ratio * images.length)),
        );

        if (nextIndex !== activeIndex) {
            setActiveIndex(nextIndex);
            setUseNativeImg(false);
        }
    };

    const handleMouseLeave = () => {
        if (!hasGallery) return;
        setActiveIndex(0);
        setUseNativeImg(false);
    };

    const handleMouseEnter = () => {
        if (!hasGallery || !canHoverGallery()) return;

        images.slice(1).forEach((url) => {
            const img = new window.Image();
            img.src = url;
        });
    };

    const renderImage = () => {
        if (showPlaceholder || !currentUrl) {
            return (
                <div className="product-card__image-inner product-card__image-inner--static">
                    <img
                        src={PLACEHOLDER}
                        alt=""
                        aria-hidden
                        className="product-card__image"
                    />
                </div>
            );
        }

        if (isRemoteUrl(currentUrl) && !useNativeImg) {
            return (
                <div className="product-card__image-inner">
                    <Image
                        key={`next-${currentUrl}`}
                        src={currentUrl}
                        alt={title}
                        fill
                        sizes="(min-width: 1200px) 20vw, 250px"
                        priority={priority}
                        className="product-card__image product-card__image--fill"
                        onError={handleImageError}
                    />
                </div>
            );
        }

        return (
            <div className="product-card__image-inner product-card__image-inner--static">
                <img
                    key={`native-${currentUrl}`}
                    src={currentUrl}
                    alt={title}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    className="product-card__image"
                    onError={handleImageError}
                />
            </div>
        );
    };

    return (
        <article className="product-card">
            <div className="product-card__actions">
                <button
                    type="button"
                    className={`product-card__action-btn${favorite ? " product-card__action-btn--active" : ""}`}
                    aria-label={favorite ? "Убрать из избранного" : "В избранное"}
                    onClick={(e) => {
                        e.stopPropagation();
                        setFavorite((prev) => !prev);
                    }}
                >
                    {favorite ? <StarFilled /> : <StarOutlined />}
                </button>

                <button
                    type="button"
                    className={`product-card__action-btn${compare ? " product-card__action-btn--active" : ""}`}
                    aria-label={compare ? "Убрать из сравнения" : "Добавить в сравнение"}
                    onClick={(e) => {
                        e.stopPropagation();
                        setCompare((prev) => !prev);
                    }}
                >
                    <AlignCenterOutlined />
                </button>
            </div>

            <div
                className="product-card__image-wrap"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {renderImage()}
            </div>

            <h3 className="product-card__title">{title}</h3>

            <p className="product-card__price">{formatPrice(price)} ₽</p>

            <button
                type="button"
                className={`product-card__button${inCart ? " product-card__button--in-cart" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setInCart((prev) => !prev);
                }}
            >
                {inCart ? <CheckOutlined className="product-card__button-icon"/> : <ShoppingCartOutlined className="product-card__button-icon"/>}
                {inCart ? "В корзине" : "В корзину"}
            </button>
        </article>
    );
}

export default memo(ProductCard);
