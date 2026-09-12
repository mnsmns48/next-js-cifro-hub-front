import Link from "next/link";
import Image from "next/image";

import "./css/AppFooter.css";

const MAPS_URL =
    "https://yandex.ru/maps/?ll=35.773933,45.296603&z=17&pt=35.773933,45.296603,pm2rdm";

const PHONE = "+7 (978) 715-64-86";
const PHONE_HREF = "tel:+79787156486";
const ADDRESS = "п. Ленино, проспект Ленина 9";

export default function AppFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="app-footer__container">
                <div className="app-footer__inner">
                    <div className="app-footer__brand">
                        <Link href="/" className="app-footer__logo-link" aria-label="На главную">
                            <Image
                                src="/logo-cifro-hub.svg"
                                loading="eager"
                                alt="ЦифроХаб"
                                width={40}
                                height={40}
                                className="app-footer__logo"
                            />
                            <span className="app-footer__brand-name">ЦифроХаб</span>
                        </Link>
                        <p className="app-footer__tagline">Магазин техники и электроники</p>
                    </div>

                    <div className="app-footer__column">
                        <h2 className="app-footer__title">Покупателям</h2>
                        <nav className="app-footer__nav" aria-label="Ссылки в футере">
                            <Link href="/catalog">Каталог</Link>
                            <Link href="/cart">Корзина</Link>
                            <Link href="/login">Войти</Link>
                        </nav>
                    </div>

                    <div className="app-footer__column">
                        <h2 className="app-footer__title">Режим работы</h2>
                        <p className="app-footer__hours">
                            <span>Пн–Сб</span>
                            <span>8:00 – 17:00</span>
                        </p>
                        <p className="app-footer__hours">
                            <span>Вс</span>
                            <span>9:00 – 17:00</span>
                        </p>
                    </div>

                    <div className="app-footer__column">
                        <h2 className="app-footer__title">Контакты</h2>
                        <a href={PHONE_HREF} className="app-footer__phone">
                            {PHONE}
                        </a>
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-footer__address"
                        >
                            {ADDRESS}
                        </a>
                    </div>
                </div>

                <div className="app-footer__bottom">
                    <span>© {year} ЦифроХаб</span>
                </div>
            </div>
        </footer>
    );
}
