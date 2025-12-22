"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("1"); // Default ID kategori (bisa fetch dari API kategori nanti)
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPromo, setIsPromo] = useState(false);

  // State Dynamic Variants
  const [variants, setVariants] = useState([{ name: "", price: "" }]);

  const handleAddVariant = () => setVariants([...variants, { name: "", price: "" }]);
  const handleRemoveVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Gunakan FormData untuk upload file
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    if (image) formData.append("image", image);
    formData.append("is_promo", isPromo ? "1" : "0");

    // Append Variants (Laravel butuh array object)
    // Kita kirim sebagai JSON string lalu di decode di backend, atau loop append array
    // Cara paling aman di Laravel Controller yang saya kasih tadi (parseJsonField):
    formData.append("variants", JSON.stringify(variants));

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
            method: "POST",
            body: formData, // Jangan set Content-Type header manual saat pakai FormData!
        });

        const data = await res.json();

        if (res.ok) {
            alert("Produk berhasil dibuat!");
            router.push("/admin/products");
        } else {
            alert("Gagal: " + (data.message || JSON.stringify(data)));
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan sistem.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-navy-900"/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Create New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                        <input type="text" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rp)</label>
                        <input type="number" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category ID</label>
                        {/* Nanti bisa diganti Select fetch API Category */}
                        <input type="number" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={categoryId} onChange={e => setCategoryId(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
                        <input type="file" required accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100" onChange={e => setImage(e.target.files?.[0] || null)} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea rows={3} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="promo" className="w-4 h-4 text-navy-900" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
                    <label htmlFor="promo" className="text-sm font-bold text-gray-700">Set as Promo / Best Seller?</label>
                </div>
            </div>

            {/* Variants */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-800">Size Variants</h3>
                    <button type="button" onClick={handleAddVariant} className="text-xs bg-navy-50 text-navy-900 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-navy-100"><Plus size={14}/> Add Size</button>
                </div>
                
                <div className="space-y-3">
                    {variants.map((v, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <input type="text" placeholder="Size Name (e.g. Large)" className="flex-1 border rounded-lg p-2 text-sm" value={v.name} onChange={e => handleVariantChange(idx, 'name', e.target.value)} />
                            <input type="number" placeholder="Price" className="flex-1 border rounded-lg p-2 text-sm" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} />
                            <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-400 hover:text-red-600"><Trash size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all flex justify-center items-center gap-2 disabled:bg-gray-400">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Product</>}
            </button>
        </form>
    </div>
  );
}