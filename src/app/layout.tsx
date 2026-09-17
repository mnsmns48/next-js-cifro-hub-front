import type {ReactNode} from "react";
import type {Viewport} from "next";

import "./globals.css";
import AppHeader from "@/components/header/AppHeader";
import ConditionalFooter from "@/components/ConditionalFooter";
import MobileTabBar from "@/components/header/MobileTabBar";
import PageContainer from "@/components/PageContainer";
import ScrollToTop from "@/components/ScrollToTop";
import {getCatalogLevels} from "../../lib/server/api/catalog";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    interactiveWidget: "overlays-content",
};

export default async function RootLayout({children}: { children: ReactNode }) {
    const levels = await getCatalogLevels();

    return (
        <html lang="ru">
        <body>
        <div className="layout-wrapper">
            <AppHeader levels={levels}/>

            <main className="layout-main">
                <PageContainer>
                    {children}
                </PageContainer>
            </main>
        </div>

        <ConditionalFooter/>
        <ScrollToTop/>
        <MobileTabBar/>
        </body>
        </html>
    );
}