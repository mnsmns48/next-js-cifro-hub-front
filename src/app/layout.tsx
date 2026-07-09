import type {ReactNode} from "react";
import AppHeader from "@/components/header/AppHeader";

export default function RootLayout({children}: {
    children: ReactNode;
}) {
    return (
        <html lang="ru">
        <body style={{margin: 0, padding: 0, backgroundColor: "#fafafa"}}>
        <AppHeader/>
        {children}
        </body>
        </html>
    );
}
