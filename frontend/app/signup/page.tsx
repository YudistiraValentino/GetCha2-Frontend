"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  // 1. State Data
  const [formData, setFormData] = useState({
    name: "", // Biasanya backend butuh nama lengkap
    username: "",
    email: "",
    password: "",
    password_confirmation: "" // Best practice: konfirmasi password
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
        // 2. Panggil API Register Laravel
        const res = await fetch("https://getcha2-backend-production.up.railway.app/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Registration failed");

        // 3. Auto Login setelah register (Simpan Token)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative py-10">
      
      {/* Tombol Kembali (sama seperti kodemu) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-20">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors font-medium group">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
          <span className="text-sm font-bold">Back to Landing</span>
        </Link>
      </div>

      <div className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 mt-12 md:mt-0">
        
        {/* Header Putih */}
        <div className="bg-white p-8 pb-6 text-center flex flex-col items-center">
          <Link href="/" className="cursor-pointer mb-4">
            <div className="w-[180px] h-[60px] relative shrink-0">
              <Image src="/Image/Logo.png" alt="GetCha Logo" fill className="object-contain" priority sizes="200px"/>
            </div>
          </Link>
          <h2 className="text-3xl font-serif font-bold text-navy-900 tracking-wider">Create Account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join us and skip the waiting line</p>
        </div>

        {/* Form Navy */}
        <div className="p-8 pt-8 bg-navy-900">
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* Full Name */}
            <div>
              <label className="block text-white font-bold mb-1 text-sm">Full Name</label>
              <input required name="name" type="text" onChange={handleChange} placeholder="Username" className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-gold-500 bg-white text-navy-900"/>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-bold mb-1 text-sm">Email</label>
              <input required name="email" type="email" onChange={handleChange} placeholder="E-mail" className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-gold-500 bg-white text-navy-900"/>
            </div>

            {/* Username */}
            <div>
              <label className="block text-white font-bold mb-1 text-sm">Username</label>
              <input required name="username" type="text" onChange={handleChange} placeholder="Choose a username" className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-gold-500 bg-white text-navy-900"/>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-bold mb-1 text-sm">Password</label>
              <input required name="password" type="password" onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-gold-500 bg-white text-navy-900"/>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white font-bold mb-1 text-sm">Confirm Password</label>
              <input required name="password_confirmation" type="password" onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-gold-500 bg-white text-navy-900"/>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gold-500 text-navy-900 font-bold py-3 rounded-lg hover:bg-gold-400 transition shadow-lg cursor-pointer transform active:scale-95 duration-200 mt-4 flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : "SIGN UP"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-300">
            Already have an account? <Link href="/login" className="text-gold-400 font-bold hover:underline hover:text-white transition-colors">Login</Link>
          </div>
        </div>

      </div>
    </div>
  );
}