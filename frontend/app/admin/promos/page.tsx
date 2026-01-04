"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Edit, Trash2, Plus, Ticket, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ CONFIG: Pakai Env Var atau Default Railway
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminPromosPage() {
  const router = useRouter(); 
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA
  const fetchPromos = async () => {
    const token = localStorage.getItem('token');
    
    // Kalau gak ada token, langsung tendang
    if (!token) { 
        router.push('/admin/login'); 
        return; 
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/promos`, {
        method: 'GET',
        headers: { 
            'Accept': 'application/json',        // ✅ Biar Backend tau kita minta JSON
            'Authorization': `Bearer ${token}`   // ✅ Karcis Masuk
        }
      });

      const json = await res.json();

      if (res.ok) {
          setPromos(json.data || []);
      } else {
          // Kalau Token Basi (401), Logout paksa
          if (res.status === 401) {
              localStorage.removeItem('token');
              router.push('/admin/login');
          } else {
              console.error("Gagal fetch:", json.message);
          }
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  // 2. DELETE FUNCTION
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus promo ini?")) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/promos/${id}`, { 
            method: "DELETE",
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Wajib ada token buat hapus
            } 
        });

        if (res.ok) {
            alert("Promo berhasil dihapus!");
            fetchPromos(); // Refresh list
        } else {
            alert("Gagal menghapus promo.");
        }
    } catch (e) { 
        alert("Error koneksi saat menghapus."); 
    }
  };

  // 3. HELPER GAMBAR
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;
    
    let cleanPath = path.replace('public/', '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    // Logic path storage laravel
    if (!cleanPath.startsWith('/storage') && !cleanPath.startsWith('/images') && !cleanPath.startsWith('/maps')) {
        cleanPath = '/storage' + cleanPath;
    }
    
    return `${BACKEND_URL}${cleanPath}`;
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900" size={40}/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-32 px-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-navy-900">Deals & Promos</h1>
                <p className="text-gray-500 text-sm">Manage vouchers and special offers.</p>
            </div>
            <Link href="/admin/promos/create" className="bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg">
                <Plus size={20} /> Add New Promo
            </Link>
          </div>

          {/* GRID PROMO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
                <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                        {promo.image ? (
                            <Image 
                                src={getImageUrl(promo.image)} 
                                alt={promo.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition duration-500" 
                                unoptimized
                            />
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
            
            {!loading && promos.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed">
                    <Ticket size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>No active promos found.</p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
}