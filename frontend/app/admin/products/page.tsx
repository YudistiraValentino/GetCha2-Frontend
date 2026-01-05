"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

// ✅ CONFIG URL BACKEND
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

    // ✅ JURUS PAMUNGKAS: Ambil gambar dari internet berdasarkan kata kunci kategori
    const getImageUrl = (product: any) => {
        const name = product.name.toLowerCase();
        const category = (product.category?.name || "").toLowerCase();

        // Jika ada kata 'kopi' atau 'coffee' atau kategori 1/2
        if (name.includes("coffee") || name.includes("kopi") || category.includes("coffee") || product.category_id == 1) {
            return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop";
        }
        // Jika ada kata 'snack' atau 'dessert' atau 'cake'
        if (name.includes("snack") || name.includes("cake") || category.includes("snack") || product.category_id == 4) {
            return "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop";
        }
        // Default: Gambar Makanan
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop";
    };

    // ✅ FUNGSI DELETE
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
                setProducts(products.filter((p: any) => p.id !== id));
            } else {
                alert("Gagal hapus. Pastikan token admin masih aktif.");
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi ke server.");
        }
    };

    const filtered = products.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Product Inventory</h1>
                    <p className="text-gray-500 text-sm">Menggunakan Cloud Images (Anti-404)</p>
                </div>
                <Link href="/admin/products/create">
                    <button className="bg-navy-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold-500 transition-all shadow-lg flex items-center gap-2">
                        <Plus size={20} /> Add Product
                    </button>
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-6">Product Info</th>
                                <th className="p-6">Price</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-navy-900" size={32} />
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-all">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-16 h-16 relative bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                                                <Image 
                                                    src={getImageUrl(p)} 
                                                    alt={p.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    unoptimized 
                                                />
                                            </div>
                                            <div>
                                                <span className="font-bold text-navy-900 block">{p.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-navy-900">
                                            Rp {parseFloat(p.price).toLocaleString("id-ID")}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit size={20}/></button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="p-20 text-center text-gray-400">Tidak ada produk.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
