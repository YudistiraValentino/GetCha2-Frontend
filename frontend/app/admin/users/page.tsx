"use client";

import React, { useEffect, useState } from 'react';
import { Search, Loader2, User, Star, ShoppingBag, Gift, X, Save } from "lucide-react";
import { useRouter } from "next/navigation"; // ✅ Tambah

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminUsersPage() {
  const router = useRouter(); // ✅ Init
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [pointsInput, setPointsInput] = useState("");
  const [updatingPoints, setUpdatingPoints] = useState(false);

  // 1. FETCH USERS
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/admin/login'); return; }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
         headers: { 'Authorization': `Bearer ${token}` } // ✅ Header
      });
      const json = await res.json();
      if (res.ok) setUsers(json.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. OPEN MODAL & FETCH STATS
  const handleViewUser = async (user: any) => {
    const token = localStorage.getItem('token');
    setSelectedUser(user);
    setPointsInput(user.points);
    setIsModalOpen(true);
    setLoadingStats(true);
    setStats(null);

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/users/${user.id}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` } // ✅ Header
        });
        const json = await res.json();
        if (json.success) {
            setStats(json.data.stats);
        }
    } catch (error) {
        console.error("Gagal load stats:", error);
    } finally {
        setLoadingStats(false);
    }
  };

  // 3. UPDATE POINTS
  const handleUpdatePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedUser) return;
    const token = localStorage.getItem('token');
    setUpdatingPoints(true);

    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/users/${selectedUser.id}/points`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ✅ Header
            },
            body: JSON.stringify({ points: parseInt(pointsInput) })
        });
        const json = await res.json();
        
        if (json.success) {
            alert("Poin berhasil diupdate!");
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, points: parseInt(pointsInput) } : u));
            setIsModalOpen(false);
        } else {
            alert("Gagal: " + json.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan sistem.");
    } finally {
        setUpdatingPoints(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900"/></div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Customer Management</h1>
            <p className="text-gray-500 text-sm">View registered users and manage loyalty points.</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-navy-900 transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Current Points</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-navy-900 flex items-center gap-3">
                                <div className="w-8 h-8 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center">
                                    <User size={16}/>
                                </div>
                                {user.name}
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center w-fit gap-1">
                                    <Star size={12} fill="currentColor" /> {user.points} pts
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => handleViewUser(user)} className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gold-500 hover:text-navy-900 transition shadow-sm">
                                    View & Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-400">No users found.</div>}
        </div>
      </div>

      {/* MODAL DETAIL & POINTS */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-navy-900 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <User size={20} className="text-gold-500" /> {selectedUser.name}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition"><X size={20}/></button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                            <p className="text-xs text-blue-500 font-bold uppercase mb-1 flex justify-center gap-1"><ShoppingBag size={12}/> Total Orders</p>
                            {loadingStats ? <Loader2 className="animate-spin mx-auto mt-1" size={16}/> : (
                                <p className="text-2xl font-black text-blue-900">{stats?.total_orders || 0}</p>
                            )}
                        </div>
                        <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 text-center">
                            <p className="text-xs text-pink-500 font-bold uppercase mb-1 flex justify-center gap-1"><Gift size={12}/> Favorite Item</p>
                            {loadingStats ? <Loader2 className="animate-spin mx-auto mt-1" size={16}/> : (
                                <>
                                    <p className="text-sm font-bold text-pink-900 leading-tight line-clamp-1">{stats?.favorite_item || "-"}</p>
                                    <p className="text-[10px] text-pink-400">({stats?.freq_count || 0}x ordered)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6"/>

                    <form onSubmit={handleUpdatePoints}>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Star size={16} className="text-gold-500" fill="currentColor"/> Set Loyalty Points
                        </label>
                        <div className="flex gap-3">
                            <input 
                                type="number" 
                                className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gold-500 font-bold text-navy-900"
                                value={pointsInput}
                                onChange={(e) => setPointsInput(e.target.value)}
                                min="0"
                            />
                            <button 
                                type="submit" 
                                disabled={updatingPoints}
                                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-6 py-2 rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {updatingPoints ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                                Save
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Points will be updated immediately in user app.</p>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}