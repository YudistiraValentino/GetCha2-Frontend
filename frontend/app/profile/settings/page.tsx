"use client";
import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { ArrowLeft, User, Lock, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // State Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // State Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if(user) {
        setName(user.name);
        setEmail(user.email);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("https://getcha2-backend-production.up.railway.app/api/profile/update", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({ name, email })
        });
        
        const json = await res.json();
        
        if (json.success) {
            alert("Profile updated successfully!");
            // Update local storage
            localStorage.setItem("user", JSON.stringify(json.user));
        } else {
            alert("Failed: " + (json.message || "Validation Error"));
        }
    } catch (error) {
        alert("Server Error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== passwordConfirmation) {
        alert("New passwords do not match!");
        return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("https://getcha2-backend-production.up.railway.app/api/profile/password", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({ 
                current_password: currentPassword,
                password: password,
                password_confirmation: passwordConfirmation
            })
        });
        
        const json = await res.json();
        if (json.success) {
            alert("Password changed! Please login again.");
            // Logout user
            localStorage.clear();
            router.push('/login');
        } else {
            alert("Failed: " + (json.message || "Check your old password"));
        }
    } catch (error) {
        alert("Server Error");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />
      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-lg">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-navy-900"><ArrowLeft size={20}/></Link>
            <h1 className="text-2xl font-serif font-bold text-navy-900">Settings</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
            <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-navy-900 text-white shadow-md' : 'text-gray-400 hover:text-navy-900'}`}>
                <User size={16}/> Edit Profile
            </button>
            <button onClick={() => setActiveTab('password')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'password' ? 'bg-navy-900 text-white shadow-md' : 'text-gray-400 hover:text-navy-900'}`}>
                <Lock size={16}/> Security
            </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {activeTab === 'profile' ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-navy-900 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-navy-900 outline-none" />
                    </div>
                    <button disabled={isLoading} className="w-full mt-4 bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
                    </button>
                </form>
            ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Current Password</label>
                        <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-navy-900 outline-none" />
                    </div>
                    <hr className="border-gray-100 my-2"/>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">New Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-navy-900 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Confirm New Password</label>
                        <input type="password" required value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-navy-900 outline-none" />
                    </div>
                    <button disabled={isLoading} className="w-full mt-4 bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Update Password
                    </button>
                </form>
            )}
        </div>

      </div>
    </main>
  );
}