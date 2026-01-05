"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash, Info } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  // 1. FETCH DATA PRODUCT SAAT LOAD
  useEffect(() => {
    const fetchProduct = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/products/${productId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            
            if (json.success) {
                const p = json.data;
                setName(p.name);
                setPrice(p.price);
                setCategoryId(p.category_id.toString());
                setDescription(p.description || "");
                setIsPromo(p.is_promo === 1);
                
                if (p.variants && p.variants.length > 0) {
                    setVariants(p.variants.map((v: any) => ({ name: v.name, price: v.price })));
                } else {
                    setVariants([]);
                }
            } else {
                alert("Produk tidak ditemukan");
                router.push("/admin/products");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    if (productId) fetchProduct();
  }, [productId, router]);

  const handleAddVariant = () => setVariants([...variants, { name: "", price: "" }]);
  const handleRemoveVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // 2. UPDATE HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return router.push('/admin/login');

    setSubmitting(true);

    // Kita gunakan JSON biasa karena kita tidak lagi mengupload file fisik (Pakai Unsplash Logic)
    const updateData = {
        name,
        price,
        category_id: categoryId,
        description,
        is_promo: isPromo ? 1 : 0,
        variants: variants // Kirim array variants langsung
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Produk berhasil diupdate!");
            router.push("/admin/products");
        } else {
            alert("Gagal: " + (data.message || "Error updating product"));
        }
    } catch (error) {
        alert("Terjadi kesalahan sistem.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-navy-900" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-navy-900"/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Edit Product Settings</h1>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex gap-3 items-start">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-sm text-blue-700">
                <strong>Catatan Gambar:</strong> Gambar produk diatur secara otomatis berdasarkan nama dan kategori produk menggunakan 40 variasi Cloud Images. Anda tidak perlu mengupload file gambar secara manual.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                        <input type="text" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (Rp)</label>
                        <input type="number" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                        <select 
                            required 
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option value="1">Coffee</option>
                            <option value="2">Non-Coffee</option>
                            <option value="3">Food</option>
                            <option value="4">Snack</option>
                        </select>
                    </div>
                    <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="promo" className="w-4 h-4 accent-navy-900" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
                            <label htmlFor="promo" className="text-sm font-bold text-gray-700">Mark as Promo / Best Seller</label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea rows={3} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={description} onChange={e => setDescription(e.target.value)} placeholder="Explain the taste, ingredients, etc."></textarea>
                </div>
            </div>

            {/* Variants */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-800">Size / Type Variants</h3>
                    <button type="button" onClick={handleAddVariant} className="text-xs bg-navy-50 text-navy-900 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-navy-100 transition-colors"><Plus size={14}/> Add Variant</button>
                </div>
                {variants.length > 0 ? (
                    <div className="space-y-3">
                        {variants.map((v, idx) => (
                            <div key={idx} className="flex gap-3 items-center animate-in fade-in slide-in-from-top-1">
                                <input type="text" placeholder="Name (e.g. Hot / Large)" className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-navy-900" value={v.name} onChange={e => handleVariantChange(idx, 'name', e.target.value)} />
                                <input type="number" placeholder="Extra Price" className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-navy-900" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} />
                                <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-400 hover:text-red-600 transition-colors"><Trash size={18}/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 text-center py-4 italic">No variants added yet.</p>
                )}
            </div>

            <button type="submit" disabled={submitting} className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all flex justify-center items-center gap-2 disabled:bg-gray-400">
                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
        </form>
    </div>
  );
}
