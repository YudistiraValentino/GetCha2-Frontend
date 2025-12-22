"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import Image from "next/image";

// Konfigurasi URL
// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. FETCH DATA
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/products`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error("Gagal fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. DELETE FUNCTION
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        alert("Produk berhasil dihapus!");
        fetchProducts(); // Refresh data
      } else {
        alert("Gagal menghapus produk.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Helper Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  // Filter Search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-navy-900" /></div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Product Management</h1>
            <p className="text-gray-500 text-sm">Manage menu items, prices, and stocks.</p>
        </div>
        <Link href="/admin/products/create" className="bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
            <Plus size={20} /> Add New Product
        </Link>
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search product name..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-navy-900 transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative bg-white">
                                    <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-contain p-1" unoptimized />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-navy-900">{product.name}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                    {product.category?.name || 'Uncategorized'}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium">Rp {parseInt(product.price).toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                                {product.is_promo === 1 ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold border border-green-200">PROMO</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                    <Link href={`/admin/products/${product.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-gray-400">No products found.</div>
            )}
        </div>
      </div>
    </div>
  );
}