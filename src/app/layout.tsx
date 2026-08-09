import type {ReactNode} from "react";

import "./globals.css";
import AppHeader from "@/components/header/AppHeader";
import PageContainer from "@/components/PageContainer";


export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <body>
        <div className="layout-wrapper">
            <AppHeader/>
            <div style={{marginTop: 12}}>
                <PageContainer>
                    {children}
                </PageContainer>
            </div>
        </div>
        </body>
        </html>
    );
}
