import type {ReactNode} from "react";
import AppHeader from "@/components/header/AppHeader";
import "./globals.css";


export default function RootLayout({children}: {
    children: ReactNode;
}) {
    return (
        <html lang="ru">
        <body className="page-container">
        <AppHeader/>
        {children}
        </body>
        </html>
    );
}
