"use client";

import "../css/InfoSlider.css";

const SLIDER_ITEMS = [
    "Скидки до 50%",
    "Новые поступления",
    "Быстрая доставка",
];

export default function InfoSlider() {
    return (
        <div className="info-slider">
            <div className="info-slider-track">
                <div className="info-slider-group">
                    {SLIDER_ITEMS.map((text) => (
                        <span key={text} className="info-slider-item">{text}</span>
                    ))}
                </div>
                <div className="info-slider-group" aria-hidden>
                    {SLIDER_ITEMS.map((text) => (
                        <span key={`${text}-dup`} className="info-slider-item">{text}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
