"use client";

import HeaderTop from "./HeaderTop";
import HeaderBottom from "./HeaderBottom";

export default function AppHeader() {
    return (
        <header style={{ width: "100%" }}>
            <HeaderTop />
            <HeaderBottom />
        </header>
    );
}
