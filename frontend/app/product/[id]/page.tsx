"use client";

import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Footer from "@/app/components/layout/Footer"; 
import { useCart } from "@/app/context/CartContext";
import { 
  Minus, Plus, ShoppingBag, Heart, ChevronRight, Info, Loader2, CheckCircle2, Star, Clock 
} from "lucide-react";
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";

// ✅ URL Backend Railway
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductDetail {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string; 
  image: string;
  images?: string[];
  nutritional_info?: string; 
  variants?: { name: string; price: number }[];
  modifiers?: { 
    name: string; 
    required?: boolean; 
    options: { label: string; priceChange?: number; isDefault?: boolean }[] 
  }[];
}

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const id = params?.id; 
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [qty, setQty] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // State untuk Variasi & Modifier
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<{[key: string]: any}>({});

  // State Visual Button (Loading/Success)
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ FIX: SINKRONISASI GAMBAR (Sama persis dengan Menu, Dashboard & Admin)
  const getImageUrl = (p: ProductDetail) => {
    const productId = p.id || 0;
    const name = (p.name || "").toLowerCase();
    const cat = (p.category_name || "").toLowerCase();

    const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
    const nonCoffeeImages = ["https://images.unsplash.com/photo-1556679343-c7306c1976bc","https://images.unsplash.com/photo-1597318181409-cf44d0582db8","https://images.unsplash.com/photo-1576092729250-19c137184b8c","https://images.unsplash.com/photo-1544787210-2213d84ad960","https://images.unsplash.com/photo-1536935338212-3b6abf17ac42","https://images.unsplash.com/photo-1623065422902-30a2ad299dd4","https://images.unsplash.com/photo-1585225442642-c41236125451","https://images.unsplash.com/photo-1556881286-fc6915169721","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd","https://images.unsplash.com/photo-1556710807-a9261973328e"];
    const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
    const snackImages = ["https://images.unsplash.com/photo-1551024601-bec78aea704b","https://images.unsplash.com/photo-1495147466023-ac5c588e2e94","https://images.unsplash.com/photo-1558961363-fa8fdf82db35","https://images.unsplash.com/photo-1509365465985-25d11c17e812","https://images.unsplash.com/photo-1530610476181-d83430b64dcd","https://images.unsplash.com/photo-1573821663912-569905445661","https://images.unsplash.com/photo-1582298538104-fe2e74c27f59","https://images.unsplash.com/photo-1559339352-11d035aa65de","https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2","https://images.unsplash.com/photo-1519915028121-7d3463d20b13"];

    let coll = foodImages;
    if (cat.includes("non coffee") || name.includes("tea") || name.includes("matcha")) coll = nonCoffeeImages;
    else if (cat.includes("coffee") || name.includes("kopi") || name.includes("latte")) coll = coffeeImages;
    else if (cat.includes("snack") || cat.includes("dessert") || name.includes("cake") || name.includes("pastry")) coll = snackImages;

    return `${coll[productId % 10]}?w=800&h=800&fit=crop`; // Ukuran lebih besar untuk detail
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu/${id}`);
        const json = await res.json();

        if (json.success) {
          const data = json.data;
          // Ensure category_name exists for getImageUrl logic
          const cleanData = {
              ...data,
              category_name: data.category ? data.category.name : (data.category_name || "Uncategorized")
          };
          setProduct(cleanData);

          // Set Default Variant
          if (cleanData.variants && cleanData.variants.length > 0) {
              setSelectedVariant(cleanData.variants[0]);
          }

          // Set Default Modifiers
          if (cleanData.modifiers && cleanData.modifiers.length > 0) {
              const defaults: any = {};
              cleanData.modifiers.forEach((mod: any) => {
                  if (mod.options && mod.options.length > 0) {
                      const defaultOpt = mod.options.find((opt: any) => opt.isDefault) || mod.options[0];
                      defaults[mod.name] = defaultOpt;
                  }
              });
              setSelectedModifiers(defaults);
          }
        }
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const calculateTotal = () => {
    if (!product) return 0;
    
    const baseProductPrice = parseFloat(product.price) || 0;
    let currentPrice = selectedVariant ? parseFloat(selectedVariant.price) : baseProductPrice;

    let modifierTotal = 0;
    Object.values(selectedModifiers).forEach((mod: any) => {
        if (mod.priceChange) modifierTotal += mod.priceChange;
    });

    return (currentPrice + modifierTotal) * qty;
  };

  const handleAddToCartWrapper = () => {
    if (!product) return;
    
    setIsAdding(true);

    setTimeout(() => {
        const finalUnitPrice = calculateTotal() / qty;

        addToCart({
            id: product.id,
            name: product.name,
            price: finalUnitPrice,
            image: getImageUrl(product), // Menggunakan getImageUrl sinkron
            category: product.category_name || "Uncategorized",
            quantity: qty,
            selectedVariant: selectedVariant?.name,
            selectedModifiers: Object.fromEntries(
               Object.entries(selectedModifiers).map(([key, val]: any) => [key, val.label])
            )
        });

        setIsAdding(false);
        setIsSuccess(true);

        setTimeout(() => setIsSuccess(false), 2000);
    }, 600);
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;
  if (!product) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-gray-500 font-bold">Product data not found.</div>;

  let nutrition = null;
  try {
     if (product.nutritional_info) nutrition = JSON.parse(product.nutritional_info);
  } catch (e) {}

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans text-navy-900 flex flex-col justify-between selection:bg-gold-200">
      <NavbarDashboard />
      
      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 max-w-7xl">
        
        {/* Breadcrumb */}
        <button 
            onClick={() => router.push('/menu')} 
            className="group flex items-center gap-2 text-gray-400 hover:text-navy-900 mb-8 transition-colors text-sm font-bold"
        >
            <span className="group-hover:underline">Menu</span>
            <ChevronRight size={14} />
            <span className="text-navy-900">{product.name}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* --- LEFT: PRODUCT IMAGE (STICKY) --- */}
            <div className="relative lg:sticky lg:top-32">
                <div className="relative aspect-square bg-white rounded-[2.5rem] shadow-xl shadow-navy-900/5 overflow-hidden border border-gray-100 group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gold-50 rounded-full blur-3xl opacity-60"></div>
                    
                    <div className="absolute inset-0 p-10 flex items-center justify-center">
                        {/* Menggunakan getImageUrl(product) */}
                        <img 
                            src={getImageUrl(product)} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 drop-shadow-2xl z-10" 
                        />
                    </div>

                    <button 
                        onClick={() => setIsFavorite(!isFavorite)} 
                        className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20 group/fav"
                    >
                        <Heart size={22} className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 group-hover/fav:text-red-400"}`} />
                    </button>
                </div>
            </div>

            {/* --- RIGHT: PRODUCT DETAILS --- */}
            <div className="flex flex-col gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-navy-50 text-navy-900 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {product.category_name}
                        </span>
                        <div className="flex items-center gap-1 text-gold-500">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs font-bold text-navy-900">Recommended</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-navy-900 leading-tight mb-4">
                        {product.name}
                    </h1>
                    
                    <p className="text-gray-500 text-lg leading-relaxed">
                        {product.description}
                    </p>

                    {nutrition && (
                        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Calories</p>
                                <p className="text-navy-900 font-bold flex items-center justify-center gap-1">{nutrition.calories}</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sugar</p>
                                <p className="text-navy-900 font-bold">{nutrition.sugar}</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Fat</p>
                                <p className="text-navy-900 font-bold">{nutrition.fat}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px w-full bg-gray-200"></div>

                <div className="space-y-8">
                    {product.variants && product.variants.length > 0 && (
                        <div>
                            <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">Select Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.variants?.map((variant, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setSelectedVariant(variant)} 
                                        className={`px-6 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 flex flex-col items-center min-w-[100px] ${selectedVariant?.name === variant.name ? 'bg-navy-900 text-white border-navy-900 shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gold-500'}`}
                                    >
                                        <span>{variant.name}</span>
                                        <span className={`text-[10px] mt-1 ${selectedVariant?.name === variant.name ? 'text-gold-500' : 'opacity-70'}`}>Rp {parseFloat(variant.price.toString()).toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.modifiers && product.modifiers.length > 0 && product.modifiers.map((mod, idx) => (
                        <div key={idx}>
                            <h3 className="font-bold text-navy-900 mb-3 text-sm flex items-center justify-between uppercase tracking-wide">
                                <span>{mod.name}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {mod.options?.map((opt, oIdx) => (
                                    <button 
                                        key={oIdx} 
                                        onClick={() => setSelectedModifiers({...selectedModifiers, [mod.name]: opt})} 
                                        className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all ${selectedModifiers[mod.name]?.label === opt.label ? 'bg-gold-50 text-gold-700 border-gold-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}
                                    >
                                        {opt.label} {opt.priceChange ? ` (+${(opt.priceChange/1000)}k)` : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 mt-4 sticky bottom-6 z-30">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1.5 border border-gray-200">
                                <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-navy-900"><Minus size={18}/></button>
                                <span className="font-black text-navy-900 w-8 text-center text-lg">{qty}</span>
                                <button onClick={() => setQty(qty+1)} className="w-10 h-10 flex items-center justify-center bg-navy-900 text-white rounded-full shadow-sm"><Plus size={18}/></button>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Total Amount</p>
                                <p className="text-3xl font-black text-navy-900">Rp {calculateTotal().toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleAddToCartWrapper}
                            disabled={isAdding || isSuccess} 
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isSuccess ? "bg-green-500 text-white shadow-green-500/30" : "bg-navy-900 text-white hover:bg-gold-500 shadow-navy-900/20"}`}
                        >
                            {isAdding ? <Loader2 className="animate-spin" /> : isSuccess ? <><CheckCircle2 /> Added!</> : <><ShoppingBag size={22} /> Add to Cart</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
