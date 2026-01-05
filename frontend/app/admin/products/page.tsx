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
            const res = await fetch(`${BACKEND_URL}/api/menu`); 
            const json = await res.json();
            
            if (json.success) {
                const cleanData = json.data.map((item: any) => ({
                    ...item,
                    category_name: item.category ? item.category.name : (item.category_name || "Uncategorized")
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
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (res.ok) {
                alert("Product deleted successfully.");
                fetchProducts(); 
            } else {
                const data = await res.json();
                alert("Failed to delete: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting product.");
        }
    };

    // 3. HELPER URL GAMBAR (SINKRON DENGAN DASHBOARD & MENU)
    const getImageUrl = (p: Product) => {
        const id = p.id || 0;
        const name = (p.name || "").toLowerCase();
        const cat = (p.category_name || "").toLowerCase();

        const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
        const nonCoffeeImages = ["https://images.unsplash.com/photo-1556679343-c7306c1976bc","https://images.unsplash.com/photo-1597318181409-cf44d0582db8","https://images.unsplash.com/photo-1576092729250-19c137184b8c","https://images.unsplash.com/photo-1544787210-2213d84ad960","https://images.unsplash.com/photo-1536935338212-3b6abf17ac42","https://images.unsplash.com/photo-1623065422902-30a2ad299dd4","https://images.unsplash.com/photo-1585225442642-c41236125451","https://images.unsplash.com/photo-1556881286-fc6915169721","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd","https://images.unsplash.com/photo-1556710807-a9261973328e"];
        const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
        const snackImages = ["https://images.unsplash.com/photo-1551024601-bec78aea704b","https://images.unsplash.com/photo-1495147466023-ac5c588e2e94","https://images.unsplash.com/photo-1558961363-fa8fdf82db35","https://images.unsplash.com/photo-1509365465985-25d11c17e812","https://images.unsplash.com/photo-1530610476181-d83430b64dcd","https://images.unsplash.com/photo-1573821663912-569905445661","https://images.unsplash.com/photo-1582298538104-fe2e74c27f59","https://images.unsplash.com/photo-1559339352-11d035aa65de","https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2","https://images.unsplash.com/photo-1519915028121-7d3463d20b13"];

        let coll = foodImages;
        if (cat.includes("non coffee") || name.includes("tea")) coll = nonCoffeeImages;
        else if (cat.includes("coffee") || name.includes("kopi")) coll = coffeeImages;
        else if (cat.includes("snack") || cat.includes("dessert")) coll = snackImages;

        return `${coll[id % 10]}?w=500&h=500&fit=crop`;
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
            <div className="container mx-auto px-6 py-10 max-w-7xl">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Products Inventory</h1>
                        <p className="text-gray-500 text-sm">Manage and sync your cafe menu items.</p>
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
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-navy-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
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
                            <p>Syncing products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-6">Product Info</th>
                                        <th className="p-6">Category</th>
                                        <th className="p-6">Price</th>
                                        <th className="p-6 text-center">Promo</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200 shrink-0">
                                                        <Image 
                                                            src={getImageUrl(product)} 
                                                            alt={product.name} 
                                                            fill 
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-navy-900 text-sm md:text-base">{product.name}</h3>
                                                        <span className="text-xs text-gray-400">ID: #{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase">
                                                    {product.category_name}
                                                </span>
                                            </td>
                                            <td className="p-6 font-mono font-medium text-navy-900">
                                                Rp {parseFloat(product.price || "0").toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-6 text-center">
                                                {product.is_promo === 1 ? (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold border border-yellow-200">
                                                        <Sparkles size={10} /> PROMO
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* ✅ FIX: Link diarahkan ke [id]/page.tsx kamu */}
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
                            <h3 className="text-lg font-bold text-navy-900">No products found</h3>
                            <button onClick={() => {setSearchQuery(""); setSelectedCategory("All")}} className="mt-4 text-blue-600 font-bold hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
