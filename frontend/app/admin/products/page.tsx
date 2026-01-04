"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/menu`);
            const json = await res.json();
            if (json.success) setProducts(json.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    // ✅ FIX: Paksa panggil folder /Images/ (I Besar)
    const getImageUrl = (path: string) => {
        if (!path) return "/Images/food.jpg";
        if (path.startsWith("http")) return path;
        const fileName = path.split('/').pop();
        return `/Images/${fileName}`;
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus produk?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
            });
            if (res.ok) {
                alert("Berhasil dihapus!");
                setProducts(products.filter((p: any) => p.id !== id));
            }
        } catch (error) { alert("Error"); }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-navy-900">Inventory</h1>
                <Link href="/admin/products/create" className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gold-500 transition-all">+ Add Product</Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
                            <tr>
                                <th className="p-6">Product</th>
                                <th className="p-6">Price</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={3} className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr>
                            ) : products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 flex items-center gap-4">
                                        <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden border">
                                            <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <span className="font-bold text-navy-900">{p.name}</span>
                                    </td>
                                    <td className="p-6 font-bold text-navy-900">Rp {parseFloat(p.price).toLocaleString()}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${p.id}/edit`}><button className="p-2 text-blue-500"><Edit size={20}/></button></Link>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
