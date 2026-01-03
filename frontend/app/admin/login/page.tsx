"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

// ✅ CONFIG: Pastikan URL Backend Benar
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        // 🔥 PERBAIKAN PENTING: URL disesuaikan dengan web.php (/login)
        // Kita pakai /login karena route di web.php ada di root, bukan di /api/admin
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Accept": "application/json" // Wajib buat Laravel
            },
            body: JSON.stringify({ email, password })
        });

        // Cek dulu status response sebelum parsing JSON
        if (!res.ok) {
            // Kalau error 404/500, kita tangkap statusnya biar tau salahnya apa
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();

        if (json.success) {
            // ✅ SIMPAN TOKEN DARI 'json.data.token'
            localStorage.setItem("token", json.data.token);
            localStorage.setItem("user", JSON.stringify(json.data.user));
            
            // Redirect
            router.push("/admin/products"); // Langsung ke products aja biar keliatan
        } else {
            setError(json.message || "Login gagal.");
        }
    } catch (err: any) {
        console.error(err);
        // Tampilkan pesan error asli biar gampang debugging
        setError(err.message || "Gagal terhubung ke server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {/* Background Ornament */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="bg-navy-800 p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-16 h-16 bg-navy-700 rounded-2xl mx-auto flex items-center justify-center text-gold-500 shadow-inner mb-4 border border-navy-600">
                    <Coffee size={32} />
                </div>
                <h1 className="text-2xl font-serif font-bold text-white tracking-wide">GetCha Admin</h1>
                <p className="text-navy-300 text-xs uppercase tracking-widest mt-1">Portal Management System</p>
            </div>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Form */}
        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={16}/> {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition font-medium text-navy-900"
                            placeholder="admin@getcha.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition font-medium text-navy-900"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-2 group"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>Sign In to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">&copy; 2025 GetCha Coffee App. Secure Access Only.</p>
            </div>
        </div>
      </div>
    </div>
  );
}