import type {ReactNode} from "react";

import "./globals.css";
import AppHeader from "@/components/header/AppHeader";
import PageContainer from "@/components/PageContainer";


export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <body>
        <div className="layout-wrapper">
            <div style={{display: "flex", gap: 8}}>
                <div style={{marginTop: 10}}>
                </div>
                <div style={{marginTop: 10}}>
                    <AppHeader/>
                    <div style={{marginTop: 12}}>
                        <PageContainer>
                            {children}
                        </PageContainer>
                    </div>
                </div>
            </div>
        </div>
        </body>
        </html>
    );
}
