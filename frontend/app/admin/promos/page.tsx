"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Edit, Trash2, Plus, Ticket, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/promos`);
      const json = await res.json();
      if (json.success) setPromos(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus promo ini?")) return;
    try {
        await fetch(`${BACKEND_URL}/api/admin/promos/${id}`, { method: "DELETE" });
        fetchPromos();
    } catch (e) { alert("Gagal hapus"); }
  };

  const getImageUrl = (path: string) => {
      if (!path) return "/placeholder.png";
      return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900"/></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Deals & Promos</h1>
            <p className="text-gray-500 text-sm">Manage vouchers and special offers.</p>
        </div>
        <Link href="/admin/promos/create" className="bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg">
            <Plus size={20} /> Add New Promo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                {/* Image Cover */}
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                    {promo.image ? (
                        <Image src={getImageUrl(promo.image)} alt={promo.title} fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized/>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300"><Ticket size={40}/></div>
                    )}
                    <div className="absolute top-3 right-3">
                        {promo.is_active === 1 ? (
                            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><CheckCircle size={10}/> ACTIVE</span>
                        ) : (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><XCircle size={10}/> INACTIVE</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-navy-900 line-clamp-1">{promo.title}</h3>
                        <span className="bg-gold-100 text-gold-700 text-xs font-black px-2 py-1 rounded border border-gold-200 uppercase">{promo.code}</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{promo.description || "No description."}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded">
                        <Calendar size={14}/>
                        <span>{promo.start_date}</span>
                        <span>-</span>
                        <span>{promo.end_date}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-sm font-bold text-blue-600">
                            {promo.type === 'fixed' ? `Potongan Rp ${parseInt(promo.discount_amount).toLocaleString()}` : `Diskon ${promo.discount_amount}%`}
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/admin/promos/${promo.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></Link>
                            <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
        {promos.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">No promos available.</p>}
      </div>
    </div>
  );
}