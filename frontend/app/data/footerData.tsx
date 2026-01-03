// File: app/data/footerData.ts
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube';
  href: string;
}

export const footerData = {
  // 1. BAGIAN BRAND
  brand: {
    name: "GetCha",
    accent: ".", // Tanda titik warna emas
    description: "Premium coffee shop delivering the best brewing experience and authentic pastries directly to your table or doorstep.",
    socialMedia: [
      { platform: 'instagram', href: 'https://instagram.com/getcha' },
      { platform: 'facebook', href: 'https://facebook.com/getcha' },
      { platform: 'twitter', href: 'https://twitter.com/getcha' },
    ] as SocialLink[]
  },

  // 2. BAGIAN NAVIGASI (Dynamic Column)
  column1: {
    title: "Discover",
    links: [
      { label: "Full Menu", href: "/menu" },
      { label: "Exclusive Deals", href: "/deals" },
      { label: "Best Sellers", href: "/dashboard#best-seller" },
      { label: "Track Order", href: "/activity" },
    ] as FooterLink[]
  },

  // 3. BAGIAN KONTAK
  contact: {
    title: "Visit Us",
    address: "Jl. A.Yani No. 45, Sumatera Utara, Indonesia 12190",
    phone: "+62 812-3456-7890",
    email: "hello@getcha.com"
  },

  // 4. JAM BUKA
  openingHours: {
    title: "Opening Hours",
    schedules: [
      { day: "Mon - Fri", time: "07:00 - 22:00" },
      { day: "Sat - Sun", time: "08:00 - 23:00" },
    ]
  },

  // 5. COPYRIGHT & LEGAL
  bottom: {
    copyrightText: "© 2025 GetCha Coffee & Roastery. All rights reserved.",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies Settings", href: "/cookies" },
    ]
  }
};