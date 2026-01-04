"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Loader2, 
    Sparkles 
} from "lucide-react";

// ✅ CONFIG
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

interface Product {
    id: number;
    name: string;
    category_name: string;
    price: string;
    image: string;
    is_promo: number;
    created_at: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // 1. FETCH DATA
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Kita pakai endpoint /api/menu karena biasanya lebih lengkap datanya
            const res = await fetch(`${BACKEND_URL}/api/menu`); 
            const json = await res.json();
            
            if (json.success) {
                const cleanData = json.data.map((item: any) => ({
                    ...item,
                    // Pastikan nama kategori terbaca dari relasi backend
                    category_name: item.category ? item.category.name : "Uncategorized"
                }));
                setProducts(cleanData);
            }
        } catch (error) {
            console.error("Gagal ambil produk:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 2. DELETE PRODUCT
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (res.ok) {
                alert("Product deleted!");
                fetchProducts();
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            alert("Error deleting product.");
        }
    };

    // 3. HELPER URL GAMBAR (VERSI FIX)
    // Karena gambar ada di folder public Next.js, kita tidak panggil BACKEND_URL
    const getImageUrl = (path: string) => {
        if (!path) return "/images/products/food.jpg"; // Fallback
        
        // Jika path sudah berupa URL internet (http...), biarkan
        if (path.startsWith("http")) return path;

        // Jika path dari DB adalah "/images/products/coffee.jpg", 
        // Next.js akan otomatis mencarinya di folder public.
        return path; 
    };

    // 4. FILTERING LOGIC
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category_name)))];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-10">
            <div className="container mx-auto max-w-7xl">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Products Management</h1>
                        <p className="text-gray-500 text-sm">Images are loaded from Next.js public folder.</p>
                    </div>
                    <Link href="/admin/products/create">
                        <button className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">
                            <Plus size={20} /> Add New Product
                        </button>
                    </Link>
                </div>

                {/* FILTERS & SEARCH */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-navy-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                        />
                    </div>
                </div>

                {/* TABLE LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={32}/>
                            <p>Loading products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-6">Product</th>
                                        <th className="p-6">Category</th>
                                        <th className="p-6">Price</th>
                                        <th className="p-6 text-center">Promo</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200 shrink-0">
                                                        <Image 
                                                            src={getImageUrl(product.image)} 
                                                            alt={product.name} 
                                                            fill 
                                                            className="object-cover"
                                                            unoptimized // Penting agar Next.js tidak pusing mencari loader
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-navy-900">{product.name}</h3>
                                                        <span className="text-xs text-gray-400">ID: #{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                                    {product.category_name}
                                                </span>
                                            </td>
                                            <td className="p-6 font-mono font-medium text-navy-900">
                                                Rp {parseFloat(product.price).toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-6 text-center">
                                                {product.is_promo === 1 ? (
                                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold border border-yellow-200 inline-flex items-center gap-1">
                                                        <Sparkles size={10} /> YES
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                            <Edit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-gray-400">
                            <p>No products found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
