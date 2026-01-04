"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminPromoEdit() {
  const router = useRouter();
  const { id } = useParams();
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const [previewImage, setPreviewImage] = useState("");

  // Fetch Data (GET masih pakai header karena GET biasanya aman)
  useEffect(() => {
      const fetchPromo = async () => {
          const token = localStorage.getItem('token');
          if (!token) { router.push('/admin/login'); return; }

          try {
              const res = await fetch(`${BACKEND_URL}/api/admin/promos/${id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              const json = await res.json();
              if(json.success) {
                  const d = json.data;
                  setTitle(d.title); setCode(d.code); setType(d.type);
                  setDiscountAmount(d.discount_amount); setStartDate(d.start_date);
                  setEndDate(d.end_date); setDescription(d.description || "");
                  setIsActive(d.is_active === 1);
                  if(d.image) setPreviewImage(d.image.startsWith('http') ? d.image : `${BACKEND_URL}${d.image}`);
              }
          } catch(e) { console.error(e); } finally { setLoadingData(false); }
      }
      if(id) fetchPromo();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("title", title);
    formData.append("code", code.toUpperCase());
    formData.append("type", type);
    formData.append("discount_amount", discountAmount);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("description", description);
    formData.append("is_active", isActive ? "1" : "0");
    if(image) formData.append("image", image);

    try {
        // 🔥 TOKEN DI URL (Nuclear Option)
        const res = await fetch(`${BACKEND_URL}/api/admin/promos/${id}?token=${token}`, {
            method: "POST", // FormData + _method:PUT
            headers: { 'Accept': 'application/json' }, // Header Auth dihapus
            body: formData
        });
        const json = await res.json();
        if (json.success) {
            alert("Promo updated!");
            router.push("/admin/promos");
        } else {
            alert("Gagal: " + (json.message || "Error"));
        }
    } catch (error) {
        alert("Server error");
    } finally {
        setSubmitting(false);
    }
  };

  if(loadingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-32 px-6">
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/promos" className="p-2 bg-white rounded-full shadow hover:bg-gray-100"><ArrowLeft size={20}/></Link>
                <h1 className="text-2xl font-bold text-navy-900">Edit Promo</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow border border-gray-100 space-y-6">
                {/* Form fields sama seperti Create */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Title</label><input required className="w-full border rounded-lg p-2.5" value={title} onChange={e=>setTitle(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold mb-1">Code</label><input required className="w-full border rounded-lg p-2.5 uppercase" value={code} onChange={e=>setCode(e.target.value)} /></div>
                </div>
                {/* ... (Sisa form fields sama persis) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Type</label><select className="w-full border rounded-lg p-2.5 bg-white" value={type} onChange={e=>setType(e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
                    <div><label className="block text-sm font-bold mb-1">Value</label><input required type="number" className="w-full border rounded-lg p-2.5" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-1">Start</label><input required type="date" className="w-full border rounded-lg p-2.5" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold mb-1">End</label><input required type="date" className="w-full border rounded-lg p-2.5" value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
                </div>
                <div><label className="block text-sm font-bold mb-1">Desc</label><textarea className="w-full border rounded-lg p-2.5" rows={3} value={description} onChange={e=>setDescription(e.target.value)}></textarea></div>
                
                <div>
                    <label className="block text-sm font-bold mb-1">Image</label>
                    <input type="file" accept="image/*" className="w-full text-sm" onChange={e => setImage(e.target.files?.[0] || null)} />
                    {previewImage && !image && <div className="mt-2"><img src={previewImage} className="h-20 rounded border"/></div>}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="active" className="w-5 h-5 rounded" checked={isActive} onChange={e => setIsActive(e.target.checked)}/>
                    <label htmlFor="active" className="text-sm font-bold text-gray-700">Set as Active</label>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-gold-500 transition flex justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Update Promo</>}
                </button>
            </form>
        </div>
    </div>
  );
}