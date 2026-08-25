"use client";

import {useEffect, useMemo, useRef, useState, type TouchEvent} from "react";
import Image from "next/image";
import Link from "next/link";
import {
    AlignCenterOutlined,
    CheckOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    ShoppingCartOutlined,
    StarFilled,
    StarOutlined,
} from "@ant-design/icons";
import {Spin} from "antd";

import "../css/ProductDetail.css";

interface RouteItem {
    path_id: number;
    label: string;
}

interface SpecRow {
    param: string;
    value: string;
}

interface SpecFeature {
    title: string;
    rows: SpecRow[];
}

interface ProductAttr {
    id?: number;
    value?: string;
    alias?: string;
    key?: {
        key?: string;
        alias?: string;
    };
}

interface ProductDetailData {
    id?: number;
    origin: number;
    title: string;
    output_price: number;
    warranty?: string | null;
    preview?: string | null;
    pics?: string[];
    route?: RouteItem[];
    brand_obj?: { brand?: string } | null;
    type_obj?: { type?: string } | null;
    model?: string | null;
    attrs?: ProductAttr[];
    full_specs?: { features?: SpecFeature[] } | null;
    pros_cons?: Record<string, unknown> | null;
}

function formatPrice(price: string | number): string {
    return Number(price).toLocaleString("ru-RU");
}

function isRemoteUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

function attrLabel(attr: ProductAttr): string {
    return attr.key?.alias || attr.key?.key || attr.alias || "";
}

function isUsefulValue(value?: string | null): value is string {
    const text = value?.trim() ?? "";
    if (!text) return false;
    const lower = text.toLowerCase();
    return !lower.includes("нет точной информации") && lower !== "unspecified";
}

function buildBriefSpecs(product: ProductDetailData, limit: number): SpecRow[] {
    const rows: SpecRow[] = [];
    const seen = new Set<string>();

    const add = (param: string, value?: string | null) => {
        const label = param.trim();
        if (!label || !isUsefulValue(value) || seen.has(label.toLowerCase())) return;
        seen.add(label.toLowerCase());
        rows.push({param: label, value: value.trim()});
    };

    add("Производитель", product.brand_obj?.brand);
    add("Модель", product.model);
    add("Гарантия", product.warranty);

    (product.attrs ?? []).forEach((attr) => {
        add(attrLabel(attr), attr.alias || attr.value);
    });

    product.full_specs?.features?.forEach((feature) => {
        feature.rows?.forEach((row) => add(row.param, row.value));
    });

    return rows.slice(0, limit);
}

function listFromUnknown(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

export default function ProductDetail({origin}: {origin: string}) {
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [useNativeImg, setUseNativeImg] = useState(false);
    const [inCart, setInCart] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [compare, setCompare] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [prosSheetOpen, setProsSheetOpen] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const suppressImageClick = useRef(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setProduct(null);
        setActiveIndex(0);
        setUseNativeImg(false);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api3/product?origin=${encodeURIComponent(origin)}`)
            .then((res) => {
                if (!res.ok) throw new Error("product");
                return res.json();
            })
            .then((data) => {
                if (!cancelled) {
                    setProduct(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [origin]);

    const images = useMemo(
        () => [...new Set(
            [product?.preview, ...(product?.pics ?? [])]
                .filter((url): url is string => typeof url === "string"),
        )],
        [product?.preview, product?.pics],
    );
    const currentUrl = images[activeIndex] ?? null;
    const features = product?.full_specs?.features?.filter((item) => item.rows?.length) ?? [];
    const pros = listFromUnknown(
        product?.pros_cons?.advantage ??
        product?.pros_cons?.pros ??
        product?.pros_cons?.pluses ??
        product?.pros_cons?.advantages,
    );
    const cons = listFromUnknown(
        product?.pros_cons?.disadvantage ??
        product?.pros_cons?.cons ??
        product?.pros_cons?.minuses ??
        product?.pros_cons?.disadvantages,
    );
    const hasPros = pros.length > 0 || cons.length > 0;
    const briefSpecs = product ? buildBriefSpecs(product, hasPros ? 7 : 12) : [];

    const handleGalleryTouchStart = (event: TouchEvent<HTMLElement>) => {
        const touch = event.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        suppressImageClick.current = false;
    };

    const handleGalleryTouchEnd = (event: TouchEvent<HTMLElement>) => {
        if (touchStartX.current === null || touchStartY.current === null || images.length <= 1) {
            touchStartX.current = null;
            touchStartY.current = null;
            return;
        }

        const touch = event.changedTouches[0];
        const distanceX = touch.clientX - touchStartX.current;
        const distanceY = touch.clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        if (Math.abs(distanceX) < 50 || Math.abs(distanceX) <= Math.abs(distanceY)) return;

        suppressImageClick.current = true;
        setActiveIndex((index) => (
            distanceX < 0
                ? (index + 1) % images.length
                : (index - 1 + images.length) % images.length
        ));
        setUseNativeImg(false);
    };

    useEffect(() => {
        if (!galleryOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setGalleryOpen(false);
            }
            if (images.length > 1 && event.key === "ArrowLeft") {
                setActiveIndex((index) => (index - 1 + images.length) % images.length);
                setUseNativeImg(false);
            }
            if (images.length > 1 && event.key === "ArrowRight") {
                setActiveIndex((index) => (index + 1) % images.length);
                setUseNativeImg(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [galleryOpen, images.length]);

    useEffect(() => {
        if (!prosSheetOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setProsSheetOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [prosSheetOpen]);

    if (loading) {
        return (
            <div className="product-detail__loading">
                <Spin/>
            </div>
        );
    }

    if (error || !product) {
        return (
            <section className="product-detail__empty">
                <h1>Товар не найден</h1>
                <p>Проверьте ссылку или вернитесь в каталог</p>
                <Link href="/catalog">В каталог</Link>
            </section>
        );
    }

    const metaParts = [
        product.model ? `Модель: ${product.model}` : null,
        product.warranty ? `Гарантия: ${product.warranty}` : null,
    ].filter(Boolean);

    return (
        <article className="product-detail">
            {product.route && product.route.length > 0 && (
                <nav className="product-detail__nav" aria-label="Навигация">
                    {product.route.map((item, index) => (
                        <span key={`${item.path_id}-${item.label}`}>
                            {index > 0 ? <span className="product-detail__nav-sep">›</span> : null}
                            <Link href={index === 0 ? "/" : `/catalog?menu=${item.path_id}`}>
                                {item.label}
                            </Link>
                        </span>
                    ))}
                </nav>
            )}

            <h1 className="product-detail__title">{product.title}</h1>

            <p className="product-detail__meta">
                {metaParts.map((part, index) => (
                    <span key={part}>
                        {index > 0 ? <span className="product-detail__meta-dot">·</span> : null}
                        {part}
                    </span>
                ))}
            </p>

            <div className="product-detail__card">
                <div className="product-detail__gallery">
                    <div className="product-detail__main-image-wrap">
                        <button
                            type="button"
                            className="product-detail__main-image"
                            aria-label="Открыть фото на весь экран"
                            disabled={!currentUrl}
                        onTouchStart={handleGalleryTouchStart}
                        onTouchEnd={handleGalleryTouchEnd}
                        onClick={() => {
                            if (suppressImageClick.current) {
                                suppressImageClick.current = false;
                                return;
                            }
                            if (currentUrl) setGalleryOpen(true);
                        }}
                        >
                            {currentUrl ? (
                                isRemoteUrl(currentUrl) && !useNativeImg ? (
                                    <Image
                                        src={currentUrl}
                                        alt={product.title}
                                        fill
                                        sizes="(min-width: 1100px) 420px, 100vw"
                                        className="product-detail__photo"
                                        onError={() => setUseNativeImg(true)}
                                    />
                                ) : (
                                    <img src={currentUrl} alt={product.title} className="product-detail__photo-native"/>
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
                                    onClick={() => {
                                        setActiveIndex((index) => (index - 1 + images.length) % images.length);
                                        setUseNativeImg(false);
                                    }}
                                >
                                    <LeftOutlined/>
                                </button>
                                <button
                                    type="button"
                                    className="product-detail__gallery-arrow product-detail__gallery-arrow--next"
                                    aria-label="Следующее фото"
                                    onClick={() => {
                                        setActiveIndex((index) => (index + 1) % images.length);
                                        setUseNativeImg(false);
                                    }}
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
                                    onClick={() => {
                                        setActiveIndex(index);
                                        setUseNativeImg(false);
                                    }}
                                >
                                    <img src={url} alt=""/>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail__specs-col">
                    {briefSpecs.length > 0 ? (
                        <dl className="product-detail__brief">
                            {briefSpecs.map((row) => (
                                <div key={row.param} className="product-detail__brief-row">
                                    <dt>{row.param}</dt>
                                    <dd>{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="product-detail__specs-empty">Краткие характеристики появятся позже</p>
                    )}
                    {features.length > 0 && (
                        <button
                            type="button"
                            className="product-detail__all-specs"
                            onClick={() => {
                                document.getElementById("product-specs")?.scrollIntoView({behavior: "smooth"});
                            }}
                        >
                            Все характеристики
                        </button>
                    )}

                    {hasPros && (
                        <>
                            <div className="product-detail__pros-cons">
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
                            </div>

                            <button
                                type="button"
                                className="product-detail__pros-trigger"
                                onClick={() => setProsSheetOpen(true)}
                            >
                                <span>Преимущества и недостатки</span>
                                <span className="product-detail__pros-trigger-arrow" aria-hidden>›</span>
                            </button>

                            {prosSheetOpen && (
                                <div
                                    className="product-detail__pros-sheet-backdrop"
                                    onClick={() => setProsSheetOpen(false)}
                                >
                                    <section
                                        className="product-detail__pros-sheet"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-label="Плюсы и минусы товара"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <header className="product-detail__pros-sheet-header">
                                            <button
                                                type="button"
                                                aria-label="Закрыть"
                                                onClick={() => setProsSheetOpen(false)}
                                            >
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
                    )}

                    <aside className="product-detail__buy">
                        <p className="product-detail__price">{formatPrice(product.output_price)} ₽</p>
                        <div className="product-detail__buy-row">
                            <button
                                type="button"
                                className={`product-detail__cart${inCart ? " product-detail__cart--in" : ""}`}
                                onClick={() => setInCart((prev) => !prev)}
                            >
                                {inCart ? <CheckOutlined/> : <ShoppingCartOutlined/>}
                                {inCart ? "В корзине" : "В корзину"}
                            </button>
                            <div className="product-detail__buy-actions">
                                <button
                                    type="button"
                                    className={`product-detail__icon-btn${favorite ? " product-detail__icon-btn--active" : ""}`}
                                    aria-label={favorite ? "Убрать из избранного" : "В избранное"}
                                    onClick={() => setFavorite((prev) => !prev)}
                                >
                                    {favorite ? <StarFilled/> : <StarOutlined/>}
                                </button>
                                <button
                                    type="button"
                                    className={`product-detail__icon-btn${compare ? " product-detail__icon-btn--active" : ""}`}
                                    aria-label={compare ? "Убрать из сравнения" : "Добавить в сравнение"}
                                    onClick={() => setCompare((prev) => !prev)}
                                >
                                    <AlignCenterOutlined/>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {galleryOpen && currentUrl && (
                <div
                    className="product-detail__lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Просмотр фотографий товара"
                    onClick={() => setGalleryOpen(false)}
                >
                    <button
                        type="button"
                        className="product-detail__lightbox-close"
                        aria-label="Закрыть"
                        onClick={() => setGalleryOpen(false)}
                    >
                        <CloseOutlined/>
                    </button>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="product-detail__lightbox-arrow product-detail__lightbox-arrow--prev"
                            aria-label="Предыдущее фото"
                            onClick={(event) => {
                                event.stopPropagation();
                                setActiveIndex((index) => (index - 1 + images.length) % images.length);
                                setUseNativeImg(false);
                            }}
                        >
                            <LeftOutlined/>
                        </button>
                    )}

                    <div
                        className="product-detail__lightbox-image"
                        onTouchStart={handleGalleryTouchStart}
                        onTouchEnd={handleGalleryTouchEnd}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img src={currentUrl} alt={product.title}/>
                    </div>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="product-detail__lightbox-arrow product-detail__lightbox-arrow--next"
                            aria-label="Следующее фото"
                            onClick={(event) => {
                                event.stopPropagation();
                                setActiveIndex((index) => (index + 1) % images.length);
                                setUseNativeImg(false);
                            }}
                        >
                            <RightOutlined/>
                        </button>
                    )}

                    <span className="product-detail__lightbox-counter">
                        {activeIndex + 1} / {images.length}
                    </span>
                </div>
            )}

            {features.length > 0 && (
                <div className="product-detail__tabs">
                    <a href="#product-specs" className="product-detail__tab product-detail__tab--active">
                        Характеристики
                    </a>
                </div>
            )}

            {features.length > 0 && (
                <section id="product-specs" className="product-detail__section">
                    {features.map((feature) => (
                        <div key={feature.title} className="product-detail__feature">
                            <h3>{feature.title}</h3>
                            <table>
                                <tbody>
                                    {feature.rows.map((row) => (
                                        <tr key={`${feature.title}-${row.param}`}>
                                            <th>{row.param}</th>
                                            <td>{row.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </section>
            )}

        </article>
    );
}
