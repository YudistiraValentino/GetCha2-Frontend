export interface Promo {
  id: number;
  code: string;       // Kode unik (misal: "HEMAT10")
  title: string;      // Judul (misal: "Diskon Ceria")
  description: string;// Syarat (misal: "Min. belanja 50rb")
  type: 'percent' | 'fixed'; // Tipe potongan
  value: number;      // Nilai potongan (0.5 untuk 50%, atau 10000 untuk 10rb)
  minOrder: number;   // Minimal belanja
  image: string;      // Background tiket
  color: string;      // Tema warna
}

export const promos: Promo[] = [
  {
    id: 1,
    code: "WELCOME50",
    title: "New Member Deal",
    description: "Diskon 50% untuk pesanan pertamamu! (Maks. 20rb)",
    type: 'percent',
    value: 0.5,
    minOrder: 0,
    image: "/Image/TES1.png", 
    color: "from-blue-600 to-blue-400"
  },
  {
    id: 2,
    code: "HEMAT15K",
    title: "Tanggal Tua Saver",
    description: "Potongan langsung Rp 15.000 untuk kopi apa saja.",
    type: 'fixed',
    value: 15000,
    minOrder: 40000,
    image: "/Image/TES2.png", 
    color: "from-green-600 to-green-400"
  },
  {
    id: 3,
    code: "COFFEELOVER",
    title: "Morning Boost",
    description: "Diskon 20% khusus menu Coffee.",
    type: 'percent',
    value: 0.2,
    minOrder: 30000,
    image: "/Image/TES1.png", 
    color: "from-orange-600 to-orange-400"
  }
];