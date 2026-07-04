import 'antd/dist/reset.css';
import 'antd-mobile/es/global';
import './globals.css';

import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ЦифроХаб — магазин электроники",
  description: "Фронтенд проекта ЦифроХаб на Next.js 16 + TypeScript + Ant Design.",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="ru">
      <body
          style={{
            margin: 0,
            padding: 0,
            minHeight: "100vh",
            backgroundColor: "#fafafa",
          }}
      >
      {children}
      </body>
      </html>
  );
}
