"use client";

import {memo, useEffect, useMemo, useRef, useState, type MouseEvent} from "react";
import Image from "next/image";
import {AlignCenterOutlined, CheckOutlined, InfoCircleOutlined, ShoppingCartOutlined, StarFilled, StarOutlined} from "@ant-design/icons";

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

export interface ShortSpec {
    title: string;
    icon?: string | null;
    text?: string | null;
}

interface ProductCardProps {
    title: string;
    price: string | number;
    preview?: string;
    pics?: string[];
    shortSpecs?: ShortSpec[];
    priority?: boolean;
}

const MONTH_PATTERN =
    "январ[ьяе]|феврал[ьяе]|марта?|апрел[ьяе]|ма[йяе]|июн[ьяе]|июл[ьяе]|август[ае]?|сентябр[ьяе]|октябр[ьяе]|ноябр[ьяе]|декабр[ьяе]";

function formatSpecText(text?: string | null): string {
    const value = text?.trim() ?? "";
    if (!value || value.includes(":")) {
        return value;
    }

    const monthMatch = value.match(new RegExp(`^(.+?)\\s+(${MONTH_PATTERN})(\\s+.*)?$`, "i"));
    if (monthMatch) {
        const rest = monthMatch[3] ?? "";
        return `${monthMatch[1]}: ${monthMatch[2]}${rest}`;
    }

    const match = value.match(/^(.+?)\s+(\d.*)$/);
    if (!match) {
        return value;
    }

    return `${match[1]}: ${match[2]}`;
}

function isUsefulSpec(spec: ShortSpec): boolean {
    const text = spec.text?.trim() ?? "";
    if (!text) return false;

    const lower = text.toLowerCase();
    return !lower.includes("нет точной информации") && lower !== "unspecified";
}

function isAntutuSpec(spec: ShortSpec): boolean {
    const blob = `${spec.title} ${spec.text ?? ""}`.toLowerCase();
    return blob.includes("antutu") || blob.includes("an-tu-tu");
}

function pickVisibleSpecs(specs: ShortSpec[]): ShortSpec[] {
    const useful = specs.filter(isUsefulSpec);
    const picked = useful.slice(0, 10);
    const antutu = useful.find(isAntutuSpec);

    if (!antutu || picked.some(isAntutuSpec)) {
        return picked;
    }

    return [...picked.slice(0, 9), antutu];
}

function ProductCard({title, price, preview, pics, shortSpecs = [], priority = false}: ProductCardProps) {
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
    const visibleSpecs = useMemo(
        () => pickVisibleSpecs(shortSpecs),
        [shortSpecs],
    );
    const [specsLeft, setSpecsLeft] = useState(false);
    const [specsOpen, setSpecsOpen] = useState(false);
    const specsCloseTimer = useRef<number | null>(null);

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

    const openSpecs = (e: MouseEvent<HTMLElement>) => {
        if (visibleSpecs.length === 0 || !canHoverGallery()) return;

        if (specsCloseTimer.current) {
            window.clearTimeout(specsCloseTimer.current);
            specsCloseTimer.current = null;
        }

        const card = e.currentTarget.closest(".product-card");
        if (card) {
            const rect = card.getBoundingClientRect();
            setSpecsLeft(rect.right + 220 > window.innerWidth);
        }

        setSpecsOpen(true);
    };

    const scheduleCloseSpecs = () => {
        if (specsCloseTimer.current) {
            window.clearTimeout(specsCloseTimer.current);
        }

        specsCloseTimer.current = window.setTimeout(() => {
            setSpecsOpen(false);
            specsCloseTimer.current = null;
        }, 180);
    };

    useEffect(() => {
        return () => {
            if (specsCloseTimer.current) {
                window.clearTimeout(specsCloseTimer.current);
            }
        };
    }, []);

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
                        loading="eager"
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
        <article
            className={`product-card${specsLeft ? " product-card--specs-left" : ""}${specsOpen ? " product-card--specs-open" : ""}`}
        >
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

                {visibleSpecs.length > 0 && (
                    <button
                        type="button"
                        className={`product-card__action-btn product-card__action-btn--info${specsOpen ? " product-card__action-btn--active" : ""}`}
                        aria-label="Краткие характеристики"
                        onMouseEnter={openSpecs}
                        onMouseLeave={scheduleCloseSpecs}
                    >
                        <InfoCircleOutlined />
                    </button>
                )}
            </div>

            <div
                className="product-card__image-wrap"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {renderImage()}
            </div>

            {visibleSpecs.length > 0 && (
                <ul
                    className="product-card__specs"
                    aria-label="Краткие характеристики"
                    onMouseEnter={openSpecs}
                    onMouseLeave={scheduleCloseSpecs}
                >
                    {visibleSpecs.map((spec) => (
                        <li key={spec.title} className="product-card__spec">
                            {spec.icon ? (
                                <span className="product-card__spec-icon-wrap">
                                    <img
                                        src={normalizeUrl(spec.icon)}
                                        alt=""
                                        aria-hidden
                                        className="product-card__spec-icon"
                                    />
                                </span>
                            ) : null}
                            <span>{formatSpecText(spec.text)}</span>
                        </li>
                    ))}
                </ul>
            )}

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
