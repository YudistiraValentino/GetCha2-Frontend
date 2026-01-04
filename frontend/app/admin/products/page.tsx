"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/menu`);
            const json = await res.json();
            if (json.success) setProducts(json.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // ✅ FIX URL GAMBAR
    const getImageUrl = (path: string) => {
        if (!path) return "/images/food.jpg";
        if (path.startsWith("http")) return path;
        const fileName = path.split('/').pop();
        return `/images/${fileName}`;
    };

    // ✅ FIX DELETE LOGIC
    const handleDelete = async (id: number) => {
        if (!confirm("Hapus produk ini secara permanen?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert("Produk berhasil dihapus!");
                setProducts(products.filter((p: any) => p.id !== id)); // Update UI instant
            } else {
                alert("Gagal hapus: " + (data.message || "Unauthorized"));
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi.");
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-navy-900">Admin Inventory</h1>
                <Link href="/admin/products/create" className="bg-navy-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gold-500 transition-all shadow-lg flex items-center gap-2">
                    <Plus size={20}/> <span className="hidden md:block">Add Product</span>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-6">Product</th>
                                <th className="p-6">Category</th>
                                <th className="p-6">Price</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-gray-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32}/>
                                        Loading Inventory...
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-14 h-14 relative bg-gray-100 rounded-xl overflow-hidden border">
                                                <Image 
                                                    src={getImageUrl(p.image)} 
                                                    alt={p.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    unoptimized 
                                                />
                                            </div>
                                            <span className="font-bold text-navy-900">{p.name}</span>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full uppercase">
                                                {p.category?.name || "General"}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold">
                                            Rp {parseFloat(p.price).toLocaleString("id-ID")}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                {/* Tombol Edit - Mengarah ke page edit */}
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit size={20}/>
                                                    </button>
                                                </Link>
                                                {/* Tombol Delete */}
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-gray-400">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
