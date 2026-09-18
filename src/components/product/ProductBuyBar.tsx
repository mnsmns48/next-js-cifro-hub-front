"use client";

import {Tooltip} from "antd";
import {
    AlignCenterOutlined,
    InfoCircleOutlined,
    ShoppingCartOutlined,
    StarFilled,
    StarOutlined,
} from "@ant-design/icons";

import {formatPrice} from "./productDetail";

export default function ProductBuyBar({
    price,
    favorite,
    compare,
    showBriefSpecs,
    onFavorite,
    onCompare,
    onOpenBriefSpecs,
}: {
    price: string | number;
    favorite: boolean;
    compare: boolean;
    showBriefSpecs: boolean;
    onFavorite: () => void;
    onCompare: () => void;
    onOpenBriefSpecs: () => void;
}) {
    return (
        <aside className="product-detail__buy">
            <p className="product-detail__price">{formatPrice(price)} ₽</p>
            <div className="product-detail__buy-row">
                <Tooltip title="В разработке">
                    <span className="product-detail__cart-wrap">
                        <button type="button" className="product-detail__cart" disabled>
                            <ShoppingCartOutlined/>
                            В корзину
                        </button>
                    </span>
                </Tooltip>
                <div className="product-detail__buy-actions">
                    <button
                        type="button"
                        className={`product-detail__icon-btn${favorite ? " product-detail__icon-btn--active" : ""}`}
                        aria-label={favorite ? "Убрать из избранного" : "В избранное"}
                        onClick={onFavorite}
                    >
                        {favorite ? <StarFilled/> : <StarOutlined/>}
                    </button>
                    <button
                        type="button"
                        className={`product-detail__icon-btn${compare ? " product-detail__icon-btn--active" : ""}`}
                        aria-label={compare ? "Убрать из сравнения" : "Добавить в сравнение"}
                        onClick={onCompare}
                    >
                        <AlignCenterOutlined/>
                    </button>
                    {showBriefSpecs && (
                        <button
                            type="button"
                            className="product-detail__icon-btn product-detail__icon-btn--specs-mobile"
                            aria-label="Показать краткие характеристики"
                            onClick={onOpenBriefSpecs}
                        >
                            <InfoCircleOutlined/>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
