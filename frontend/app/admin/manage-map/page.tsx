"use client";

import React, { useState, useRef, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { Upload, Save, AlertCircle, CheckCircle, Info, FileUp, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";

// ✅ CONFIG: Pastikan URL Backend Benar
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminMapManager() {
  const router = useRouter();
  
  // State Data
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State menyimpan file asli
  const [detectedSeats, setDetectedSeats] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State UI
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. CEK TOKEN SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Kalau gak ada token, tendang ke login
        router.push('/admin/login');
    }
  }, [router]);

  // --- LOGIC PEMROSESAN FILE SVG ---
  const processFile = (file: File) => {
    setErrorMsg(null);
    setDetectedSeats([]);
    setSelectedFile(null); // Reset file lama

    // Validasi tipe file harus SVG
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Parsing SVG Text menjadi DOM Element untuk validasi kursi
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "image/svg+xml");
        
        // Cari elemen dengan ID "Seat-"
        const seats = doc.querySelectorAll('[id^="Seat-"]');

        if (seats.length === 0) {
          setErrorMsg("Warning: Tidak ada kursi terdeteksi! Pastikan ID layer di SVG diawali dengan 'Seat-XX'.");
        } else {
          const seatIds = Array.from(seats).map(seat => seat.id);
          setDetectedSeats(seatIds);
          
          // ✅ PENTING: Simpan file asli ke state untuk diupload nanti
          setSelectedFile(file);
        }

        // Simpan konten string untuk preview di layar
        setSvgContent(content);
      };
      
      reader.readAsText(file);
    } else {
      setErrorMsg("Format salah. Harap upload file .svg");
    }
  };

  // --- HANDLERS DRAG & DROP ---
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // --- 🔥 LOGIC UPLOAD KE BACKEND (FIXED) ---
  const handleSave = async () => {
    // 1. Validasi File
    if (!selectedFile) {
        alert("Belum ada file map yang dipilih!");
        return;
    }
    
    setLoading(true);

    // 2. Ambil Token Terbaru
    const token = localStorage.getItem('token');
    
    // Debugging Token di Console
    console.log("Mencoba upload dengan token:", token);

    if (!token) {
        alert("Error: Token tidak ditemukan. Harap login ulang.");
        router.push('/admin/login');
        setLoading(false);
        return;
    }

    // 3. Siapkan FormData
    const formData = new FormData();
    formData.append("name", "Store Layout " + new Date().toLocaleDateString()); 
    formData.append("image", selectedFile); // ✅ Kirim File Fisik
    formData.append("is_active", "1"); // Langsung aktifkan

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/maps`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',        // Minta balikan JSON
                'Authorization': `Bearer ${token}`   // ✅ WAJIB: Kartu akses admin
                // ❌ JANGAN SET 'Content-Type': 'multipart/form-data' SECARA MANUAL!
                // Biarkan browser yang mengaturnya otomatis saat ada FormData.
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert(`✅ BERHASIL! Map baru sudah aktif.`);
            window.location.reload(); // Refresh halaman biar bersih
        } else {
            console.error("Server Error:", data);
            
            // Handle Token Basi (401)
            if (res.status === 401) {
                alert("❌ Sesi Login Habis (401). Silakan Login Ulang.");
                localStorage.removeItem('token'); 
                router.push('/admin/login');
            } else {
                alert("❌ Gagal Upload: " + (data.message || "Terjadi kesalahan di server."));
            }
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("❌ Gagal terhubung ke server. Cek koneksi internet.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />
      
      <div className="container mx-auto px-6 pt-32">
        
        {/* HEADER & BUTTON UPLOAD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy-900">Store Layout Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Manage floor plans. Supports Click or Drag & Drop.</p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white border-2 border-navy-900 text-navy-900 font-bold rounded-xl hover:bg-navy-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload size={20} /> Upload New SVG
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".svg" 
            onChange={handleFileInput} 
            className="hidden" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: DROP ZONE & PREVIEW AREA */}
          <div 
            className={`lg:col-span-2 rounded-2xl shadow-md border-2 overflow-hidden flex flex-col min-h-[500px] transition-all duration-300 relative ${
              isDragging 
                ? "bg-blue-50 border-blue-500 border-dashed scale-[1.01]" 
                : "bg-white border-gray-100 border-solid"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* Header Box */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="font-bold text-gray-600 text-sm">LIVE PREVIEW AREA</span>
              {detectedSeats.length > 0 && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Valid Layout
                </span>
              )}
            </div>
            
            {/* Konten Preview */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Overlay saat Dragging */}
            {isDragging && (
              <div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center 
                bg-blue-50/90 backdrop-blur-sm pointer-events-none transition-opacity duration-150"
              >
                <FileUp size={64} className="text-blue-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-blue-600">Drop SVG File Here</h3>
              </div>
            )}

              {svgContent ? (
                // Tampilkan Peta
                <div 
                  className="w-full h-full max-h-[600px] [&_svg]:w-full [&_svg]:h-full drop-shadow-xl pointer-events-none" 
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                />
              ) : (
                // Placeholder Kosong
                <div className="text-center text-gray-400">
                  <Upload size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No map loaded.</p>
                  <p className="text-sm mt-1">Click the button above or <span className="text-navy-900 font-bold">Drag & Drop</span> file here.</p>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: STATUS & ACTION */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Info size={18} className="text-gold-500" /> Diagnostics
            </h3>

            {/* Pesan Error */}
            {errorMsg && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700 text-sm items-start">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Hasil Deteksi */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Detected Seats</span>
                <span className="font-bold text-navy-900 text-lg">{detectedSeats.length}</span>
              </div>
              
              {detectedSeats.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50 text-xs text-gray-600">
                  <p className="mb-2 font-bold text-gray-400 sticky top-0 bg-gray-50">ID List:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {detectedSeats.map(id => (
                      <span key={id} className="bg-white border px-2 py-1 rounded text-center truncate" title={id}>
                        {id.replace('Seat-', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Publish */}
            <button 
              onClick={handleSave}
              disabled={detectedSeats.length === 0 || loading}
              className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center gap-2 items-center"
            >
              {loading ? (
                  <><Loader2 className="animate-spin" /> Uploading...</>
              ) : (
                  <><Save size={20} /> Publish Layout</>
              )}
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Publishing will update the Customer Booking page immediately.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}