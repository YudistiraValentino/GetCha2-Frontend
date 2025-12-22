"use client";
import React, { useEffect, useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Image from 'next/image';
import { Copy, Ticket, Loader2 } from 'lucide-react';

// Interface sesuai Database Laravel
interface Promo {
    id: number;
    title: string;
    code: string;
    description: string;
    image: string;
    color: string;
    type: string;
    discount_amount: number;
}

export default function DealsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA DARI LARAVEL
  useEffect(() => {
    const fetchPromos = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/promos');
            const json = await res.json();
            if (json.success) setPromos(json.data);
        } catch (error) {
            console.error("Gagal ambil promo:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchPromos();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Kode ${code} berhasil disalin! Gunakan di Checkout.`);
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-4 md:px-12 pt-32">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-navy-900 mb-2">Exclusive Deals</h1>
            <p className="text-gray-500">Hemat lebih banyak dengan promo spesial hari ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
                <div key={promo.id} className="relative bg-white rounded-2xl shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    
                    {/* Bagian Atas: Gradient dinamis dari DB */}
                    <div className={`h-32 bg-gradient-to-r ${promo.color || 'from-navy-900 to-blue-900'} relative p-6 flex items-center`}>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-1 opacity-90">
                                <Ticket size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Limited Offer</span>
                            </div>
                            <h3 className="text-2xl font-bold">{promo.title}</h3>
                            <p className="text-xs opacity-80 mt-1">
                                Diskon {promo.type === 'percent' ? `${promo.discount_amount}%` : `Rp ${promo.discount_amount.toLocaleString()}`}
                            </p>
                        </div>
                    </div>

                    {/* Detail */}
                    <div className="p-6">
                        <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{promo.description}</p>
                        
                        <div className="flex items-center justify-between bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Voucher Code</span>
                                <span className="text-lg font-bold text-navy-900 font-mono tracking-wider">{promo.code}</span>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(promo.code)}
                                className="bg-white p-2 rounded-lg shadow-sm text-gray-500 hover:text-gold-500 hover:bg-navy-50 transition-colors"
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}