"use client";

import {memo, useEffect, useMemo, useState} from "react";
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

interface ProductCardProps {
    title: string;
    price: string | number;
    preview?: string;
    pics?: string[];
    priority?: boolean;
}

function ProductCard({title, price, preview, pics, priority = false}: ProductCardProps) {
    const candidates = useMemo(() => buildImageCandidates(preview, pics), [preview, pics]);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [useNativeImg, setUseNativeImg] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(candidates.length === 0);
    const [favorite, setFavorite] = useState(false);
    const [compare, setCompare] = useState(false);
    const [inCart, setInCart] = useState(false);

    useEffect(() => {
        setCandidateIndex(0);
        setUseNativeImg(false);
        setShowPlaceholder(candidates.length === 0);
    }, [candidates]);

    const currentUrl = candidates[candidateIndex] ?? null;

    const handleImageError = () => {
        if (!useNativeImg && currentUrl && isRemoteUrl(currentUrl)) {
            setUseNativeImg(true);
            return;
        }

        if (candidateIndex < candidates.length - 1) {
            setCandidateIndex(prev => prev + 1);
            setUseNativeImg(false);
            return;
        }

        setShowPlaceholder(true);
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
            <div className="product-card__image-wrap">
                <div className="product-card__actions">
                    <button
                        type="button"
                        className={`product-card__action-btn${favorite ? " product-card__action-btn--active" : ""}`}
                        aria-label={favorite ? "Убрать из избранного" : "В избранное"}
                        onClick={(e) => {
                            e.stopPropagation();
                            setFavorite(prev => !prev);
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
                            setCompare(prev => !prev);
                        }}
                    >
                        <AlignCenterOutlined />
                    </button>
                </div>

                {renderImage()}
            </div>

            <h3 className="product-card__title">{title}</h3>

            <p className="product-card__price">{formatPrice(price)} ₽</p>

            <button
                type="button"
                className={`product-card__button${inCart ? " product-card__button--in-cart" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setInCart(prev => !prev);
                }}
            >
                {inCart ? <CheckOutlined className="product-card__button-icon"/> : <ShoppingCartOutlined className="product-card__button-icon"/>}
                {inCart ? "В корзине" : "В корзину"}
            </button>
        </article>
    );
}

export default memo(ProductCard);
