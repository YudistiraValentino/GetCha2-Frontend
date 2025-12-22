"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Coffee } from "lucide-react";
import Link from "next/link";

// Komponen Content dipisah biar aman pakai useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const router = useRouter();

  // Kalau gak ada Order ID, tendang balik ke menu (keamanan)
  useEffect(() => {
    if (!orderId) {
      const timer = setTimeout(() => router.push("/menu"), 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <div className="text-center">
      {/* Icon Animasi */}
      <div className="mb-8 relative inline-block">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-6 rounded-full shadow-xl">
          <CheckCircle size={80} className="text-green-500" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold text-navy-900 mb-4">
        Order Confirmed!
      </h1>
      
      <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
        Terima kasih! Pesananmu sedang disiapkan oleh barista kami.
        Silakan tunggu panggilan nomor antrianmu.
      </p>

      {/* Kotak Tiket */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 mb-10 max-w-sm mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-navy-900"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
          Order ID
        </p>
        <p className="text-5xl font-black text-navy-900 tracking-tighter">
          #{orderId}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-gold-600 font-bold">
           <Coffee size={20} />
           <span>Sedang Dibuat...</span>
        </div>
      </div>

      {/* Tombol Back */}
      <Link 
        href="/menu" 
        className="inline-flex items-center gap-2 bg-navy-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg hover:shadow-gold-500/30"
      >
        Pesan Lagi
        <ArrowRight size={20} />
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
       {/* Hiasan Background */}
       <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500 rounded-full blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
       <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy-900 rounded-full blur-3xl opacity-5 translate-x-1/2 translate-y-1/2"></div>

       <Suspense fallback={<div>Loading...</div>}>
         <SuccessContent />
       </Suspense>
    </div>
  );
}