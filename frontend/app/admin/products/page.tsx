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
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const json = await res.json();
        if (json.success) setProducts(json.data);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const getImageUrl = (path: string) => {
        if (!path) return "/images/food.jpg";
        if (path.startsWith("http")) return path;
        const fileName = path.split('/').pop();
        return `/images/${fileName}`;
    };

    return (
        <div className="p-10">
            <div className="flex justify-between mb-10">
                <h1 className="text-3xl font-bold">Admin Products</h1>
                <Link href="/admin/products/create" className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold">+ Add Product</Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p: any) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden">
                                        <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className="font-bold">{p.name}</span>
                                </td>
                                <td className="p-4">Rp {parseFloat(p.price).toLocaleString()}</td>
                                <td className="p-4 text-right">
                                    <button className="text-blue-600 mr-4"><Edit size={18}/></button>
                                    <button className="text-red-600"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
