"use client";

import "../css/InfoSlider.css";

export default function InfoSlider() {
    return (
        <div className="info-slider">
            <div className="info-slider-track">
                <span className="info-slider-item">Скидки до 50%</span>
                <span className="info-slider-item">Новые поступления</span>
                <span className="info-slider-item">Быстрая доставка</span>
            </div>
        </div>
    );
}
