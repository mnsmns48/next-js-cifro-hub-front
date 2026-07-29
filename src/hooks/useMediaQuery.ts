"use client";

import { useEffect, useState } from "react";

export function useMediaQuery() {
    const [width, setWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    );

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = width <= 767;
    const isTablet = width >= 768 && width <= 1199;
    const isDesktop = width >= 1200;

    return { width, isMobile, isTablet, isDesktop };
}
