// File: app/data/heroData.ts

export interface HeroSlide {
  id: number;
  isActive: boolean; 
  image: string;
  title: string;
  subtitle: string;
  link: string;
  buttonText: string;
  // [BARU] Properti untuk kustomisasi filter gambar per slide
  imageStyle?: string; 
}

export const heroSlidesData: HeroSlide[] = [
  // SLIDE 1 (AKTIF)
  {
    id: 1,
    isActive: true, 
    image: "/Image/TES1.png",
    title: "Start Your Day with Premium Arabica",
    subtitle: "Nikmati sensasi kopi pilihan terbaik dari petani lokal Indonesia.",
    link: "/menu",
    buttonText: "Order Now",
    // Filter Khusus Slide 1 (Sesuai request Anda)
    imageStyle: "brightness-50 contrast-110 saturate-90" 
  },
  // SLIDE 2 (AKTIF)
  {
    id: 2,
    isActive: true,
    image: "/Image/TES2.png",
    title: "Sweet Treats for Sweet Moments",
    subtitle: "Diskon 20% untuk semua varian pastry khusus pembelian di atas jam 5 sore.",
    link: "/deals",
    buttonText: "See Deals",
    // Filter Khusus Slide 2 (Misal: Agak lebih terang dikit)
    imageStyle: "brightness-75 contrast-100" 
  },
  // SLIDE 3 (BARU & AKTIF)
  {
    id: 3,
    isActive: true,
    image: "/Image/TES1.png", 
    title: "New: Matcha Series",
    subtitle: "Perpaduan matcha Jepang asli dengan susu segar yang creamy.",
    link: "/product/4",
    buttonText: "Try Now",
    // Filter Khusus Slide 3 (Misal: Lebih dramatis)
    imageStyle: "brightness-50 contrast-125 saturate-150"
  },
  // SLIDE 4 (NON-AKTIF / DRAFT)
  {
    id: 4,
    isActive: false, 
    image: "/Image/TES2.png",
    title: "Ramadan Special Bundle",
    subtitle: "Coming soon for special month.",
    link: "/menu",
    buttonText: "Coming Soon",
    imageStyle: "brightness-50"
  }
];