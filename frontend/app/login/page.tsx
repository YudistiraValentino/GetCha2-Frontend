"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Lock, Loader2, AlertCircle } from "lucide-react"; // Tambah icon loader & alert
import { useTransition } from "@/app/context/TransitionContext";
import { useState } from "react"; // 1. Import useState

export default function LoginPage() {
  const router = useRouter();
  const { triggerTransition } = useTransition();

  // 2. State untuk data form & loading
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 3. Panggil API Backend (Sesuaikan URL dengan Laravel kamu)
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Kirim data
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 4. Simpan Token (PENTING BIAR USER DIANGGAP SUDAH LOGIN)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 5. Pindah halaman
      triggerTransition("/dashboard"); 

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950 px-4 relative overflow-hidden">
      
      {/* Background decoration tetep sama... */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Tombol Kembali tetep sama... */}
      <div className="absolute top-8 left-6 md:left-12 z-20">
        <Link href="/" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-bold tracking-wide opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">Back to Home</span>
        </Link>
      </div>

      {/* KARTU LOGIN */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 p-8 md:p-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-[160px] h-12 relative mx-auto mb-4">
                <Image src="/Image/Logo.png" alt="GetCha Logo" fill className="object-contain" priority/>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Welcome Back!</h2>
            <p className="text-gray-400 text-sm mt-2">Please login to continue your coffee journey.</p>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Username */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Username / Email</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                        <User size={20} />
                    </div>
                    <input 
                        required 
                        type="text" 
                        placeholder="Enter your username" 
                        value={username} // Bind value
                        onChange={(e) => setUsername(e.target.value)} // Update state
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-gold-600 hover:text-navy-900 font-bold transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                        <Lock size={20} />
                    </div>
                    <input 
                        required 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} // Bind value
                        onChange={(e) => setPassword(e.target.value)} // Update state
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading} // Disable saat loading
                className="w-full bg-navy-900 text-white font-bold py-4 rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all duration-300 shadow-lg shadow-navy-900/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} /> 
                ) : (
                    <>
                        LOGIN
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
                New to GetCha?{' '}
                <Link href="/signup" className="text-navy-900 font-bold hover:text-gold-500 transition-colors underline decoration-2 underline-offset-4 decoration-gold-200 hover:decoration-gold-500">
                    Create Account
                </Link>
            </p>
        </div>

      </div>
    </div>
  );
}