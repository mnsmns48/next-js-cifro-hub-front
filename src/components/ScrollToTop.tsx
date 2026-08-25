"use client";

import {useEffect, useState} from "react";
import {ArrowUpOutlined} from "@ant-design/icons";

import "./css/ScrollToTop.css";

const SHOW_AFTER_PX = 700;

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > SHOW_AFTER_PX);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    return (
        <button
            type="button"
            className={`scroll-to-top${visible ? " scroll-to-top--visible" : ""}`}
            aria-label="Наверх"
            title="Наверх"
            onClick={scrollToTop}
        >
            <ArrowUpOutlined/>
        </button>
    );
}
