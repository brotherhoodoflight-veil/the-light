import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Brotherhood of Light — VEIL",
  description: "Private Global Fraternity Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
