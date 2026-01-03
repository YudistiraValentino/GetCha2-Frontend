"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  AtSign
} from "lucide-react"; 

export default function SignupPage() {
  const router = useRouter();

  // 1. State Data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi Password Match
    if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    try {
        const res = await fetch("https://getcha2-backend-production.up.railway.app/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Registration failed");

        // Auto Login (Simpan Token)
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/dashboard");

    } catch (err: any) {
        setError(err.message || "Registration Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950 px-4 py-10 relative overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* --- TOMBOL KEMBALI --- */}
      <div className="absolute top-8 left-6 md:left-12 z-20">
        <Link href="/" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-bold tracking-wide opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">Back to Home</span>
        </Link>
      </div>

      {/* --- KARTU REGISTER --- */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative z-10 p-8 md:p-10 animate-in fade-in zoom-in duration-500 my-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-[160px] h-12 relative mx-auto mb-4">
               <Image src="/Image/Logo.png" alt="GetCha Logo" fill className="object-contain" priority/>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Create Account</h2>
            <p className="text-gray-400 text-sm mt-2">Join us and enjoy coffee without the queue.</p>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
        )}

        <form className="space-y-4" onSubmit={handleSignup}>
            
            {/* 1. Full Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                        <User size={20} />
                    </div>
                    <input 
                        required name="name" type="text" onChange={handleChange} 
                        placeholder="Enter your full name" 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* 2. Email */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                        <Mail size={20} />
                    </div>
                    <input 
                        required name="email" type="email" onChange={handleChange} 
                        placeholder="Enter your email address" 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* 3. Username */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                        <AtSign size={20} />
                    </div>
                    <input 
                        required name="username" type="text" onChange={handleChange} 
                        placeholder="Create a username" 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* 4. Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input 
                            required name="password" type="password" onChange={handleChange} 
                            placeholder="Enter password" 
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Confirm</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                            <CheckCircle2 size={20} />
                        </div>
                        <input 
                            required name="password_confirmation" type="password" onChange={handleChange} 
                            placeholder="Repeat password" 
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-navy-900 text-white font-bold py-4 rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all duration-300 shadow-lg shadow-navy-900/20 active:scale-[0.98] mt-6 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} /> 
                ) : (
                    <>
                        CREATE ACCOUNT
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-navy-900 font-bold hover:text-gold-500 transition-colors underline decoration-2 underline-offset-4 decoration-gold-200 hover:decoration-gold-500">
                    Login here
                </Link>
            </p>
        </div>

      </div>
    </div>
  );
}