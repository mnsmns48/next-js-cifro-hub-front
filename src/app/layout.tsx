import type {ReactNode} from "react";
import AppHeader from "@/components/header/AppHeader";
import "./globals.css";


export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ru">
        <body>
        <div className="page-container">
            <AppHeader />
        </div>

        <div className="page-container" style={{ marginTop: 20 }}>
            {children}
        </div>
        </body>
        </html>
    );
}
