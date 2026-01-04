"use client";

import React, { useState, useRef, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { Upload, Save, AlertCircle, CheckCircle, Info, FileUp, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";

// ✅ CONFIG
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminMapManager() {
  const router = useRouter();
  
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedSeats, setDetectedSeats] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin/login');
  }, [router]);

  const processFile = (file: File) => {
    setErrorMsg(null);
    setDetectedSeats([]);
    setSelectedFile(null);

    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "image/svg+xml");
        const seats = doc.querySelectorAll('[id^="Seat-"]');

        if (seats.length === 0) {
          setErrorMsg("Warning: Tidak ada kursi terdeteksi (ID harus 'Seat-XX')");
        } else {
          setDetectedSeats(Array.from(seats).map(s => s.id));
          setSelectedFile(file);
        }
        setSvgContent(content);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg("Format salah. Harap upload file .svg");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if(e.target.files?.[0]) processFile(e.target.files[0]); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };

  // 🔥 LOGIC UPLOAD (SUPER STRICT URL TOKEN)
  const handleSave = async () => {
    if (!selectedFile) return alert("Pilih file dulu!");
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Sesi habis. Login ulang.");
        router.push('/admin/login');
        return;
    }

    const formData = new FormData();
    formData.append("name", "Store Layout " + new Date().toLocaleDateString()); 
    formData.append("image", selectedFile);
    formData.append("is_active", "1");

    try {
        // 🔥 KITA RAKIT URL MANUAL STRING (Bukan Object URL)
        // Ini memastikan formatnya: .../maps?token=eyJh...
        const urlTarget = `${BACKEND_URL}/api/admin/maps?token=${encodeURIComponent(token)}`;

        console.log("🚀 Uploading to:", urlTarget);

        const res = await fetch(urlTarget, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                // Header Authorization DIHAPUS TOTAL. Kita andalkan URL.
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Map Berhasil Diupload!");
            window.location.reload();
        } else {
            console.error("Server Response:", data);
            
            // Tampilkan pesan detail dari debug info backend
            const detail = data.debug_info ? JSON.stringify(data.debug_info) : "";
            alert(`Gagal: ${data.message}\nDebug: ${detail}`);
            
            if(res.status === 401) router.push('/admin/login');
        }
    } catch (error) {
        alert("Gagal koneksi ke server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />
      <div className="container mx-auto px-6 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Map Manager</h1>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-navy-900 text-navy-900 font-bold rounded-xl flex gap-2">
            <Upload size={20} /> Upload SVG
          </button>
          <input type="file" ref={fileInputRef} accept=".svg" onChange={handleFileInput} className="hidden" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 rounded-2xl border-2 min-h-[500px] flex flex-col relative transition-all ${isDragging ? "border-blue-500 bg-blue-50 border-dashed" : "border-gray-200 bg-white"}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
             <div className="p-4 border-b flex justify-between"><span className="font-bold text-gray-500">PREVIEW AREA</span>{detectedSeats.length > 0 && <span className="text-green-600 font-bold flex gap-1"><CheckCircle/> {detectedSeats.length} Seats</span>}</div>
             <div className="flex-1 flex items-center justify-center p-4">
                {svgContent ? <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} /> : <div className="text-gray-400 text-center"><FileUp size={48} className="mx-auto mb-2"/> Drag & Drop Here</div>}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border h-fit">
            <h3 className="font-bold text-navy-900 mb-4 flex gap-2"><Info/> Status</h3>
            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
            
            <button 
                onClick={handleSave} 
                disabled={loading || !selectedFile} 
                className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-navy-900 disabled:bg-gray-300 transition flex justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin"/> : <Save/>} Publish Map
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}