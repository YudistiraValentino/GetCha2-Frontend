// File: app/data/menuData.ts

export interface ModifierOption {
  label: string;
  priceChange?: number; 
  isDefault?: boolean;
}

export interface ProductModifier {
  name: string;
  required?: boolean;
  options: ModifierOption[];
}

export interface ProductVariant {
  name: string; 
  price: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string; // Thumbnail Utama
  
  // --- FIELD DINAMIS UNTUK DETAIL PAGE ---
  images?: string[]; // Galeri Foto (Carousel)
  nutritionalInfo?: { calories: number; sugar: string; fat: string }; // Info Gizi
  
  // --- KONFIGURASI HARGA & VARIAN ---
  price: number; // PERBAIKAN: Tanda tanya '?' dihapus agar wajib ada angka
  variants?: ProductVariant[]; 
  modifiers?: ProductModifier[]; 

  // --- LOGIKA DASHBOARD ---
  createdAt: string;
  soldCount: number;
  isPromo?: boolean;
}

export const products: Product[] = [
  // --- 1. KOPI (Best Seller) ---
  {
    id: 1,
    name: "GetCha Signature Latte",
    category: "Coffee",
    description: "Espresso premium blend Arabica dengan tekstur susu yang creamy dan gula aren asli. Rasanya seimbang antara pahit, creamy, dan manis legit.",
    image: "/Image/TES1.png",
    
    // Fitur Admin: Galeri & Nutrisi
    images: ["/Image/TES1.png", "/Image/TES2.png", "/Image/TES1.png"], 
    nutritionalInfo: { calories: 240, sugar: "18g", fat: "8g" },

    createdAt: "2025-08-15",
    soldCount: 2500,
    isPromo: true,

    // PERBAIKAN: Menambahkan harga dasar agar tidak error saat build
    price: 35000, 

    variants: [
      { name: "Regular (12oz)", price: 35000 },
      { name: "Large (16oz)", price: 42000 }, 
    ],
    modifiers: [
      {
        name: "Temperature",
        required: true,
        options: [
          { label: "Iced", isDefault: true },
          { label: "Hot" }
        ]
      },
      {
        name: "Dairy Preference",
        required: true,
        options: [
          { label: "Fresh Milk", isDefault: true },
          { label: "Low Fat", priceChange: 0 },
          { label: "Oat Milk", priceChange: 8000 },
          { label: "Almond Milk", priceChange: 8000 },
        ]
      },
      {
        name: "Sweetness Level",
        required: true,
        options: [
          { label: "Normal (100%)", isDefault: true },
          { label: "Less (70%)" },
          { label: "Half (50%)" },
          { label: "No Sugar (0%)" }
        ]
      },
      {
        name: "Add-ons",
        required: false,
        options: [
          { label: "No Extra Shot", isDefault: true },
          { label: "+1 Espresso Shot", priceChange: 6000 },
        ]
      }
    ]
  },

  // --- 2. PASTRY ---
  {
    id: 2,
    name: "Royal Cheese Croissant",
    category: "Pastry",
    description: "Croissant butter authentic Prancis dengan topping keju cheddar melimpah.",
    image: "/Image/TES2.png",
    
    // Admin bisa kosongkan images jika cuma punya 1 foto
    // Admin bisa isi nutrisi jika perlu
    nutritionalInfo: { calories: 310, sugar: "4g", fat: "16g" },
    
    createdAt: "2025-12-10", 
    soldCount: 850,          
    
    price: 28000,
    modifiers: [
      {
        name: "Serving Option",
        required: true,
        options: [
          { label: "Warmed Up (Hangat)", isDefault: true },
          { label: "Room Temp (Biasa)" },
        ]
      },
      {
        name: "Cutlery",
        required: true,
        options: [
          { label: "No Cutlery (Hand)", isDefault: true },
          { label: "Need Fork & Knife" }
        ]
      }
    ]
  },

  // ... (Produk lain)
  {
    id: 3,
    name: "Gold Brew Cold",
    category: "Coffee",
    description: "Cold brew steep 12 jam.",
    image: "/Image/TES1.png",
    createdAt: "2025-09-01",
    soldCount: 1800,
    price: 32000,
    variants: [{ name: "Bottle", price: 32000 }]
  },
  {
    id: 4,
    name: "Matcha Tiramisu",
    category: "Dessert",
    description: "Matcha cake lembut.",
    image: "/Image/TES2.png",
    createdAt: "2025-12-14",
    soldCount: 120,
    price: 45000
  },
   {
    id: 5,
    name: "Aren Brown Sugar Milk",
    category: "Non-Coffee",
    description: "Susu gula aren.",
    image: "/Image/TES1.png",
    createdAt: "2025-01-01",
    soldCount: 1500,
    // PERBAIKAN: Menambahkan harga dasar
    price: 25000,
    variants: [{ name: "Regular", price: 25000 }]
  }
];