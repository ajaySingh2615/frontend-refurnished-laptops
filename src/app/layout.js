import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "Refurbished Laptops | Gurugram's Largest Refurbished Laptop Store",
  description:
    "Quality refurbished laptops and accessories at unbeatable prices. Shop Dell, HP, Lenovo, Apple and more.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
