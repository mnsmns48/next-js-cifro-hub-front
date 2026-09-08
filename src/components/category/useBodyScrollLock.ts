"use client";

import {useEffect, useRef} from "react";

export function useBodyScrollLock(locked: boolean) {
    const lockedScrollYRef = useRef(0);

    useEffect(() => {
        if (!locked) return;

        const {body} = document;
        lockedScrollYRef.current = window.scrollY;
        body.style.position = "fixed";
        body.style.top = `-${lockedScrollYRef.current}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";

        return () => {
            const scrollY = lockedScrollYRef.current;
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.width = "";
            body.style.overflow = "";
            window.scrollTo(0, scrollY);
        };
    }, [locked]);
}
