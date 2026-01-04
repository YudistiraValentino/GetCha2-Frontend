"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Edit, Trash2, Plus, Ticket, Calendar, CheckCircle, XCircle, Loader2, Search, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";

// ✅ CONFIG
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminPromosList() {
  const router = useRouter(); 
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH LIST
  const fetchPromos = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) { 
        router.push('/admin/login'); 
        return; 
    }

    try {
      // Menggunakan Token di URL & Header (Double Protection)
      const res = await fetch(`${BACKEND_URL}/api/admin/promos?token=${token}`, {
        headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      });
      const json = await res.json();
      if (res.ok) {
          setPromos(json.data || []);
      } else {
          if (res.status === 401) router.push('/admin/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  // Filter Logic
  const filteredPromos = promos.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus promo ini?")) return;
    const token = localStorage.getItem('token');
    
    try {
        await fetch(`${BACKEND_URL}/api/admin/promos/${id}?token=${token}`, { 
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPromos();
    } catch (e) { alert("Gagal hapus"); }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;
    let clean = path.replace('public/', '');
    if (!clean.startsWith('/')) clean = '/' + clean;
    if (!clean.startsWith('/storage') && !clean.startsWith('/images') && !clean.startsWith('/maps')) clean = '/storage' + clean;
    return `${BACKEND_URL}${clean}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard /> 
      <div className="container mx-auto px-6 pt-32">
          
          {/* HEADER (Mirip Order Page) */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">Deals & Promos</h1>
                <p className="text-gray-500 text-sm">Manage vouchers and special offers.</p>
            </div>
            
            <div className="flex gap-3">
                <button onClick={fetchPromos} className="bg-white text-navy-900 px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition">
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                
                <Link href="/admin/promos/create" className="bg-navy-900 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-500 hover:text-navy-900 transition shadow-lg">
                    <Plus size={18} /> Add New Promo
                </Link>
            </div>
          </div>

          {/* SEARCH BAR CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Promo Title or Code..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-navy-900 transition focus:bg-white"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {/* GRID PROMO */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-navy-900" size={40}/></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromos.map((promo) => (
                    <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                        <div className="h-40 bg-gray-100 relative">
                            {promo.image ? (
                                <Image src={getImageUrl(promo.image)} alt={promo.title} fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized/>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300"><Ticket size={40}/></div>
                            )}
                            <div className="absolute top-3 right-3">
                                {promo.is_active === 1 ? <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex gap-1 items-center shadow-sm"><CheckCircle size={10}/> ACTIVE</span> : <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex gap-1 items-center shadow-sm"><XCircle size={10}/> INACTIVE</span>}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-navy-900 line-clamp-1">{promo.title}</h3>
                                <span className="bg-gold-100 text-gold-700 text-xs font-black px-2 py-1 rounded border border-gold-200 uppercase w-fit">{promo.code}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded">
                                <Calendar size={14}/><span>{promo.start_date}</span> - <span>{promo.end_date}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                <div className="text-sm font-bold text-blue-600">{promo.type === 'fixed' ? `Rp ${parseInt(promo.discount_amount).toLocaleString()}` : `${promo.discount_amount}% OFF`}</div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/promos/${promo.id}`} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg transition"><Edit size={18}/></Link>
                                    <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg transition"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
          
          {!loading && filteredPromos.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <Ticket size={48} className="mx-auto mb-4 opacity-20"/>
                <p>No promos found matching "{searchTerm}".</p>
            </div>
          )}
      </div>
    </main>
  );
}