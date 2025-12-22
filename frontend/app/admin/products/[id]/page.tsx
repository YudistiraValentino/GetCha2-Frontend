"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation"; // 👈 useParams untuk ambil [id]
import { ArrowLeft, Save, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams(); // Ambil ID dari URL
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(""); // Untuk preview gambar lama
  const [isPromo, setIsPromo] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  // 1. FETCH DATA PRODUCT SAAT LOAD
  useEffect(() => {
    const fetchProduct = async () => {
        try {
            const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/admin/products/${productId}`);
            const json = await res.json();
            
            if (json.success) {
                const p = json.data;
                setName(p.name);
                setPrice(p.price);
                setCategoryId(p.category_id);
                setDescription(p.description || "");
                setIsPromo(p.is_promo === 1);
                setPreviewImage(`${BACKEND_URL}${p.image}`);
                
                // Set Variants (Pastikan format sesuai)
                if (p.variants && p.variants.length > 0) {
                    setVariants(p.variants.map((v: any) => ({ name: v.name, price: v.price })));
                } else {
                    setVariants([{ name: "", price: "" }]);
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

  // Variant Handlers
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
    setSubmitting(true);

    const formData = new FormData();
    formData.append("_method", "PUT"); // 👈 TRIK WAJIB DI LARAVEL (Spoofing Method PUT via POST)
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    formData.append("is_promo", isPromo ? "1" : "0");
    
    // Hanya kirim gambar jika user upload baru
    if (image) formData.append("image", image);

    formData.append("variants", JSON.stringify(variants));

    try {
        // Method tetap POST, tapi Laravel bacanya PUT karena ada _method
        const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/admin/products/${productId}`, {
            method: "POST", 
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            alert("Produk berhasil diupdate!");
            router.push("/admin/products");
        } else {
            alert("Gagal: " + (data.message || "Error updating product"));
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan sistem.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-navy-900"/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                        <input type="text" required className="w-full border rounded-lg p-2.5" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                        <input type="number" required className="w-full border rounded-lg p-2.5" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category ID</label>
                        <input type="number" required className="w-full border rounded-lg p-2.5" value={categoryId} onChange={e => setCategoryId(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Change Image (Optional)</label>
                        <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={e => setImage(e.target.files?.[0] || null)} />
                        {previewImage && !image && (
                            <div className="mt-2 text-xs text-gray-400">
                                Current: <a href={previewImage} target="_blank" className="text-blue-500 hover:underline">View Image</a>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea rows={3} className="w-full border rounded-lg p-2.5" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="promo" className="w-4 h-4" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
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
                            <input type="text" placeholder="Name" className="flex-1 border rounded-lg p-2 text-sm" value={v.name} onChange={e => handleVariantChange(idx, 'name', e.target.value)} />
                            <input type="number" placeholder="Price" className="flex-1 border rounded-lg p-2 text-sm" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} />
                            <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-400 hover:text-red-600"><Trash size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition-all flex justify-center items-center gap-2 disabled:bg-gray-400">
                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Product</>}
            </button>
        </form>
    </div>
  );
}