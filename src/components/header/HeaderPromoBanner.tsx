import "../css/HeaderPromoBanner.css";

const MAPS_URL =
    "https://yandex.ru/maps/?ll=35.773933,45.296603&z=17&pt=35.773933,45.296603,pm2rdm";

interface HeaderPromoBannerProps {
    inline?: boolean;
}

export default function HeaderPromoBanner({inline = false}: HeaderPromoBannerProps) {
    if (!inline) {
        return null;
    }

    return (
        <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header-promo-banner header-promo-banner--inline"
            aria-label="Открыть адрес на Яндекс.Картах: +7 (978) 715-64-86, п. Ленино, проспект Ленина 9"
        >
            <span className="header-promo-banner__pin" aria-hidden>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C8.68629 2 6 4.68629 6 8C6 12.5 12 21 12 21C12 21 18 12.5 18 8C18 4.68629 15.3137 2 12 2Z"
                        fill="currentColor"
                    />
                    <circle cx="12" cy="8" r="2.5" fill="#616161"/>
                </svg>
            </span>

            <span className="header-promo-banner__content">
                <span className="header-promo-banner__phone">+7 (978) 715-64-86</span>
                <span className="header-promo-banner__address">п. Ленино, проспект Ленина 9</span>
            </span>
        </a>
    );
}
