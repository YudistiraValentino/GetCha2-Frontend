"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

// ✅ CONFIG
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Ambil Data dari Backend
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/menu`);
            const json = await res.json();
            if (json.success) {
                setProducts(json.data);
            }
        } catch (error) {
            console.error("Gagal ambil produk:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // 2. Fungsi Ambil Gambar (Simpel & Anti-Gagal)
    const getImageUrl = (path: string) => {
        // Jika di database kosong, pakai food.jpg sebagai cadangan
        if (!path) return "/images/food.jpg";
        
        // Jika path adalah URL internet (Cloudinary dll), biarkan
        if (path.startsWith("http")) return path;

        // Kita hanya butuh nama filenya (misal: "coffee.jpg")
        // Lalu kita arahkan ke folder /images/ yang ada di public Next.js
        const fileName = path.split('/').pop(); 
        return `/images/${fileName}`;
    };

    // 3. Fungsi Delete
    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus produk ini?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            if (res.ok) {
                alert("Produk berhasil dihapus!");
                // Hapus langsung dari tampilan (state) agar cepat
                setProducts(products.filter((p: any) => p.id !== id));
            } else {
                alert("Gagal menghapus. Pastikan Anda login sebagai admin.");
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        }
    };

    // Filter produk berdasarkan search
    const filteredProducts = products.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-navy-900">Inventory</h1>
                    <p className="text-gray-500">Kelola menu makanan dan minuman kamu.</p>
                </div>
                <Link href="/admin/products/create">
                    <button className="bg-navy-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-500 transition-all shadow-lg shadow-navy-900/10">
                        <Plus size={20} /> Add New Product
                    </button>
                </Link>
            </div>

            {/* SEARCH BAR */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari nama produk..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-6">Produk</th>
                                <th className="p-6">Harga</th>
                                <th className="p-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-navy-900" size={32} />
                                    </td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-gray-100 border">
                                                    <Image 
                                                        src={getImageUrl(p.image)} 
                                                        alt={p.name} 
                                                        fill 
                                                        className="object-cover" 
                                                        unoptimized
                                                    />
                                                </div>
                                                <span className="font-bold text-navy-900">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-semibold">
                                            Rp {parseFloat(p.price).toLocaleString("id-ID")}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit Button */}
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Edit size={20} />
                                                    </button>
                                                </Link>
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-20 text-center text-gray-400">Produk tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
