"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

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

    // ✅ FUNGSI GAMBAR: Langsung tembak ke folder /images/ di Next.js
    const getImageUrl = (path: string) => {
        if (!path) return "/images/food.jpg";
        if (path.startsWith("http")) return path;
        // Ambil nama file saja, misal dari "public/products/coffee.jpg" jadi "coffee.jpg"
        const fileName = path.split('/').pop();
        return `/images/${fileName}`;
    };

    // ✅ FUNGSI DELETE: Pastikan URL & Token benar
    const handleDelete = async (id: number) => {
        if (!confirm("Yakin hapus produk ini?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                alert("Produk berhasil dihapus!");
                setProducts(products.filter((p: any) => p.id !== id));
            } else {
                const errData = await res.json();
                alert("Gagal hapus: " + (errData.message || "Cek koneksi/token"));
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        }
    };

    const filtered = products.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-navy-900">Products Inventory</h1>
                <Link href="/admin/products/create" className="bg-navy-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold-500 transition-all shadow-lg">
                    + Add Product
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-6">Product</th>
                            <th className="p-6">Price</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : filtered.map((p: any) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-all">
                                <td className="p-6 flex items-center gap-4">
                                    <div className="w-14 h-14 relative bg-gray-100 rounded-xl overflow-hidden border">
                                        <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className="font-bold text-navy-900">{p.name}</span>
                                </td>
                                <td className="p-6 font-bold">Rp {parseFloat(p.price).toLocaleString("id-ID")}</td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Link Edit */}
                                        <Link href={`/admin/products/${p.id}/edit`}>
                                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={20}/></button>
                                        </Link>
                                        {/* Button Delete */}
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
