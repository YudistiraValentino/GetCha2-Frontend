"use client";

import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
// 1. Import Transition untuk animasi pindah halaman
import { useTransition } from "@/app/context/TransitionContext";

// Sesuaikan tipe data dengan yang dikirim dari Dashboard (API)
interface Product {
  id: number;
  name: string;
  category: string;
  price: number; // Dari API dashboard sekarang number
  image: string;
  description: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const { triggerTransition } = useTransition();

  // Fungsi untuk pindah ke detail page
  const handleNavigate = (e?: React.MouseEvent) => {
    // Stop propagation biar gak double trigger kalau ada elemen lain
    if (e) e.stopPropagation();
    
    // Arahkan ke halaman detail produk
    triggerTransition(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={handleNavigate} // Klik area kartu manapun -> Pindah ke detail
      className="block h-full group cursor-pointer"
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative h-full flex flex-col">
        
        {/* Badge Kategori */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-navy-900/10 backdrop-blur-md text-navy-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Gambar */}
        <div className="w-full h-56 bg-gray-50 relative flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-500">
            <Image 
              src={product.image || "/Image/placeholder.png"} 
              alt={product.name} 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Info Area */}
        <div className="p-5 relative flex-1 flex flex-col justify-end">
          <div className="mb-2">
            <h3 className="text-navy-900 font-serif font-bold text-lg leading-tight group-hover:text-gold-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            {/* Harga */}
            <p className="text-gold-500 font-bold mt-1 text-md">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Tombol Plus (Sekarang fungsinya Navigate juga) */}
          <button 
            onClick={handleNavigate}
            className="absolute bottom-5 right-5 w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-gold-500 group-hover:text-navy-900 transition-all duration-300 transform group-active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;