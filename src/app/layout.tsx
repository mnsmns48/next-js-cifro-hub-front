import type {ReactNode} from "react";

import "./globals.css";
import AppHeader from "@/components/header/AppHeader";
import MobileTabBar from "@/components/header/MobileTabBar";
import PageContainer from "@/components/PageContainer";


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
            <MobileTabBar/>
        </div>
        </body>
        </html>
    );
}
