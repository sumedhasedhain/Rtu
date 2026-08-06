import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rtu — Cycle Tracker",
    template: "%s — Rtu",
  },
  description:
    "A quietly intelligent way to track your cycle — predictions, patterns, and phases, beautifully rendered.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="void-field min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
