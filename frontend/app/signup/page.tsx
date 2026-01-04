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
  AtSign,
  ShieldCheck, // Icon baru untuk OTP
  KeyRound     // Icon baru untuk OTP input
} from "lucide-react"; 

// Pastikan URL Backend benar (HTTPS untuk Railway)
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function SignupPage() {
  const router = useRouter();

  // 1. STATE MANAGEMENT
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER'); // Mengatur tampilan
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State Form Register
  const [formData, setFormData] = useState({
    name: "",
    username: "", // Opsional: Backend akan auto-generate jika controller pakai versi saya
    email: "",
    password: "",
    password_confirmation: ""
  });

  // State Form OTP
  const [otpCode, setOtpCode] = useState("");

  // Handler Input Text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC 1: REGISTER (UPDATED ERROR HANDLING) ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
            // 🔥 UPDATE DISINI: Tangkap pesan detail dari Laravel
            // Laravel biasanya kirim error di object "errors"
            if (data.errors) {
                // Gabungkan semua pesan error jadi satu string
                const messages = Object.values(data.errors).flat().join(", ");
                throw new Error(messages);
            }
            // Kalau gak ada detail, pakai message umum
            throw new Error(data.message || "Registration failed");
        }

        setStep('OTP'); 

    } catch (err: any) {
        // Tampilkan error yang sudah kita tangkap tadi
        setError(err.message || "Registration Failed");
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIC 2: VERIFY OTP (Cek Kode & Login) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ 
                email: formData.email, 
                otp: otpCode 
            }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verification failed");

        // SUKSES: Simpan Token & Redirect
        if (data.success) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));
            
            // Redirect ke Dashboard/Menu
            router.push("/dashboard"); 
        } else {
            throw new Error(data.message);
        }

    } catch (err: any) {
        setError(err.message || "Invalid Code");
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

      {/* --- KARTU REGISTER / OTP --- */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative z-10 p-8 md:p-10 animate-in fade-in zoom-in duration-500 my-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-[160px] h-12 relative mx-auto mb-4">
               <Image src="/Image/Logo.png" alt="GetCha Logo" fill className="object-contain" priority/>
            </div>
            
            {/* Judul Berubah Sesuai Step */}
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">
                {step === 'REGISTER' ? 'Create Account' : 'Verification'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
                {step === 'REGISTER' 
                    ? 'Join us and enjoy coffee without the queue.' 
                    : `We've sent a code to ${formData.email}`
                }
            </p>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
        )}

        {/* === FORM STEP 1: REGISTER === */}
        {step === 'REGISTER' && (
            <form className="space-y-4" onSubmit={handleSignup}>
                
                {/* Full Name */}
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

                {/* Email */}
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

                {/* Username */}
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

                {/* Password & Confirm */}
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
        )}

        {/* === FORM STEP 2: OTP === */}
        {step === 'OTP' && (
            <form className="space-y-6 animate-in slide-in-from-right-4 duration-300" onSubmit={handleVerifyOtp}>
                
                <div className="flex justify-center my-4">
                    <div className="p-4 bg-green-50 rounded-full border border-green-100">
                        <ShieldCheck size={48} className="text-green-600" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1 text-center block">Enter 6-Digit Code</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                            <KeyRound size={20} />
                        </div>
                        <input 
                            required 
                            type="text" 
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Example: 123456" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 text-navy-900 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all font-bold text-xl tracking-[0.3em] text-center placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-normal"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-900/20 active:scale-[0.98] mt-6 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} /> 
                    ) : (
                        <>
                            VERIFY & LOGIN
                            <ShieldCheck size={20} />
                        </>
                    )}
                </button>

                <div className="text-center pt-2">
                    <button 
                        type="button" 
                        onClick={() => setStep('REGISTER')} 
                        className="text-sm text-gray-400 hover:text-navy-900 underline transition-colors"
                    >
                        Salah email? Kembali ke Register
                    </button>
                </div>
            </form>
        )}

        {/* Footer Link (Hanya muncul saat Register) */}
        {step === 'REGISTER' && (
            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-navy-900 font-bold hover:text-gold-500 transition-colors underline decoration-2 underline-offset-4 decoration-gold-200 hover:decoration-gold-500">
                        Login here
                    </Link>
                </p>
            </div>
        )}

      </div>
    </div>
  );
}