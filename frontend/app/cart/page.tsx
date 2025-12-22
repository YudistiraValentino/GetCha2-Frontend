"use client";
import React, { useState } from 'react'; 
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingCart, MapPin, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext"; 
import { useRouter } from "next/navigation"; 

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const router = useRouter(); 
  const [isProcessing, setIsProcessing] = useState(false); 

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; 
  const total = subtotal + tax;

  // JALUR 1: DINE IN -> Ke Halaman Booking Kursi
  const handleDineIn = () => {
    router.push('/booking'); 
  };

  // JALUR 2: TAKE AWAY -> Simpan Sesi & Ke Payment
  const handleTakeAway = () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    // 1. Simpan Data Sesi (Biar di page payment tau ini take away)
    const sessionData = {
        type: 'take_away',
        seat_id: null,
        time: null
    };
    localStorage.setItem("checkout_session", JSON.stringify(sessionData));

    // 2. Pindah ke Halaman Payment
    setTimeout(() => {
        router.push('/payment');
    }, 500);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/menu" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-navy-900" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-navy-900 uppercase">Your Cart</h1>
        </div>
        
        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-6">
                {cartItems.map((item) => (
                    <div key={item.internalId} className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-xl relative flex-shrink-0">
                            <Image src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`} alt={item.name} fill className="object-contain p-2"/>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-lg font-bold text-navy-900 font-serif">{item.name}</h3>
                            <p className="text-gold-500 font-bold mb-2">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                            {(item.selectedVariant || item.selectedModifiers) && (
                                <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded-lg inline-block text-left w-full sm:w-auto border border-gray-100">
                                  {item.selectedVariant && <p><span className="font-bold text-navy-900">Size:</span> {item.selectedVariant}</p>}
                                  {item.selectedModifiers && Object.entries(item.selectedModifiers).map(([key, val]) => (
                                    <p key={key}><span className="font-bold text-navy-900">{key}:</span> {val}</p>
                                  ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 mt-4 sm:mt-0">
                            <button onClick={() => updateQuantity(item.internalId, 'minus')} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-navy-900 hover:bg-gold-500 hover:text-white transition-colors"><Minus size={14} /></button>
                            <span className="font-bold text-navy-900 w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.internalId, 'plus')} className="w-8 h-8 flex items-center justify-center bg-navy-900 rounded-full shadow-sm text-white hover:bg-gold-500 transition-colors"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.internalId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-2 sm:mt-0"><Trash2 size={20} /></button>
                    </div>
                ))}
            </div>

            <div className="w-full lg:w-96 h-fit lg:sticky lg:top-32">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-navy-900 mb-6 font-serif">Order Summary</h3>
                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax (11%)</span><span>Rp {tax.toLocaleString("id-ID")}</span></div>
                </div>
                <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-navy-900">Total</span>
                  <span className="text-2xl font-bold text-gold-500">Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Choose Service Type</p>
                    <button onClick={handleDineIn} disabled={isProcessing} className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50">
                      <MapPin size={20} className="group-hover:animate-bounce" /> Dine In & Select Seat
                    </button>
                    <button onClick={handleTakeAway} disabled={isProcessing} className="w-full py-4 bg-white border-2 border-navy-900 text-navy-900 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                      {isProcessing ? <Loader2 className="animate-spin" /> : <ShoppingBag size={20} />} Take Away / Pickup
                    </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400"><ShoppingCart size={40} /></div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Your Cart is Empty</h2>
            <Link href="/menu" className="px-8 py-3 bg-gold-500 text-navy-900 font-bold rounded-full hover:bg-gold-600 transition-colors">Browse Menu</Link>
          </div>
        )}
      </div>
    </main>
  );
}