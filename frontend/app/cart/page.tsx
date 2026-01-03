"use client";
import React, { useState, useEffect } from "react";
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useCart } from "@/app/context/CartContext";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft, 
  MapPin, 
  ShoppingBag, 
  Loader2,
  Utensils,
  Receipt,
  Coffee
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ✅ CONFIG
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hindari Hydration Error
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hitung Total
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  // LOGIC JALUR 1: DINE IN
  const handleDineIn = () => {
    router.push('/booking'); 
  };

  // LOGIC JALUR 2: TAKE AWAY
  const handleTakeAway = () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    // 1. Simpan Data Sesi
    const sessionData = {
        type: 'take_away',
        seat_id: null,
        time: null
    };
    localStorage.setItem("checkout_session", JSON.stringify(sessionData));

    // 2. Pindah ke Halaman Payment
    setTimeout(() => {
        router.push('/payment');
    }, 800); // Sedikit delay agar animasi loading terlihat
  };

  // Helper URL Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace('public/', '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (!cleanPath.startsWith('/storage') && !cleanPath.startsWith('/images') && !cleanPath.startsWith('/maps')) {
      cleanPath = '/storage' + cleanPath;
    }
    return `${BACKEND_URL}${cleanPath}`;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-navy-900 pb-32">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/menu" className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gold-500 hover:text-navy-900 transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
                Your Cart
                <span className="text-base font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{cartItems.length} Items</span>
            </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* --- LEFT: CART ITEMS LIST --- */}
            <div className="flex-1 w-full space-y-6">
              {cartItems.map((item) => (
                <div 
                    key={item.internalId}
                    className="group bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 items-center md:items-start"
                >
                  {/* Gambar Produk */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-[#F4F5F7] rounded-2xl overflow-hidden shrink-0">
                     <Image 
                        src={getImageUrl(item.image)} 
                        alt={item.name} 
                        fill 
                        className="object-contain p-2"
                     />
                  </div>

                  {/* Detail Produk */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] font-bold text-gold-600 uppercase tracking-wider mb-1">{item.category}</p>
                            <h3 className="text-xl font-bold text-navy-900">{item.name}</h3>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.internalId)} 
                            className="text-gray-300 hover:text-red-500 transition-colors p-2 hidden md:block"
                            title="Remove item"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    {/* Varian & Modifier List */}
                    {(item.selectedVariant || item.selectedModifiers) && (
                        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start text-xs text-gray-500">
                            {item.selectedVariant && (
                                <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    Size: <b className="text-navy-900">{item.selectedVariant}</b>
                                </span>
                            )}
                            {item.selectedModifiers && Object.entries(item.selectedModifiers).map(([key, val]) => (
                                <span key={key} className="bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    {key}: <b className="text-navy-900">{String(val)}</b>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Harga & Quantity Control */}
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-auto gap-4">
                        <p className="font-bold text-navy-900 text-lg">
                            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                        
                        <div className="flex items-center gap-3">
                             {/* Mobile Delete Button */}
                            <button 
                                onClick={() => removeFromCart(item.internalId)} 
                                className="text-gray-300 hover:text-red-500 transition-colors p-2 md:hidden"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                                <button 
                                    onClick={() => updateQuantity(item.internalId, 'minus')}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 text-navy-900"
                                >
                                    <Minus size={14}/>
                                </button>
                                <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.internalId, 'plus')}
                                    className="w-8 h-8 flex items-center justify-center bg-navy-900 text-white rounded-full shadow-sm hover:bg-gold-500 transition-colors"
                                >
                                    <Plus size={14}/>
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- RIGHT: ORDER SUMMARY (Sticky) --- */}
            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-32 space-y-6">
                
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-navy-900/5">
                    <h3 className="font-bold text-navy-900 mb-6 flex items-center gap-2 text-lg">
                        <Receipt size={20} className="text-gold-500"/> Order Summary
                    </h3>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>Subtotal</span>
                            <span className="font-bold text-navy-900">Rp {subtotal.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>Tax (11%)</span>
                            <span className="font-bold text-navy-900">Rp {tax.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-px bg-gray-100 border-t border-dashed my-2"></div>
                        <div className="flex justify-between text-lg font-black text-navy-900">
                            <span>Total</span>
                            <span className="text-gold-600">Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    {/* METHOD SELECTION */}
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Choose Dining Method</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {/* Dine In Button */}
                        <button 
                            onClick={handleDineIn} 
                            disabled={isProcessing}
                            className="relative group w-full py-4 bg-navy-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <MapPin size={20} />
                            <span>Dine In & Select Seat</span>
                        </button>

                        {/* Take Away Button */}
                        <button 
                            onClick={handleTakeAway} 
                            disabled={isProcessing}
                            className="w-full py-4 bg-white border-2 border-gray-100 text-navy-900 font-bold rounded-2xl hover:border-navy-900 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <ShoppingBag size={20} />}
                            <span>Take Away / Pickup</span>
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400">
                        <Coffee size={12} />
                        <span>Prepared fresh upon order</span>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-gold-200 rounded-full blur-2xl opacity-30"></div>
                <Utensils size={64} className="text-gray-300 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-500 max-w-md mb-8">
                Looks like you haven't added anything to your cart yet. 
                Explore our menu to find your craving!
            </p>
            <Link href="/menu">
                <button className="px-8 py-4 bg-navy-900 text-white font-bold rounded-full shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center gap-2">
                    <ArrowLeft size={20} /> Browse Menu
                </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}