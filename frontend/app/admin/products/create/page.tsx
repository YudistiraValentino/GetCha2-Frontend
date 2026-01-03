"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash, X, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

// ✅ CONFIG
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

// Interface untuk Tipe Data
interface Option {
  id: string; // ID sementara untuk key React
  label: string;
  price: string;
  isDefault: boolean;
}

interface Modifier {
  id: string; // ID sementara
  name: string;
  required: boolean;
  options: Option[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Utama
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPromo, setIsPromo] = useState(false);

  // State Variants (Size)
  const [variants, setVariants] = useState([{ name: "", price: "" }]);

  // State Modifiers (Groups: Sugar, Ice, etc)
  const [modifiers, setModifiers] = useState<Modifier[]>([]);

  // --- LOGIC VARIANTS ---
  const handleAddVariant = () => setVariants([...variants, { name: "", price: "" }]);
  const handleRemoveVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // --- LOGIC MODIFIERS (The Missing Part) ---
  const addModifierGroup = () => {
    const newGroup: Modifier = {
      id: Date.now().toString(),
      name: "",
      required: false,
      options: [
        { id: Date.now() + "1", label: "", price: "", isDefault: false },
        { id: Date.now() + "2", label: "", price: "", isDefault: false }
      ]
    };
    setModifiers([...modifiers, newGroup]);
  };

  const removeModifierGroup = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  const updateModifierGroup = (index: number, field: keyof Modifier, value: any) => {
    const newMods = [...modifiers];
    // @ts-ignore
    newMods[index][field] = value;
    setModifiers(newMods);
  };

  const addOptionToGroup = (groupIndex: number) => {
    const newMods = [...modifiers];
    newMods[groupIndex].options.push({
      id: Date.now().toString(),
      label: "",
      price: "",
      isDefault: false
    });
    setModifiers(newMods);
  };

  const removeOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    const newMods = [...modifiers];
    newMods[groupIndex].options = newMods[groupIndex].options.filter((_, i) => i !== optionIndex);
    setModifiers(newMods);
  };

  const updateOption = (groupIndex: number, optionIndex: number, field: keyof Option, value: any) => {
    const newMods = [...modifiers];
    // @ts-ignore
    newMods[groupIndex].options[optionIndex][field] = value;
    setModifiers(newMods);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    if (image) formData.append("image", image);
    formData.append("is_promo", isPromo ? "1" : "0");

    // 1. Serialize Variants
    // Filter varian kosong biar gak error
    const validVariants = variants.filter(v => v.name.trim() !== "");
    formData.append("variants", JSON.stringify(validVariants));

    // 2. Serialize Modifiers
    // Bersihkan data sebelum kirim (hapus ID sementara)
    const validModifiers = modifiers.map(mod => ({
        name: mod.name,
        required: mod.required,
        options: mod.options.filter(opt => opt.label.trim() !== "").map(opt => ({
            label: opt.label,
            price: opt.price || 0,
            isDefault: opt.isDefault
        }))
    })).filter(mod => mod.name.trim() !== "");
    
    formData.append("modifiers", JSON.stringify(validModifiers));

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
            method: "POST",
            body: formData, // Browser otomatis set Content-Type multipart/form-data
        });

        const data = await res.json();

        if (res.ok) {
            alert("Produk berhasil dibuat!");
            router.push("/admin/products");
        } else {
            console.error(data);
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
    <div className="max-w-5xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-navy-900"/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Create New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. MAIN INFO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-800 text-lg border-b pb-4">📦 Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                        <input type="text" required placeholder="e.g. Hazelnut Latte" className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-navy-900 transition-all" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Base Price (Rp)</label>
                        <input type="number" required placeholder="25000" className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-navy-900 transition-all" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-navy-900 bg-white" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                            {/* Nanti ini fetch dari API */}
                            <option value="1">Coffee</option>
                            <option value="2">Non-Coffee</option>
                            <option value="3">Food</option>
                            <option value="4">Dessert</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                        <input type="file" required accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100" onChange={e => setImage(e.target.files?.[0] || null)} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea rows={3} placeholder="Describe the taste..." className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-navy-900" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                </div>

                <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <input type="checkbox" id="promo" className="w-5 h-5 text-navy-900 rounded focus:ring-0 cursor-pointer" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} />
                    <label htmlFor="promo" className="text-sm font-bold text-gray-700 cursor-pointer">Set as Promo / Best Seller?</label>
                </div>
            </div>

            {/* 2. VARIANTS (SIZE) */}
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2">📏 Size Variants</h3>
                        <p className="text-sm text-blue-600 mt-1">Add sizes like Regular, Large. Leave empty if no size.</p>
                    </div>
                    <button type="button" onClick={handleAddVariant} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-100 transition flex items-center gap-2"><Plus size={16}/> Add Size</button>
                </div>
                
                <div className="space-y-3">
                    {variants.map((v, idx) => (
                        <div key={idx} className="flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
                            <input type="text" placeholder="Size Name (e.g. Large)" className="flex-1 border-none shadow-sm rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-300" value={v.name} onChange={e => handleVariantChange(idx, 'name', e.target.value)} />
                            <input type="number" placeholder="Price (Rp)" className="w-32 md:w-48 border-none shadow-sm rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-300" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} />
                            <button type="button" onClick={() => handleRemoveVariant(idx)} className="bg-white p-3 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition shadow-sm"><Trash size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. MODIFIERS (CUSTOMIZATION) - INI YANG BARU */}
            <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">✨ Customization Groups</h3>
                        <p className="text-sm text-purple-600 mt-1">Add groups like "Sugar Level", "Toppings", "Ice Level".</p>
                    </div>
                    <button type="button" onClick={addModifierGroup} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-purple-700 transition flex items-center gap-2"><Plus size={16}/> Add Group</button>
                </div>

                <div className="space-y-6">
                    {modifiers.map((mod, gIdx) => (
                        <div key={mod.id} className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 relative group animate-in zoom-in-95 duration-200">
                            <button type="button" onClick={() => removeModifierGroup(gIdx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"><X size={20}/></button>
                            
                            {/* Group Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Group Name</label>
                                    <input type="text" placeholder="e.g. Sugar Level" className="w-full font-bold text-gray-700 border-b-2 border-purple-100 focus:border-purple-500 outline-none pb-1 transition-colors" value={mod.name} onChange={e => updateModifierGroup(gIdx, 'name', e.target.value)} />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-0" checked={mod.required} onChange={e => updateModifierGroup(gIdx, 'required', e.target.checked)} />
                                        <span className="text-sm font-medium text-gray-600">Is Required? (Wajib Pilih)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                                {mod.options.map((opt, oIdx) => (
                                    <div key={opt.id} className="flex gap-3 items-center">
                                        <input type="text" placeholder="Option Label (e.g. Less Sugar)" className="flex-1 text-sm border rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-purple-400 outline-none" value={opt.label} onChange={e => updateOption(gIdx, oIdx, 'label', e.target.value)} />
                                        <input type="number" placeholder="+Rp (0 if free)" className="w-24 md:w-32 text-sm border rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-purple-400 outline-none" value={opt.price} onChange={e => updateOption(gIdx, oIdx, 'price', e.target.value)} />
                                        
                                        {/* Default Checkbox */}
                                        <button type="button" onClick={() => updateOption(gIdx, oIdx, 'isDefault', !opt.isDefault)} className={`p-1.5 rounded-md transition ${opt.isDefault ? 'text-purple-600 bg-purple-50' : 'text-gray-300 hover:text-gray-500'}`} title="Set as Default">
                                            {opt.isDefault ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>

                                        <button type="button" onClick={() => removeOptionFromGroup(gIdx, oIdx)} className="text-gray-300 hover:text-red-500 p-1"><X size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOptionToGroup(gIdx)} className="mt-2 text-xs font-bold text-purple-500 hover:text-purple-700 flex items-center gap-1"><Plus size={12}/> Add Option</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="sticky bottom-6 z-10">
                <button type="submit" disabled={loading} className="w-full py-4 bg-navy-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex justify-center items-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed transform active:scale-[0.99]">
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Product</>}
                </button>
            </div>
        </form>
    </div>
  );
}