"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Spin} from "antd";

import CatalogBreadcrumbs from "@/components/catalog/CatalogBreadcrumbs";

import ProductBriefSpecs from "./ProductBriefSpecs";
import ProductBriefSpecsSheet from "./ProductBriefSpecsSheet";
import ProductBuyBar from "./ProductBuyBar";
import ProductFullSpecs from "./ProductFullSpecs";
import ProductGallery from "./ProductGallery";
import ProductLightbox from "./ProductLightbox";
import ProductProsCons from "./ProductProsCons";
import {
    buildBriefSheetSpecs,
    buildBriefSpecs,
    buildProductImages,
    getCons,
    getPros,
    specFeatures,
    stepGalleryIndex,
} from "./productDetail";
import {useProductDetail} from "./useProductDetail";

import "../css/ProductDetail.css";

export default function ProductDetail({origin}: {origin: string}) {
    const {product, loading, error} = useProductDetail(origin);
    const [activeIndex, setActiveIndex] = useState(0);
    const [useNativeImg, setUseNativeImg] = useState(false);
    const [inCart, setInCart] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [compare, setCompare] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [prosSheetOpen, setProsSheetOpen] = useState(false);
    const [briefSpecsSheetOpen, setBriefSpecsSheetOpen] = useState(false);

    useEffect(() => {
        setActiveIndex(0);
        setUseNativeImg(false);
        setGalleryOpen(false);
        setProsSheetOpen(false);
        setBriefSpecsSheetOpen(false);
    }, [origin]);

    const images = useMemo(() => buildProductImages(product), [product]);
    const currentUrl = images[Math.min(activeIndex, Math.max(0, images.length - 1))] ?? null;
    const features = specFeatures(product);
    const pros = product ? getPros(product) : [];
    const cons = product ? getCons(product) : [];
    const hasPros = pros.length > 0 || cons.length > 0;
    const briefSpecs = product ? buildBriefSpecs(product, hasPros ? 7 : 12) : [];
    const briefSheetSpecs = useMemo(
        () => buildBriefSheetSpecs(product?.short_specs),
        [product?.short_specs],
    );

    const stepGallery = useCallback((delta: number) => {
        setActiveIndex((index) => stepGalleryIndex(index, images.length, delta));
        setUseNativeImg(false);
    }, [images.length]);

    const selectImage = useCallback((index: number) => {
        setActiveIndex(index);
        setUseNativeImg(false);
    }, []);

    const closeProsSheet = useCallback(() => setProsSheetOpen(false), []);
    const closeBriefSheet = useCallback(() => setBriefSpecsSheetOpen(false), []);
    const closeGallery = useCallback(() => setGalleryOpen(false), []);

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
                <CatalogBreadcrumbs
                    items={product.route.map((item) => ({
                        key: `${item.path_id}-${item.label}`,
                        label: item.label,
                        slug: item.slug,
                        parent_id: item.parent_id,
                    }))}
                />
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
                <ProductGallery
                    title={product.title}
                    images={images}
                    currentUrl={currentUrl}
                    activeIndex={activeIndex}
                    useNativeImg={useNativeImg}
                    onStep={stepGallery}
                    onSelect={selectImage}
                    onImageError={() => setUseNativeImg(true)}
                    onOpenLightbox={() => setGalleryOpen(true)}
                />

                <div className="product-detail__specs-col">
                    <ProductBuyBar
                        price={product.output_price}
                        inCart={inCart}
                        favorite={favorite}
                        compare={compare}
                        showBriefSpecs={briefSheetSpecs.length > 0}
                        onCart={() => setInCart((prev) => !prev)}
                        onFavorite={() => setFavorite((prev) => !prev)}
                        onCompare={() => setCompare((prev) => !prev)}
                        onOpenBriefSpecs={() => setBriefSpecsSheetOpen(true)}
                    />

                    <ProductBriefSpecs rows={briefSpecs} showAllSpecs={features.length > 0}/>

                    {hasPros && (
                        <ProductProsCons
                            pros={pros}
                            cons={cons}
                            sheetOpen={prosSheetOpen}
                            onOpen={() => setProsSheetOpen(true)}
                            onClose={closeProsSheet}
                        />
                    )}
                </div>
            </div>

            {briefSpecsSheetOpen && (
                <ProductBriefSpecsSheet specs={briefSheetSpecs} onClose={closeBriefSheet}/>
            )}

            {galleryOpen && currentUrl && (
                <ProductLightbox
                    title={product.title}
                    currentUrl={currentUrl}
                    activeIndex={activeIndex}
                    imageCount={images.length}
                    onClose={closeGallery}
                    onStep={stepGallery}
                />
            )}

            <ProductFullSpecs features={features}/>
        </article>
    );
}
