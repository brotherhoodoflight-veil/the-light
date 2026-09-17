import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./portal.css";

const cormorant = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/CormorantGaramond-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CormorantGaramond-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/CormorantGaramond-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brotherhood of Light",
  description:
    "The Sacred Order of the Veiled Light. A private spiritual institution beyond the sight of the uninitiated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
