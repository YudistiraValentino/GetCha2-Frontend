"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminPromoCreate() {
  const router = useRouter(); 
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/admin/login'); return; }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("code", code.toUpperCase());
    formData.append("type", type);
    formData.append("discount_amount", discountAmount);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("description", description);
    formData.append("is_active", "1");
    if (image) formData.append("image", image);
    
    // 1. SERANGAN BODY
    formData.append("token", token);

    try {
        // 2. SERANGAN URL
        const res = await fetch(`${BACKEND_URL}/api/admin/promos?token=${token}`, {
            method: "POST",
            headers: { 
                'Accept': 'application/json',
                // 3. SERANGAN HEADER
                'Authorization': `Bearer ${token}` 
            }, 
            body: formData
        });

        const json = await res.json();

        if (res.ok) {
            alert("Promo created!");
            router.push("/admin/promos");
        } else {
            console.error("Error:", json);
            alert("Gagal: " + (json.message || "Error"));
        }
    } catch (error) {
        alert("Gagal koneksi.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />
      <div className="container mx-auto px-6 pt-32">
          <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/promos" className="p-2 bg-white rounded-full shadow hover:bg-gray-100"><ArrowLeft size={20}/></Link>
                <h1 className="text-2xl font-bold text-navy-900">Create New Promo</h1>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Title</label><input required className="w-full border rounded-lg p-2.5" value={title} onChange={e=>setTitle(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold mb-1">Code</label><input required className="w-full border rounded-lg p-2.5 uppercase" value={code} onChange={e=>setCode(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Type</label><select className="w-full border rounded-lg p-2.5 bg-white" value={type} onChange={e=>setType(e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
                    <div><label className="block text-sm font-bold mb-1">Value</label><input required type="number" className="w-full border rounded-lg p-2.5" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Start</label><input required type="date" className="w-full border rounded-lg p-2.5" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold mb-1">End</label><input required type="date" className="w-full border rounded-lg p-2.5" value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
                </div>
                <div><label className="block text-sm font-bold mb-1">Desc</label><textarea className="w-full border rounded-lg p-2.5" rows={3} value={description} onChange={e=>setDescription(e.target.value)}></textarea></div>
                <div><label className="block text-sm font-bold mb-1">Image</label><input type="file" accept="image/*" className="w-full text-sm" onChange={e => setImage(e.target.files?.[0] || null)} /></div>
                
                <button type="submit" disabled={submitting} className="w-full bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-gold-500 transition flex justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Create Promo</>}
                </button>
              </form>
          </div>
      </div>
    </main>
  );
}