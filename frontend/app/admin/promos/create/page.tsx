"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CreatePromoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("code", code.toUpperCase());
    formData.append("type", type);
    formData.append("discount_amount", discountAmount);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("description", description);
    formData.append("is_active", isActive ? "true" : "false");
    if(image) formData.append("image", image);

    try {
        const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/admin/promos`, {
            method: "POST",
            body: formData
        });
        const json = await res.json();
        if (json.success) {
            alert("Promo berhasil dibuat!");
            router.push("/admin/promos");
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (error) {
        console.error(error);
        alert("Server error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/promos" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"><ArrowLeft size={20}/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Create New Promo</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Promo Title</label>
                    <input type="text" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Flash Sale 12.12"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Voucher Code (Unique)</label>
                    <input type="text" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900 uppercase font-bold" value={code} onChange={e => setCode(e.target.value)} placeholder="SALE1212"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                    <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900 bg-white" value={type} onChange={e => setType(e.target.value)}>
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (Rp)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                    <input type="number" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} placeholder="e.g. 10 or 50000"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                    <input type="date" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                    <input type="date" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" value={endDate} onChange={e => setEndDate(e.target.value)}/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Banner Image (Optional)</label>
                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100" onChange={e => setImage(e.target.files?.[0] || null)} />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="active" className="w-5 h-5 text-navy-900 rounded" checked={isActive} onChange={e => setIsActive(e.target.checked)}/>
                <label htmlFor="active" className="text-sm font-bold text-gray-700">Set as Active</label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white font-bold py-3 rounded-xl shadow-lg transition flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Create Promo</>}
            </button>
        </form>
    </div>
  );
}