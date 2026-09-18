"use client";

import {useState, type ReactNode} from "react";
import Link from "next/link";
import Image from "next/image";

import StubModal from "@/components/header/StubModal";
import "./css/AppFooter.css";

const MAPS_URL =
    "https://yandex.ru/maps/?ll=35.773933,45.296603&z=17&pt=35.773933,45.296603,pm2rdm";

const PHONE = "+7 (978) 715-64-86";
const PHONE_HREF = "tel:+79787156486";
const ADDRESS = "п. Ленино, проспект Ленина 9";
const TELEGRAM_URL = "https://t.me/cifrotech_mobile";
const MAX_URL = "https://max.ru/u/f9LHodD0cOKICsO4neILoVK5xHaebTm1fO1QVTEKRGgP6hwrKIsL521tDkE";

export default function AppFooter() {
    const year = new Date().getFullYear();
    const [stubOpen, setStubOpen] = useState(false);

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
                        <p className="app-footer__notice">Сайт запущен в тестовом режиме.</p>
                    </div>

                    <div className="app-footer__column app-footer__column--nav">
                        <h2 className="app-footer__title">Покупателям</h2>
                        <nav className="app-footer__nav" aria-label="Ссылки в футере">
                            <Link href="/catalog">Каталог</Link>
                            <button type="button" onClick={() => setStubOpen(true)}>
                                Корзина
                            </button>
                            <button type="button" onClick={() => setStubOpen(true)}>
                                Войти
                            </button>
                        </nav>
                    </div>

                    <div className="app-footer__column app-footer__column--hours">
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

                    <div className="app-footer__contact-block">
                        <div className="app-footer__column app-footer__column--contacts">
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
                        <div className="app-footer__socials">
                            <FooterSocial href={TELEGRAM_URL} label="Telegram">
                                <TelegramIcon/>
                            </FooterSocial>
                            <FooterSocial href={MAX_URL} label="MAX">
                                <MaxIcon/>
                            </FooterSocial>
                        </div>
                    </div>
                </div>

                <div className="app-footer__bottom">
                    <p className="app-footer__disclaimer">
                        Опубликованные цены на сайте не являются публичной офертой.
                    </p>
                    <span>© {year} ЦифроХаб</span>
                </div>
            </div>
            <StubModal
                open={stubOpen}
                title="Раздел в разработке"
                onClose={() => setStubOpen(false)}
            />
        </footer>
    );
}

function FooterSocial({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: ReactNode;
}) {
    if (!href) {
        return (
            <span className="app-footer__social" title={label} aria-label={label}>
                {children}
            </span>
        );
    }

    return (
        <a
            href={href}
            className="app-footer__social"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
        >
            {children}
        </a>
    );
}

function TelegramIcon() {
    return <span className="app-footer__social-icon app-footer__social-icon--telegram" aria-hidden="true"/>;
}

function MaxIcon() {
    return <span className="app-footer__social-icon app-footer__social-icon--max" aria-hidden="true"/>;
}
