import type {ReactNode} from "react";

import "./globals.css";
import AppHeader from "@/components/header/AppHeader";
import ConditionalFooter from "@/components/ConditionalFooter";
import MobileTabBar from "@/components/header/MobileTabBar";
import PageContainer from "@/components/PageContainer";
import ScrollToTop from "@/components/ScrollToTop";


export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <body>
        <div className="layout-wrapper">
            <AppHeader/>
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
