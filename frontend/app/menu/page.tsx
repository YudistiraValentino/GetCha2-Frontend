"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, Loader2, Sparkles, UtensilsCrossed, Coffee } from "lucide-react"; 
import NavbarDashboard from "../components/layout/NavbarDashboard";
import { useTransition } from "../context/TransitionContext"; 

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductAPI {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string;
  image: string;
  is_promo: number;
}

export default function MenuPage() {
  const { triggerTransition } = useTransition(); 
  
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const json = await res.json();
        if (json.success) {
            const mapped = json.data.map((p: any) => ({
                ...p,
                category_name: p.category ? p.category.name : (p.category_name || "Uncategorized")
            }));
            setProducts(mapped);
        }
      } catch (error) { console.error("Gagal mengambil menu:", error); } finally { setLoading(false); }
    };
    fetchMenu();
  }, []);

  // ✅ FIX: 4 Kategori x 10 Varian (Unsplash)
  const getImageUrl = (p: ProductAPI) => {
    const id = p.id || 0;
    const name = (p.name || "").toLowerCase();
    const cat = (p.category_name || "").toLowerCase();

    const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
    const nonCoffeeImages = ["https://images.unsplash.com/photo-1556679343-c7306c1976bc","https://images.unsplash.com/photo-1597318181409-cf44d0582db8","https://images.unsplash.com/photo-1576092729250-19c137184b8c","https://images.unsplash.com/photo-1544787210-2213d84ad960","https://images.unsplash.com/photo-1536935338212-3b6abf17ac42","https://images.unsplash.com/photo-1623065422902-30a2ad299dd4","https://images.unsplash.com/photo-1585225442642-c41236125451","https://images.unsplash.com/photo-1556881286-fc6915169721","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd","https://images.unsplash.com/photo-1556710807-a9261973328e"];
    const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
    const snackImages = ["https://images.unsplash.com/photo-1551024601-bec78aea704b","https://images.unsplash.com/photo-1495147466023-ac5c588e2e94","https://images.unsplash.com/photo-1558961363-fa8fdf82db35","https://images.unsplash.com/photo-1509365465985-25d11c17e812","https://images.unsplash.com/photo-1530610476181-d83430b64dcd","https://images.unsplash.com/photo-1573821663912-569905445661","https://images.unsplash.com/photo-1582298538104-fe2e74c27f59","https://images.unsplash.com/photo-1559339352-11d035aa65de","https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2","https://images.unsplash.com/photo-1519915028121-7d3463d20b13"];

    let collection = foodImages;
    if (cat.includes("non coffee") || name.includes("tea") || name.includes("matcha")) collection = nonCoffeeImages;
    else if (cat.includes("coffee") || name.includes("kopi") || name.includes("latte")) collection = coffeeImages;
    else if (cat.includes("snack") || cat.includes("dessert") || name.includes("cake") || name.includes("pastry")) collection = snackImages;

    return `${collection[id % 10]}?w=500&h=500&fit=crop`;
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category_name === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category_name)))];

  const handleItemClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    triggerTransition(`/product/${id}`); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-navy-900 pb-32">
      <NavbarDashboard />
      <div className="relative pt-36 pb-24 px-6 md:px-12 bg-[#0B1120] text-white overflow-hidden rounded-b-[2.5rem] shadow-2xl">
         <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">Find Your Perfect <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">Craving Today</span></h1>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">Pesan menu favoritmu tanpa antre.</p>
         </div>
      </div>

      <div className={`sticky top-20 z-40 transition-all duration-300 ${isScrolled ? 'py-4 bg-white/90 backdrop-blur-xl shadow-lg border-b' : 'py-8 -mt-10'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Cari kopi, kue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-gold-500/50" />
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2">
                {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat ? "bg-navy-900 text-white" : "bg-white text-gray-500 hover:text-navy-900"}`}>{cat}</button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 min-h-[500px]">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin text-gold-500 mb-4" size={48} /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={(e) => handleItemClick(e, product.id)} className="group bg-white rounded-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col">
                <div className="relative mx-4 mt-4 h-56 rounded-2xl bg-[#F4F5F7] overflow-hidden flex items-center justify-center">
                   <Image src={getImageUrl(product)} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                   {product.is_promo === 1 && <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg z-10">PROMO</div>}
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-navy-900 mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4">{product.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
                        <span className="text-lg font-extrabold text-navy-900">Rp {parseFloat(product.price || "0").toLocaleString()}</span>
                        <div className="w-10 h-10 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all"><Plus size={20} /></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-center py-20"><UtensilsCrossed size={48} className="mx-auto text-gray-200 mb-4"/><p>Menu tidak ditemukan.</p></div>}
      </div>
    </div>
  );
}
