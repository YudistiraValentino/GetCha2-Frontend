"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Eye, Search, Loader2, RefreshCw, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation"; 

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function AdminOrdersPage() {
  const router = useRouter(); 
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🔥 1. STATE UNTUK TAB (Default: 'active')
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const fetchOrders = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/admin/login'); 
        return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders`, {
         headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
         }
      });

      const json = await res.json();
      
      if (res.ok) {
        setOrders(json.data || json); 
      } else {
        if (res.status === 401) {
            localStorage.removeItem('token');
            router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error("Gagal fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 2. LOGIKA DELETE ORDER
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus order ini? Data yang dihapus tidak bisa dikembalikan.")) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/orders/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (res.ok) {
            // Update state lokal biar gak perlu fetch ulang (lebih cepat)
            setOrders(prev => prev.filter(o => o.id !== id));
            alert("Order berhasil dihapus.");
        } else {
            alert("Gagal menghapus order.");
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi.");
    }
  };

  // 🔥 3. LOGIKA FILTER TAB & SEARCH
  const filteredOrders = orders.filter(o => {
    // A. Filter Search
    const matchesSearch = 
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // B. Filter Tab
    let matchesTab = false;
    if (activeTab === 'active') {
        // Active = Status selain completed & cancelled
        matchesTab = ['pending', 'confirmed', 'processing', 'ready'].includes(o.status);
    } else if (activeTab === 'completed') {
        matchesTab = o.status === 'completed';
    } else if (activeTab === 'cancelled') {
        matchesTab = o.status === 'cancelled';
    }

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const styles: any = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
        processing: "bg-blue-100 text-blue-700 border-blue-200",
        ready: "bg-teal-100 text-teal-700 border-teal-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Order Management</h1>
            <p className="text-gray-500 text-sm">Monitor and manage incoming orders.</p>
        </div>
        <button onClick={fetchOrders} className="bg-white text-navy-900 px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* 🔥 TAB NAVIGATION (Custom Tab) */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'active' ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
            <Clock size={16} /> Active Tasks
            <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
                {orders.filter(o => ['pending', 'confirmed', 'processing', 'ready'].includes(o.status)).length}
            </span>
        </button>
        <button 
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'completed' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
            <CheckCircle size={16} /> Completed
            <span className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
                {orders.filter(o => o.status === 'completed').length}
            </span>
        </button>
        <button 
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'cancelled' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
            <XCircle size={16} /> Cancelled
            <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
                {orders.filter(o => o.status === 'cancelled').length}
            </span>
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Order No or Customer..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-navy-900 transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Order No</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading && orders.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-navy-900"/></td></tr>
                    ) : filteredOrders.length === 0 ? (
                         <tr><td colSpan={7} className="p-10 text-center text-gray-400">No data in this tab.</td></tr>
                    ) : filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-blue-600">{order.order_number}</td>
                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-navy-900">{order.customer_name}</p>
                                {order.table_number && <p className="text-xs text-gray-400">Table {order.table_number}</p>}
                            </td>
                            <td className="px-6 py-4">
                                {order.order_type === 'dine_in' ? (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">Dine In</span>
                                ) : (
                                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">Take Away</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)} uppercase`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-navy-900">
                                Rp {parseInt(order.total_price).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {/* View Button */}
                                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                        <Eye size={16} />
                                    </Link>
                                    
                                    {/* 🔥 Delete Button */}
                                    <button 
                                        onClick={() => handleDelete(order.id)}
                                        className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}