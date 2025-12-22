"use client";

import React, { useEffect, useState } from 'react';
import { Upload, Trash2, CheckCircle, Map as MapIcon, Loader2, Eye } from "lucide-react";
import Image from "next/image";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function MapManagerPage() {
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // 1. FETCH MAPS
  const fetchMaps = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/maps`);
        const json = await res.json();
        if (json.success) setMaps(json.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchMaps(); }, []);

  // 2. UPLOAD MAP
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!file) return alert("Pilih file SVG dulu!");

    setUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("map_file", file);

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/maps`, {
            method: "POST",
            body: formData
        });
        const json = await res.json();
        
        if (json.success) {
            alert("Upload Berhasil!");
            setName("");
            setFile(null);
            // Reset input file di HTML
            (document.getElementById('fileInput') as HTMLInputElement).value = ""; 
            fetchMaps(); // Refresh list
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (error) {
        alert("Server error");
    } finally {
        setUploading(false);
    }
  };

  // 3. ACTIVATE MAP
  const handleActivate = async (id: number) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/admin/maps/${id}/activate`, { method: "POST" });
          if(res.ok) {
              fetchMaps(); // Refresh biar status berubah
          }
      } catch (error) { console.error(error); }
  };

  // 4. DELETE MAP
  const handleDelete = async (id: number) => {
      if(!confirm("Hapus map ini? File fisik juga akan dihapus.")) return;
      try {
          await fetch(`${BACKEND_URL}/api/admin/maps/${id}`, { method: "DELETE" });
          fetchMaps();
      } catch (error) { console.error(error); }
  };

  // Helper URL
  const getMapUrl = (path: string) => {
      if(path.startsWith("http")) return path;
      return `${BACKEND_URL}${path}`;
  };

  if(loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900"/></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Map Manager</h1>
            <p className="text-gray-500 text-sm">Upload and manage floor plans (SVG only).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* KIRI: FORM UPLOAD */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-navy-900"/> Upload New Map
                </h3>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Map Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-navy-900" 
                            placeholder="e.g. Lantai 1 (VIP)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">SVG File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                            <input 
                                id="fileInput"
                                type="file" 
                                required 
                                accept=".svg"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="pointer-events-none">
                                <MapIcon className="mx-auto text-gray-400 mb-2" size={24}/>
                                <p className="text-sm text-gray-500 font-medium">
                                    {file ? file.name : "Click to select .svg file"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Max 2MB</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={uploading}
                        className="w-full bg-navy-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-gold-500 hover:text-navy-900 transition flex justify-center items-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin"/> : "Upload Map"}
                    </button>
                </form>
            </div>
        </div>

        {/* KANAN: LIST MAPS */}
        <div className="md:col-span-2 grid grid-cols-1 gap-4">
            {maps.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400">Belum ada map yang diupload.</p>
                </div>
            )}

            {maps.map((map) => (
                <div key={map.id} className={`bg-white p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-6 transition ${map.is_active ? 'border-green-500 shadow-md ring-1 ring-green-100' : 'border-gray-200 shadow-sm'}`}>
                    
                    {/* Preview Image */}
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 p-2 flex items-center justify-center relative overflow-hidden">
                        <img src={getMapUrl(map.image_path)} alt={map.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                            <h4 className="font-bold text-lg text-navy-900">{map.name}</h4>
                            {map.is_active && (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle size={12}/> ACTIVE
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center sm:justify-start">
                            <a 
                                href={getMapUrl(map.image_path)} 
                                target="_blank" 
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 flex items-center gap-2 justify-center"
                            >
                                <Eye size={16}/> Preview Full
                            </a>

                            {!map.is_active ? (
                                <>
                                    <button 
                                        onClick={() => handleActivate(map.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 justify-center"
                                    >
                                        <CheckCircle size={16}/> Activate
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(map.id)}
                                        className="px-4 py-2 bg-white border border-gray-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2 justify-center"
                                    >
                                        <Trash2 size={16}/> Delete
                                    </button>
                                </>
                            ) : (
                                <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed">
                                    Currently Active
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}