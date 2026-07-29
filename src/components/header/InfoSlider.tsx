"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function InfoSlider() {
    const { isMobile, isTablet } = useMediaQuery();

    // скрываем полностью на мобильных


    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, 3000);
        return () => clearInterval(id);
    }, []);

    if (isMobile) return null;

    const slides = [
        "https://api.ozero.market/pictures/298144/conversions/5d7ab796a4f2aa5a3b84de125e44bcc2a2292767-large.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYApmGLNW-HjG3ZQt4yjuI18VqWrbWOOA7lhMr9uQSiQ&s",
        "https://www.shutterstock.com/image-illustration/neon-business-4-number-icon-600nw-2671863459.jpg",
    ];

    const height = isTablet ? 32 : 40;
    const borderRadius = isTablet ? 14 : 18;

    return (
        <div
            style={{
                height,
                width: "100%",
                overflow: "hidden",
                borderRadius,
                display: "flex",
                alignItems: "center",
                flex: 1,
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <img
                    src={slides[index]}
                    alt="slide"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                    }}
                />
            </div>
        </div>
    );
}
