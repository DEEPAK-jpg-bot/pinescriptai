import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { Sidebar } from "@/components/Sidebar"; // Don't import globally

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PineGen - AI PineScript Generator",
    description: "Generate PineScript strategies with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
