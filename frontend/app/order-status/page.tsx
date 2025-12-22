"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Home, MapPin, ShoppingBag, Receipt, Ticket } from 'lucide-react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";

// Update Interface agar bisa baca data diskon
interface OrderData {
  orderId: string;
  queueNumber: string;
  items: any[];
  total: number;
  subtotal: number;    // Baru
  discount?: number;   // Baru
  promoCode?: string;  // Baru
  paymentMethod: string;
  date: string;
  booking: { seatId: string | null; time: string };
}

export default function OrderStatusPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
  }

  // Hitung Tax & Service untuk ditampilkan terpisah
  // Rumus: Tax (11%) + Service (2000)
  const taxAndService = (order.subtotal * 0.11) + 2000;

  return (
    <main className="min-h-screen bg-navy-900 pb-20 font-sans">
      <NavbarDashboard />

      <div className="container mx-auto px-4 pt-32 flex justify-center">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Hiasan Atas (Punch Hole Effect) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-navy-900 rounded-full -mt-5 z-10"></div>

            {/* Header Sukses */}
            <div className="p-8 text-center border-b-2 border-dashed border-gray-100 relative">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                    <CheckCircle size={32} />
                </div>
                <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Payment Success!</h1>
                <p className="text-gray-500 text-sm">Thank you for your order.</p>
                
                {/* Metode Bayar Badge */}
                <div className="absolute top-6 right-6">
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded uppercase border border-gray-200">
                        {order.paymentMethod === 'qris' ? 'QRIS' : 'CASH'}
                    </span>
                </div>
            </div>

            {/* NOMOR ANTRIAN (Hero Section) */}
            <div className="bg-gold-50 p-6 text-center relative overflow-hidden">
                {/* Pattern Background Tipis */}
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                <p className="text-navy-900 text-xs font-bold uppercase tracking-widest mb-2">Queue Number</p>
                <h2 className="text-6xl font-black text-navy-900 font-serif tracking-tighter">{order.queueNumber}</h2>
                <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gold-200 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gold-700">Kitchen is preparing...</span>
                </div>
            </div>

            {/* DETAIL ORDER */}
            <div className="p-8 space-y-6">
                
                {/* Info Dasar */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-gray-400 font-bold uppercase mb-1">Order ID</p>
                        <p className="font-mono font-bold text-navy-900 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                            {order.orderId}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 font-bold uppercase mb-1">Date</p>
                        <p className="font-bold text-navy-900">{order.date.split(',')[0]}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <MapPin size={24} className="text-gold-500 shrink-0" />
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Location / Seat</p>
                        <p className="text-sm font-bold text-navy-900">
                            {order.booking.seatId ? `Dine In - Table ${order.booking.seatId}` : "Take Away / Pickup"}
                        </p>
                    </div>
                </div>

                {/* List Barang Ringkas */}
                <div className="space-y-3 pt-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 pb-2">Items Ordered</p>
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm items-start">
                            <span className="text-gray-600">
                                <span className="font-bold text-navy-900 mr-2">{item.quantity}x</span> 
                                {item.name}
                            </span>
                            <span className="font-medium text-navy-900 tabular-nums">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* --- RINCIAN PEMBAYARAN (YANG KITA UPDATE) --- */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm border border-gray-100">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span className="tabular-nums">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Tax & Service</span>
                        <span className="tabular-nums">Rp {taxAndService.toLocaleString('id-ID')}</span>
                    </div>
                    
                    {/* Baris Diskon (Hanya muncul jika ada) */}
                    {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-green-600 font-bold">
                            <span className="flex items-center gap-1">
                                <Ticket size={12}/> Discount {order.promoCode ? `(${order.promoCode})` : ''}
                            </span>
                            <span className="tabular-nums">- Rp {order.discount.toLocaleString('id-ID')}</span>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                        <span className="font-bold text-navy-900">Total Paid</span>
                        <span className="font-bold text-lg text-navy-900 tabular-nums">
                            Rp {order.total.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

            </div>

            {/* Footer Struk */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <Link href="/dashboard" className="flex-1">
                    <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-navy-900 font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors">
                        <Home size={18}/> Home
                    </button>
                </Link>
                <button 
                    onClick={() => window.print()} 
                    className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-navy-800 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-navy-900/20"
                >
                    <Receipt size={18}/> Print Struk
                </button>
            </div>

        </div>
      </div>
    </main>
  );
}