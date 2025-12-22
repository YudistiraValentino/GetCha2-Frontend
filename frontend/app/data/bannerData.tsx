// File: app/data/bannerData.ts

export interface PromoBannerConfig {
  id: number;
  isActive: boolean;        // Admin bisa ON/OFF banner ini
  title: string;
  subtitle: string;
  badge: string;            // Label kecil (misal: LIMITED OFFER)
  ctaText: string;          // Teks tombol (Call to Action)
  ctaLink: string;          // Link tujuan
  
  // Konfigurasi Visual (Admin bisa pilih tema warna)
  gradientFrom: string;     // Warna awal gradient (Tailwind class)
  gradientTo: string;       // Warna akhir gradient
  textColor: string;        // Warna teks
  accentColor: string;      // Warna tombol/badge
}

// Simulasi Data dari Database Admin
export const promoBanner: PromoBannerConfig = {
  id: 101,
  isActive: true, // Ubah ke false jika ingin menyembunyikan banner
  title: "Buy 2 Get 1 Free",
  subtitle: "Promo spesial weekend untuk semua varian Latte. Berlaku hingga 25 Des.",
  badge: "LIMITED OFFER",
  ctaText: "Claim Offer",
  ctaLink: "/deals",
  
  // Admin memilih tema "Midnight Navy"
  gradientFrom: "from-navy-900",
  gradientTo: "to-navy-800",
  textColor: "text-white",
  accentColor: "text-gold-500" 
};