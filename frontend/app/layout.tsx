import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { TransitionProvider } from "@/app/context/TransitionContext"; 
import TransitionLoader from "@/app/components/layout/TransitionLoader"; 
import CartSidebar from "@/app/components/CartSidebar";
import { GoogleAnalytics } from "@next/third-parties/google"; // 👈 1. Import GA

export const metadata: Metadata = {
  title: "GetCha - Coffee & Dessert",
  description: "Skip the line, enjoy the time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-navy-900">
        <CartProvider>
          <TransitionProvider>
            
            {/* Halaman Utama dengan Efek Loading */}
            <TransitionLoader>
              {children}
            </TransitionLoader>

            {/* Sidebar Cart Overlay */}
            <CartSidebar />

          </TransitionProvider>
        </CartProvider>

        {/* 2. Komponen Google Analytics 
          Otomatis load script GA4 tanpa bikin website lemot.
          ID diambil dari environment variable (.env.local)
        */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}