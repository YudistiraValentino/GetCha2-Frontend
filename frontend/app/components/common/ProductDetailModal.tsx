"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  description?: string; // Opsional
}

interface ModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ModalProps) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  if (!isOpen) return null;

  // Konversi harga string "35K" ke number
  const priceNumber = parseInt(product.price.replace("K", "000").replace("Rp", "").trim());

  const handleAddToCart = () => {
    // Masukkan ke keranjang sebanyak qty
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: priceNumber,
        image: product.image,
        category: product.category,
        quantity: qty,
      });
    }
    onClose(); // Tutup modal setelah add
    setQty(1); // Reset qty
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* 1. Backdrop Gelap (Klik luar untuk tutup) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* 2. Konten Modal */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl z-10 flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-20 text-navy-900"
        >
          <X size={24} />
        </button>

        {/* Kiri: Gambar Besar */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-50 relative flex items-center justify-center p-8">
          <div className="relative w-full h-full">
             <Image 
               src={product.image} 
               alt={product.name} 
               fill 
               className="object-contain"
             />
          </div>
        </div>

        {/* Kanan: Detail & Action */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <span className="text-gold-500 font-bold tracking-widest text-xs uppercase mb-2">
            {product.category}
          </span>
          <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4 leading-tight">
            {product.name}
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            {/* Deskripsi Dummy kalau tidak ada */}
            {product.description || "Nikmati perpaduan rasa autentik yang dibuat dari bahan-bahan premium pilihan. Cocok untuk menemani waktu santai atau kerja Anda."}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-navy-900">
                {product.price}
              </span>
              
              {/* Qty Control */}
              <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="hover:text-gold-500">
                  <Minus size={18} />
                </button>
                <span className="font-bold w-4 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="hover:text-gold-500">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag size={20} /> Add to Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;