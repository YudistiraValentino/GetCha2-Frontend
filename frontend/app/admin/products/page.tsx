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
    Filter, 
    MoreHorizontal, 
    Sparkles 
} from "lucide-react";
import NavbarDashboard from '@/app/components/layout/NavbarDashboard'; // Optional jika admin punya layout sendiri

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
        try {
            const res = await fetch(`${BACKEND_URL}/api/menu`); // Gunakan endpoint menu public atau admin
            const json = await res.json();
            if (json.success) setProducts(json.data);
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
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            // Pastikan kamu punya endpoint DELETE di backend (biasanya /api/admin/products/{id})
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (res.ok) {
                alert("Product deleted successfully.");
                fetchProducts(); // Refresh list
            } else {
                const data = await res.json();
                alert("Failed to delete: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting product.");
        }
    };

    // 3. HELPER URL GAMBAR
    const getImageUrl = (path: string) => {
        if (!path) return "/Image/placeholder.png";
        if (path.startsWith("http")) return path;
        let cleanPath = path.replace('public/', '');
        if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
        if (!cleanPath.startsWith('/storage') && !cleanPath.startsWith('/images')) {
            cleanPath = '/storage' + cleanPath;
        }
        return `${BACKEND_URL}${cleanPath}`;
    };

    // 4. FILTERING LOGIC
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category_name)))];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Optional Navbar Admin */}
            {/* <AdminNavbar /> */}
            
            <div className="container mx-auto px-6 py-10 max-w-7xl">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Products</h1>
                        <p className="text-gray-500 text-sm">Manage your cafe menu items here.</p>
                    </div>
                    <Link href="/admin/products/create">
                        <button className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg">
                            <Plus size={20} /> Add New Product
                        </button>
                    </Link>
                </div>

                {/* FILTERS & SEARCH */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-navy-50 text-navy-900 border border-navy-200" : "text-gray-500 hover:bg-gray-50"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-all"
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
                                        <th className="p-6">Product Info</th>
                                        <th className="p-6">Category</th>
                                        <th className="p-6">Price</th>
                                        <th className="p-6 text-center">Status</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            {/* Product Info */}
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200 shrink-0">
                                                        <Image 
                                                            src={getImageUrl(product.image)} 
                                                            alt={product.name} 
                                                            fill 
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-navy-900 text-sm md:text-base">{product.name}</h3>
                                                        <span className="text-xs text-gray-400">ID: #{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="p-6">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                                    {product.category_name}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="p-6 font-mono font-medium text-navy-900">
                                                Rp {parseFloat(product.price).toLocaleString("id-ID")}
                                            </td>

                                            {/* Status (Promo Badge) */}
                                            <td className="p-6 text-center">
                                                {product.is_promo === 1 ? (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold border border-yellow-200">
                                                        <Sparkles size={10} /> PROMO
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs font-bold">-</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                        title="Delete"
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-navy-900">No products found</h3>
                            <p className="text-sm">Try adjusting your search or filter to find what you're looking for.</p>
                            <button onClick={() => {setSearchQuery(""); setSelectedCategory("All")}} className="mt-4 text-blue-600 font-bold hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}