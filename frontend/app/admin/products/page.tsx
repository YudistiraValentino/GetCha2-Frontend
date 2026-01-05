"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

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

    // ✅ LOGIKA 4 KATEGORI X 10 VARIAN (UNSPLASH)
    const getImageUrl = (p: any) => {
        const id = p?.id || 0;
        const name = (p?.name || "").toLowerCase();
        const cat = (p?.category?.name || p?.category_name || "").toLowerCase();

        const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
        const nonCoffeeImages = ["https://images.unsplash.com/photo-1556679343-c7306c1976bc","https://images.unsplash.com/photo-1597318181409-cf44d0582db8","https://images.unsplash.com/photo-1576092729250-19c137184b8c","https://images.unsplash.com/photo-1544787210-2213d84ad960","https://images.unsplash.com/photo-1536935338212-3b6abf17ac42","https://images.unsplash.com/photo-1623065422902-30a2ad299dd4","https://images.unsplash.com/photo-1585225442642-c41236125451","https://images.unsplash.com/photo-1556881286-fc6915169721","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd","https://images.unsplash.com/photo-1556710807-a9261973328e"];
        const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
        const snackImages = ["https://images.unsplash.com/photo-1551024601-bec78aea704b","https://images.unsplash.com/photo-1495147466023-ac5c588e2e94","https://images.unsplash.com/photo-1558961363-fa8fdf82db35","https://images.unsplash.com/photo-1509365465985-25d11c17e812","https://images.unsplash.com/photo-1530610476181-d83430b64dcd","https://images.unsplash.com/photo-1573821663912-569905445661","https://images.unsplash.com/photo-1582298538104-fe2e74c27f59","https://images.unsplash.com/photo-1559339352-11d035aa65de","https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2","https://images.unsplash.com/photo-1519915028121-7d3463d20b13"];

        let coll = foodImages;
        if (cat.includes("non coffee") || name.includes("tea") || name.includes("matcha")) coll = nonCoffeeImages;
        else if (cat.includes("coffee") || name.includes("kopi") || name.includes("latte") || p.category_id == 1) coll = coffeeImages;
        else if (cat.includes("snack") || cat.includes("dessert") || name.includes("cake") || p.category_id == 4) coll = snackImages;

        return `${coll[id % 10]}?w=400&h=400&fit=crop`;
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
                    <button className="bg-navy-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold-500 transition-all shadow-lg flex items-center gap-2 text-sm md:text-base">
                        <Plus size={20} /> Add Product
                    </button>
                </Link>
            </div>

            {/* SEARCH BAR */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-navy-900 bg-white shadow-sm transition-all"
                />
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
                                    <tr key={p.id} className="hover:bg-gray-50 transition-all group">
                                        <td className="p-6 flex items-center gap-4">
                                            <div className="w-16 h-16 relative bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 group-hover:shadow-md transition-shadow">
                                                <Image 
                                                    src={getImageUrl(p)} 
                                                    alt={p.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    unoptimized 
                                                />
                                            </div>
                                            <div>
                                                <span className="font-bold text-navy-900 block group-hover:text-gold-600 transition-colors">{p.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category?.name || p.category_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-navy-900">
                                            Rp {parseFloat(p.price || "0").toLocaleString("id-ID")}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/products/${p.id}/edit`}>
                                                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                                                        <Edit size={20}/>
                                                    </button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="p-20 text-center text-gray-400 italic">Produk tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
