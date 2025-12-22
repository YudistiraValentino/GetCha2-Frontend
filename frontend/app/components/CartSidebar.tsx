"use client";

import { X, Trash2, ShoppingBag } from "lucide-react";
// 👇 Gunakan alias @ agar import path pasti benar
import { useCart } from "@/app/context/CartContext"; 
import { useRouter } from "next/navigation"; 

// URL Backend Laravel
// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CartSidebar() {
  const router = useRouter(); 
  
  const {
    cartItems,
    isCartOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  // Helper: Ambil Full URL Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path; 
    return `${BACKEND_URL}${path}`; 
  };

  const handleProceedToCheckout = () => {
    toggleCart(); 
    router.push('/cart'); 
  };

  return (
    <>
      {/* Overlay Gelap */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart} 
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <ShoppingBag size={24} />
            My Cart ({cartItems.length})
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* List Barang */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <ShoppingBag size={64} className="opacity-20" />
              <p>Your cart is empty.</p>
              <button onClick={toggleCart} className="text-navy-900 font-bold underline">
                Start Ordering
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.internalId} className="flex gap-4">
                {/* Gambar Kecil */}
                <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  {/* 🔥 UPDATE: Pakai tag img biasa biar gambar dari Laravel muncul */}
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-contain p-2" 
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-navy-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gold-600 font-bold uppercase">{item.category}</p>
                    
                    {/* Tampilkan Varian/Modifier jika ada */}
                    {(item.selectedVariant || item.selectedModifiers) && (
                        <div className="text-[10px] text-gray-400 mt-1 leading-tight">
                            {item.selectedVariant && <span>{item.selectedVariant}</span>}
                            {/* 🔥 UPDATE: Pakai String() biar aman dari error object */}
                            {item.selectedModifiers && Object.values(item.selectedModifiers).map((mod, idx) => (
                                <span key={idx}> • {String(mod)}</span>
                            ))}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-navy-900 text-sm">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                    
                    {/* Kontrol Plus/Minus */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                       <button onClick={() => updateQuantity(item.internalId, 'minus')} className="text-gray-500 hover:text-navy-900 font-bold text-lg">-</button>
                       <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.internalId, 'plus')} className="text-navy-900 hover:text-gold-500 font-bold text-lg">+</button>
                    </div>
                  </div>
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => removeFromCart(item.internalId)}
                  className="text-gray-300 hover:text-red-500 self-start p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-navy-900">
              <span>Total</span>
              <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            
            <button
              onClick={handleProceedToCheckout} 
              className="w-full py-4 bg-navy-900 text-white rounded-xl font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg active:scale-95"
            >
              Review Order & Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}